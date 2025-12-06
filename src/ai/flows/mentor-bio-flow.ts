'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a professional
 * mentor biography from a list of bullet points.
 *
 * - generateMentorBio: A server action that takes mentor details and returns a polished bio.
 * - MentorBioInput: The Zod schema for the input data (bullet points).
 * - MentorBioOutput: The Zod schema for the output data (the generated biography).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Zod schema for the input to the mentor bio generation flow.
 * Expects a single string containing bullet points or key details about the mentor.
 */
export const MentorBioInputSchema = z.object({
  details: z
    .string()
    .describe(
      'A string of bullet points or key facts about the mentor (e.g., "10 years experience, Python expert, former Google SDE, enjoys hiking").'
    ),
});
export type MentorBioInput = z.infer<typeof MentorBioInputSchema>;

/**
 * Zod schema for the output of the mentor bio generation flow.
 * Returns a single string containing the polished, professional biography.
 */
export const MentorBioOutputSchema = z.object({
  biography: z
    .string()
    .describe('The generated professional, 3-paragraph mentor biography.'),
});
export type MentorBioOutput = z.infer<typeof MentorBioOutputSchema>;

/**
 * A server action that wraps the Genkit flow. This is the main function
 * that the frontend will call to generate a mentor biography.
 * @param input The mentor details conforming to the MentorBioInput schema.
 * @returns A promise that resolves to the generated biography.
 */
export async function generateMentorBio(
  input: MentorBioInput
): Promise<MentorBioOutput> {
  return await mentorBioFlow(input);
}

// Define the Genkit prompt for the AI model.
const mentorBioPrompt = ai.definePrompt({
  name: 'mentorBioPrompt',
  input: {schema: MentorBioInputSchema},
  output: {schema: MentorBioOutputSchema},
  prompt: `
    You are an expert copywriter specializing in creating compelling and professional biographies for online mentorship platforms.

    Your task is to take the following bullet points and transform them into a polished, professional, and engaging 3-paragraph mentor biography.

    - The tone should be inspiring, approachable, and trustworthy.
    - Highlight their key expertise, years of experience, and any notable achievements or former employers.
    - Weave in any personal interests to make the mentor seem more relatable.
    - Do not use markdown formatting. Output plain text only.

    Mentor Details:
    {{{details}}}
  `,
});

// Define the Genkit flow that uses the prompt to generate the biography.
const mentorBioFlow = ai.defineFlow(
  {
    name: 'mentorBioFlow',
    inputSchema: MentorBioInputSchema,
    outputSchema: MentorBioOutputSchema,
  },
  async input => {
    const {output} = await mentorBioPrompt(input);
    return output!;
  }
);