'use server';

/**
 * @fileOverview A server-side flow for securely creating a new admin user.
 * - createAdminUser - Creates a user and sets their admin claim.
 * - CreateAdminUserInput - The input type for the createAdminUser function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdmin } from './firebase-admin';

export const CreateAdminUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type CreateAdminUserInput = z.infer<typeof CreateAdminUserInputSchema>;

export const CreateAdminUserOutputSchema = z.object({
  uid: z.string(),
  email: z.string(),
});
export type CreateAdminUserOutput = z.infer<typeof CreateAdminUserOutputSchema>;

export async function createAdminUser(input: CreateAdminUserInput): Promise<CreateAdminUserOutput> {
  return createAdminUserFlow(input);
}

const createAdminUserFlow = ai.defineFlow(
  {
    name: 'createAdminUserFlow',
    inputSchema: CreateAdminUserInputSchema,
    outputSchema: CreateAdminUserOutputSchema,
  },
  async ({ email, password }) => {
    await initFirebaseAdmin();
    const auth = getAuth();

    try {
      // Create the user
      const userRecord = await auth.createUser({
        email: email,
        password: password,
      });

      // Set the admin custom claim
      await auth.setCustomUserClaims(userRecord.uid, { admin: true });

      console.log(`Successfully created new admin user: ${email} (UID: ${userRecord.uid})`);

      return {
        uid: userRecord.uid,
        email: userRecord.email!,
      };
    } catch (error: any) {
      console.error('Error in createAdminUserFlow:', error);
      // Throw a more descriptive error for the client
      if (error.code === 'auth/email-already-exists') {
        throw new Error('An account with this email already exists.');
      }
      throw new Error('Failed to create admin user.');
    }
  }
);
