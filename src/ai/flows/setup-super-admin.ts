'use server';
/**
 * @fileOverview A flow to set up the initial super admin user.
 */

import * as admin from 'firebase-admin';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Use environment variables for service account credentials
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error in setup-super-admin:', error);
    // Fallback for different environments where it might be initialized differently
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } catch (fallbackError) {
        console.error("Fallback Firebase Admin Initialization failed:", fallbackError);
    }
  }
}

const SetupAdminInputSchema = z.object({
  email: z.string().email().describe('The email of the user to be made an admin.'),
  password: z.string().min(6).describe('The password for the new admin account.'),
});

const SetupAdminOutputSchema = z.object({
  uid: z.string().describe('The UID of the admin user.'),
  message: z.string().describe('A message indicating the result.'),
});

export const setupSuperAdminFlow = ai.defineFlow(
  {
    name: 'setupSuperAdminFlow',
    inputSchema: SetupAdminInputSchema,
    outputSchema: SetupAdminOutputSchema,
  },
  async ({ email, password }) => {
    try {
      let userRecord;
      try {
        // Check if user already exists
        userRecord = await admin.auth().getUserByEmail(email);
        console.log(`Admin setup: User ${email} already exists with UID ${userRecord.uid}.`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // If user does not exist, create them
          console.log(`Admin setup: User ${email} not found, creating a new user...`);
          userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: 'Admin User',
          });
          console.log(`✅ Admin setup: Successfully created new user with UID: ${userRecord.uid}`);
          console.log(`✅ TEMPORARY PASSWORD for ${email}: ${password}`);
        } else {
          // Re-throw other errors
          throw error;
        }
      }

      // At this point, userRecord is guaranteed to be defined.
      // Set custom claims to make the user an admin.
      const currentClaims = userRecord.customClaims || {};
      if (currentClaims.admin === true) {
         return {
            uid: userRecord.uid,
            message: `User ${email} is already an admin. No changes made.`
         };
      }

      console.log(`Admin setup: Setting 'admin:true' custom claim for ${email}...`);
      await admin.auth().setCustomUserClaims(userRecord.uid, { ...currentClaims, admin: true });
      
      return {
        uid: userRecord.uid,
        message: `Successfully granted admin privileges to ${email}.`,
      };

    } catch (error: any) {
      console.error('Error in setupSuperAdminFlow:', error);
      // We must throw the error to indicate failure in the Genkit flow monitor
      throw new Error(`Failed to set up admin user: ${error.message}`);
    }
  }
);
