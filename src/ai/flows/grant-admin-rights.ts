'use server';

/**
 * @fileOverview A server-side flow for securely setting the admin custom claim
 * for the hardcoded admin email address.
 */

import { ai } from '@/ai/genkit';
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdmin } from './firebase-admin';
import { z } from 'zod';

// This is the user who will be granted admin rights.
const ADMIN_EMAIL = 'mmavir89@gmail.com';

const GrantAdminRightsOutputSchema = z.object({
  status: z.enum(['SUCCESS', 'ERROR', 'ALREADY_ADMIN']),
  message: z.string(),
});

export async function grantAdminRights(): Promise<z.infer<typeof GrantAdminRightsOutputSchema>> {
    return grantAdminRightsFlow();
}

const grantAdminRightsFlow = ai.defineFlow(
  {
    name: 'grantAdminRightsFlow',
    outputSchema: GrantAdminRightsOutputSchema,
  },
  async () => {
    console.log(`Attempting to grant admin rights to ${ADMIN_EMAIL}...`);
    
    try {
      await initFirebaseAdmin();
      const auth = getAuth();

      const userRecord = await auth.getUserByEmail(ADMIN_EMAIL);

      if (userRecord.customClaims?.['admin'] === true) {
        console.log(`User ${ADMIN_EMAIL} is already an admin.`);
        return { status: 'ALREADY_ADMIN', message: 'User is already an admin.' };
      }

      await auth.setCustomUserClaims(userRecord.uid, { admin: true });
      console.log(`Successfully granted admin rights to ${ADMIN_EMAIL}.`);
      return { status: 'SUCCESS', message: `Admin rights granted to ${ADMIN_EMAIL}.` };

    } catch (error: any) {
      console.error('Error in grantAdminRightsFlow:', error);
      if (error.code === 'auth/user-not-found') {
        return { status: 'ERROR', message: `User ${ADMIN_EMAIL} not found. Please log in first.` };
      }
      return { status: 'ERROR', message: error.message || 'An unknown error occurred.' };
    }
  }
);
