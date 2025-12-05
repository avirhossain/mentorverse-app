'use server';

/**
 * @fileOverview A server-side flow to set a user as a super admin.
 * THIS IS FOR ONE-TIME SETUP AND DEVELOPMENT PURPOSES.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already done
if (!admin.apps.length) {
  try {
     const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : undefined;

    if (!serviceAccount) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set or is invalid.");
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}


const SuperAdminInputSchema = z.object({
  email: z.string().email().describe('The email of the user to be made a super admin.'),
});
export type SuperAdminInput = z.infer<typeof SuperAdminInputSchema>;

const SuperAdminOutputSchema = z.object({
  uid: z.string(),
  email: z.string(),
  message: z.string(),
});
export type SuperAdminOutput = z.infer<typeof SuperAdminOutputSchema>;

export async function setupSuperAdmin(input: SuperAdminInput): Promise<SuperAdminOutput> {
  return setupSuperAdminFlow(input);
}

const setupSuperAdminFlow = ai.defineFlow(
  {
    name: 'setupSuperAdminFlow',
    inputSchema: SuperAdminInputSchema,
    outputSchema: SuperAdminOutputSchema,
  },
  async (input) => {
    const { email } = input;
    try {
      // Get the user by email
      const userRecord = await admin.auth().getUserByEmail(email);
      const { uid } = userRecord;

      // Get current custom claims
      const currentClaims = userRecord.customClaims || {};

      // Check if admin claim is already true
      if (currentClaims.admin === true) {
        return {
          uid,
          email,
          message: `User ${email} is already an admin. No changes made.`,
        };
      }

      // Set the admin custom claim
      await admin.auth().setCustomUserClaims(uid, { ...currentClaims, admin: true });
      
      return {
        uid,
        email,
        message: `Successfully set admin claim for user ${email}.`,
      };
    } catch (error: any) {
        // If the user does not exist, it's not a critical error for this setup flow.
        if (error.code === 'auth/user-not-found') {
            return {
                uid: 'N/A',
                email: email,
                message: `User with email ${email} not found. Admin claim not set. Please create the user first.`,
            }
        }
      // Re-throw other errors
      throw new Error(`Failed to set admin claim for ${email}: ${error.message}`);
    }
  }
);
