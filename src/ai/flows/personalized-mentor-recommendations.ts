
'use server';

/**
 * @fileOverview Personalized mentor and session recommendations based on mentee profile and goals.
 *
 * - getPersonalizedRecommendations - A function that returns personalized mentor and session recommendations.
 * - PersonalizedRecommendationsInput - The input type for the getPersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the getPersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PersonalizedRecommendationsInputSchema = z.object({
  menteeProfile: z.string().describe('The profile of the mentee, including their interests and experience.'),
  mentorshipGoal: z.string().describe('The stated goal of the mentee for this mentorship.'),
  sessionHistory: z.string().describe('The mentee session history.'),
});
export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendedMentors: z.array(z.string()).describe('A list of recommended mentor profiles.'),
  recommendedSessions: z.array(z.string()).describe('A list of recommended unique sessions.'),
  reason: z.string().describe('Explanation of why these mentors and sessions are recommended.'),
});
export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}

const personalizedRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized mentor and session recommendations to mentees.

  Based on the mentee's profile, mentorship goal, and session history, identify the most relevant mentors and unique sessions that can help them achieve their objectives.

  Mentee Profile: {{{menteeProfile}}}
  Mentorship Goal: {{{mentorshipGoal}}}
  Session History: {{{sessionHistory}}}

  Consider the mentee's interests, experience level, and learning preferences when making your recommendations. Also, explain your reasoning for each recommendation.

  Output the recommendations as a JSON object.
  `,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await personalizedRecommendationsPrompt(input);
    return output!;
  }
);
