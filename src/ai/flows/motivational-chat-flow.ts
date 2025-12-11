
'use server';
/**
 * @fileOverview A flow for an AI career coach that provides motivation and guidance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { streamFlow } from 'genkit/experimental/stream';

// Define the input schema for the chat flow
const ChatInputSchema = z.object({
  history: z.array(z.any()),
  prompt: z.string(),
});

// Define the output schema for the streaming chunks
const ChatOutputSchema = z.object({
  content: z.string(),
});

/**
 * A streaming flow that acts as a motivational career coach.
 * It takes conversation history and a user prompt, and streams back the AI's response.
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
      system: `You are MentorBot, an AI career coach from Mentees. Your purpose is to provide motivation and general guidance on the importance of mentorship and having a successful career. Be encouraging, positive, and inspiring. Keep your answers concise and easy to understand. Do not answer questions that are not related to careers, personal development, or mentorship.`,
      config: {
        temperature: 0.5,
      },
    });

    // Return the final text content, which matches the outputSchema.
    return result.text;
  }
);
