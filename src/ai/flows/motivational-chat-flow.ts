'use server';
/**
 * @fileOverview A flow for an AI career coach that provides motivation and guidance.
 * It can also answer questions about the platform's mentors and sessions using tools.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  getTotalMentors,
  getUpcomingSessions,
  recommendMentor,
} from './tools';

// Define the input schema for the chat flow
const ChatInputSchema = z.object({
  history: z.array(z.any()),
  prompt: z.string(),
});

/**
 * A streaming flow that acts as a motivational career coach.
 * It takes conversation history and a user prompt, and streams back the AI's response.
 * It can use tools to answer questions about the platform.
 */
export const motivationalChatStream = ai.defineFlow(
  {
    name: 'motivationalChatStream',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(), // The final output is the full string
  },
  async ({ history, prompt }) => {
    // Generate the response from the LLM.
    const result = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      history,
      prompt,
      system: `You are MentorBot, an AI career coach from MenTees. Your purpose is to provide motivation and general guidance on the importance of mentorship and having a successful career. Be encouraging, positive, and inspiring. 

      You can also answer questions about the platform. Use the tools provided to answer questions about mentors and sessions. For example, if a user asks for a recommendation, use the 'recommendMentor' tool. If they ask about upcoming events, use the 'getUpcomingSessions' tool.

      Keep your answers concise and easy to understand. Do not answer questions that are not related to careers, personal development, or mentorship.`,
      tools: [getTotalMentors, getUpcomingSessions, recommendMentor],
      config: {
        temperature: 0.5,
      },
    });

    // Return the final text content, which matches the outputSchema.
    return result.text;
  }
);
