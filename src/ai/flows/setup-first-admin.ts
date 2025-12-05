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
import { randomBytes } from 'crypto';

const FIRST_ADMIN_EMAIL = 'mmavir89@gmail.com';

const SetupFirstAdminOutputSchema = z.object({
  status: z.string(),
  email: z.string().optional(),
  password: z.string().optional(),
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
    console.log('Checking for existing admin users...');

    try {
        // List all users. For larger user bases, this is inefficient,
        // but for initial setup, it's the most reliable way to check claims.
        const listUsersResult = await auth.listUsers(1000);
        const adminExists = listUsersResult.users.some(user => user.customClaims?.['admin'] === true);

        if (adminExists) {
            console.log('An admin user already exists. Skipping first admin setup.');
            return { status: 'SKIPPED', email: 'An admin user already exists.' };
        }
        
        console.log('No admin users found. Proceeding to create the first admin.');

        let userRecord;
        try {
            // Check if the user exists first.
            userRecord = await auth.getUserByEmail(FIRST_ADMIN_EMAIL);
            console.log(`User ${FIRST_ADMIN_EMAIL} already exists. Setting admin claim.`);
        } catch (error: any) {
             if (error.code === 'auth/user-not-found') {
                // If user does not exist, create them.
                console.log(`User ${FIRST_ADMIN_EMAIL} not found. Creating new user...`);
                const temporaryPassword = randomBytes(12).toString('hex');
                userRecord = await auth.createUser({
                    email: FIRST_ADMIN_EMAIL,
                    password: temporaryPassword,
                    emailVerified: true,
                });
                console.log(`User ${FIRST_ADMIN_EMAIL} created successfully.`);
                
                await auth.setCustomUserClaims(userRecord.uid, { admin: true });
                console.log(`Admin claim set for ${FIRST_ADMIN_EMAIL}.`);

                console.log('*****************************************************');
                console.log('!!! IMPORTANT: FIRST ADMIN USER CREATED !!!');
                console.log(`Email: ${FIRST_ADMIN_EMAIL}`);
                console.log(`Temporary Password: ${temporaryPassword}`);
                console.log('Please log in and change this password.');
                console.log('*****************************************************');

                return {
                    status: 'CREATED',
                    email: FIRST_ADMIN_EMAIL,
                    password: temporaryPassword, // Only return password on creation
                };

            } else {
                // Other error, re-throw it
                throw error;
            }
        }
        
        // If the user existed but didn't have the admin claim
        if (!userRecord.customClaims?.['admin']) {
            await auth.setCustomUserClaims(userRecord.uid, { admin: true });
            console.log(`Admin claim set for existing user ${FIRST_ADMIN_EMAIL}.`);
        } else {
             console.log(`User ${FIRST_ADMIN_EMAIL} already has admin claim.`);
        }
        
        return { status: 'PROMOTED', email: FIRST_ADMIN_EMAIL };

    } catch (error: any) {
      console.error('Error in setupFirstAdminFlow:', error);
      throw new Error(`Failed to set up first admin: ${error.message}`);
    }
  }
);
