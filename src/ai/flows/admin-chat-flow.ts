'use server';
/**
 * @fileOverview A flow for an AI admin assistant that can answer questions about application data.
 * It uses tools to fetch data from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { getSdks } from '@/firebase'; // Using server-side initialization

// Define the input for the reporting tool
const ReportInputSchema = z.object({
  startDate: z
    .string()
    .datetime()
    .describe('The start of the date range in ISO 8601 format.'),
  endDate: z
    .string()
    .datetime()
    .describe('The end of the date range in ISO 8601 format.'),
});

// Define the output of the reporting tool
const ReportOutputSchema = z.object({
  totalEarnings: z.number().describe('The sum of session fees.'),
  totalBookings: z.number().describe('The total count of bookings.'),
});

// Define the Genkit Tool to fetch data
const getReport = ai.defineTool(
  {
    name: 'getReport',
    description:
      'Fetches financial and booking reports for a given date range.',
    inputSchema: ReportInputSchema,
    outputSchema: ReportOutputSchema,
  },
  async ({ startDate, endDate }) => {
    // This is a server-side function, so we initialize Firebase here.
    const { firestore } = getSdks();
    if (!firestore) {
      throw new Error('Firestore is not initialized on the server.');
    }

    const start = Timestamp.fromDate(new Date(startDate));
    const end = Timestamp.fromDate(new Date(endDate));

    const bookingsRef = collection(firestore, 'sessionBookings');
    const q = query(
      bookingsRef,
      where('bookingTime', '>=', start.toDate().toISOString()),
      where('bookingTime', '<=', end.toDate().toISOString())
    );

    const snapshot = await getDocs(q);
    let totalEarnings = 0;
    snapshot.forEach((doc) => {
      totalEarnings += doc.data().sessionFee || 0;
    });

    return {
      totalEarnings,
      totalBookings: snapshot.size,
    };
  }
);

export const adminChatHistory = ai.defineFlow(
  {
    name: 'adminChatHistory',
    inputSchema: z.object({
      history: z.array(z.any()),
      prompt: z.string(),
    }),
    outputSchema: z.string(),
  },
  async ({ history, prompt }) => {
    const llm = ai.getGenerator('googleai/gemini-1.5-flash-latest');

    const result = await llm.generate({
      history,
      prompt,
      tools: [getReport],
      config: {
        // Lower temperature for more factual, less creative responses.
        temperature: 0.1,
      },
    });

    return result.text;
  }
);

export const adminChatStream = ai.defineFlow(
  {
    name: 'adminChatStream',
    inputSchema: z.object({
      history: z.array(z.any()),
      prompt: z.string(),
    }),
    outputSchema: z.string(),
  },
  async ({ history, prompt }) => {
    const llm = ai.getGenerator('googleai/gemini-1.5-flash-latest');
    const { stream } = llm.generateStream({
      history,
      prompt,
      tools: [getReport],
      config: {
        temperature: 0.1,
      },
    });

    let fullText = '';
    for await (const chunk of stream) {
      fullText += chunk.text;
    }
    return fullText;
  }
);
