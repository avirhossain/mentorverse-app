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
  limit,
  orderBy,
} from 'firebase/firestore';
import { getSdks } from '@/firebase'; // Using server-side initialization
import { Mentor, Session } from '@/lib/types';

// #region Reporting Tool
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

const ReportOutputSchema = z.object({
  totalEarnings: z.number().describe('The sum of session fees.'),
  totalBookings: z.number().describe('The total count of bookings.'),
});

const getReport = ai.defineTool(
  {
    name: 'getReport',
    description:
      'Fetches financial and booking reports for a given date range.',
    inputSchema: ReportInputSchema,
    outputSchema: ReportOutputSchema,
  },
  async ({ startDate, endDate }) => {
    const { firestore } = getSdks();
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
// #endregion

// #region New Tools for Data Querying

const getTotalMentors = ai.defineTool(
  {
    name: 'getTotalMentors',
    description: 'Gets the total number of active mentors.',
    outputSchema: z.object({ count: z.number() }),
  },
  async () => {
    const { firestore } = getSdks();
    const mentorsRef = collection(firestore, 'mentors');
    const q = query(mentorsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return { count: snapshot.size };
  }
);

const getUpcomingSessions = ai.defineTool(
  {
    name: 'getUpcomingSessions',
    description: 'Gets a list of the next 3 upcoming active sessions.',
    outputSchema: z.array(
      z.object({
        name: z.string(),
        mentorName: z.string(),
        scheduledDate: z.string(),
      })
    ),
  },
  async () => {
    const { firestore } = getSdks();
    const sessionsRef = collection(firestore, 'sessions');
    const q = query(
      sessionsRef,
      where('status', '==', 'Active'),
      where('scheduledDate', '>=', new Date().toISOString().split('T')[0]),
      orderBy('scheduledDate', 'asc'),
      limit(3)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Session;
      return {
        name: data.name,
        mentorName: data.mentorName,
        scheduledDate: data.scheduledDate || 'Not scheduled',
      };
    });
  }
);

const recommendMentor = ai.defineTool(
  {
    name: 'recommendMentor',
    description: 'Recommends a mentor based on a specific area of expertise.',
    inputSchema: z.object({
      expertise: z
        .string()
        .describe('The skill or area of expertise to search for.'),
    }),
    outputSchema: z.array(
      z.object({
        name: z.string(),
        designation: z.string().optional(),
        expertise: z.array(z.string()).optional(),
      })
    ),
  },
  async ({ expertise }) => {
    const { firestore } = getSdks();
    const mentorsRef = collection(firestore, 'mentors');
    const q = query(
      mentorsRef,
      where('expertise', 'array-contains', expertise)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Mentor;
      return {
        name: data.name,
        designation: data.designation,
        expertise: data.expertise,
      };
    });
  }
);

// #endregion

// This is the primary streaming flow for the Admin Chat UI.
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
    // Generate the response from the LLM.
    const result = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      history,
      prompt,
      system: `You are an admin assistant for the MenTees platform. Your role is to answer questions about the platform's data. Use the provided tools to answer questions about mentors, sessions, and reports. Be concise and helpful.`,
      tools: [getReport, getTotalMentors, getUpcomingSessions, recommendMentor],
      config: {
        temperature: 0.1,
      },
    });

    // Return the final text content, which matches the outputSchema.
    return result.text;
  }
);
