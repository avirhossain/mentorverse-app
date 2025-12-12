'use server';
/**
 * @fileOverview A collection of reusable Genkit tools for fetching data from Firestore.
 * These tools allow AI flows to query the application's database for real-time information.
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
import { initializeFirebaseOnServer } from '@/firebase/index.server';
import type { Mentor, Session } from '@/lib/types';

// Helper function to get Firestore instance on the server
async function getFirestoreDB() {
  const { firestore } = await initializeFirebaseOnServer();
  return firestore;
}

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

export const getReport = ai.defineTool(
  {
    name: 'getReport',
    description:
      'Fetches financial and booking reports for a given date range.',
    inputSchema: ReportInputSchema,
    outputSchema: ReportOutputSchema,
  },
  async ({ startDate, endDate }) => {
    const firestore = await getFirestoreDB();
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

// #region Data Querying Tools

export const getTotalMentors = ai.defineTool(
  {
    name: 'getTotalMentors',
    description: 'Gets the total number of active mentors.',
    outputSchema: z.object({ count: z.number() }),
  },
  async () => {
    const firestore = await getFirestoreDB();
    const mentorsRef = collection(firestore, 'mentors');
    const q = query(mentorsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return { count: snapshot.size };
  }
);

export const getUpcomingSessions = ai.defineTool(
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
    const firestore = await getFirestoreDB();
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

export const recommendMentor = ai.defineTool(
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
    const firestore = await getFirestoreDB();
    const mentorsRef = collection(firestore, 'mentors');
    // Firestore 'array-contains' is case-sensitive. Convert to lowercase for broader matching.
    // This requires storing expertise in lowercase or handling it client-side if needed.
    // For now, we'll do a direct match. A more robust solution might use a search service like Algolia.
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
