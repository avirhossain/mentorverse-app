'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-mentor-recommendations.ts';
import { setupSuperAdmin } from '@/ai/flows/setup-super-admin';
import { onFlow } from 'genkit';

// This is a one-time setup to ensure the super admin exists.
// It will run when the Genkit development server starts.
setupSuperAdmin({ email: 'mmavir89@gmail.com' })
    .then(() => {
        console.log('Super admin setup check complete.');
    })
    .catch(error => {
        console.error('Error during super admin setup:', error.message);
    });
