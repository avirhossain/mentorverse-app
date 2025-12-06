
'use server';

/**
 * @fileOverview A server-side flow for securely setting up the first admin user
 * if one does not already exist. This is intended to run once on server startup.
 * - setupFirstAdmin - Checks for and creates the initial admin user.
 */

import { ai } from '@/ai/genkit';
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdmin } from './firebase-admin';
import { z } from 'zod';

const FIRST_ADMIN_EMAIL = 'mmavir89@gmail.com';

const SetupFirstAdminOutputSchema = z.object({
  status: z.string(),
  email: z.string().optional(),
});

export async function setupFirstAdmin(): Promise<z.infer<typeof SetupFirstAdminOutputSchema>> {
    return setupFirstAdminFlow();
}

const setupFirstAdminFlow = ai.defineFlow(
  {
    name: 'setupFirstAdminFlow',
    outputSchema: SetupFirstAdminOutputSchema,
  },
  async () => {
    await initFirebaseAdmin();
    const auth = getAuth();
    console.log(`Ensuring admin claim for user: ${FIRST_ADMIN_EMAIL}...`);

    try {
        const userRecord = await auth.getUserByEmail(FIRST_ADMIN_EMAIL);

        // User exists, check if they are already an admin.
        if (userRecord.customClaims?.['admin'] === true) {
            console.log(`User ${FIRST_ADMIN_EMAIL} is already an admin. No action needed.`);
            return { status: 'SKIPPED', email: FIRST_ADMIN_EMAIL };
        }

        // User exists but is not an admin, so promote them.
        await auth.setCustomUserClaims(userRecord.uid, { admin: true });
        console.log('*****************************************************');
        console.log(`SUCCESS: Promoted existing user ${FIRST_ADMIN_EMAIL} to admin.`);
        console.log('You can now log in with your existing password.');
        console.log('*****************************************************');
        
        return { status: 'PROMOTED', email: FIRST_ADMIN_EMAIL };

    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            // This is the expected state if the user has not been created yet.
            console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            console.error(`ACTION REQUIRED: User ${FIRST_ADMIN_EMAIL} not found.`);
            console.error(`Please create this user in the Firebase Authentication console.`);
            console.error('This setup flow will grant them admin privileges on the next server start.');
            console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            return { status: 'USER_NOT_FOUND', email: FIRST_ADMIN_EMAIL };
        } else {
            // Other unexpected errors.
            console.error('Error in setupFirstAdminFlow:', error);
            throw new Error(`Failed to set up first admin: ${error.message}`);
        }
    }
  }
);
