'use server';

import { getPersonalizedRecommendations, type PersonalizedRecommendationsInput } from '@/ai/flows/personalized-mentor-recommendations';
import { mentors, sessions } from '@/lib/data';
import type { Mentor, Session } from '@/lib/types';

type RecommendationResult = {
  mentors: Mentor[];
  sessions: Session[];
  reason: string;
};

// A simple fuzzy search to find items from the AI's string recommendations
function fuzzyFind<T extends { name: string } | { title: string }>(list: T[], name: string): T | undefined {
  const lowerCaseName = name.toLowerCase();
  return list.find(item => {
    const itemName = 'name' in item ? item.name : item.title;
    return itemName.toLowerCase().includes(lowerCaseName);
  });
}

export async function getRecommendationsAction(
  input: PersonalizedRecommendationsInput
): Promise<{ error: string } | RecommendationResult> {
  try {
    const result = await getPersonalizedRecommendations(input);

    const recommendedMentors: Mentor[] = result.recommendedMentors
      .map(name => fuzzyFind(mentors, name))
      .filter((m): m is Mentor => !!m);
      
    const recommendedSessions: Session[] = result.recommendedSessions
      .map(title => fuzzyFind(sessions, title))
      .filter((s): s is Session => !!s);

    return {
      mentors: recommendedMentors,
      sessions: recommendedSessions,
      reason: result.reason,
    };
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return { error: 'Sorry, we were unable to get recommendations at this time. Please try again later.' };
  }
}
