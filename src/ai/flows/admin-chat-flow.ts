'use server';
/**
 * @fileOverview A flow for an AI admin assistant that can answer questions about application data.
 * It uses tools to fetch data from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  getReport,
  getTotalMentors,
  getUpcomingSessions,
  recommendMentor,
} from './tools';

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
