
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-mentor-recommendations.ts';
import { setupSuperAdminFlow } from '@/ai/flows/setup-super-admin';
    
// This code runs once when the Genkit development server starts.
// It ensures that the initial super admin account exists.
(async () => {
    try {
        console.log("Running one-time admin setup...");
        const result = await setupSuperAdminFlow({
            email: 'mmavir89@gmail.com',
            // This password is only used if the user doesn't exist.
            // It's a secure, randomly generated password.
            password: `TempPass-${Math.random().toString(36).slice(-8)}`,
        });
        console.log(result.message);
    } catch (error) {
        console.error("Failed to run one-time admin setup:", error.message);
    }
})();
    
