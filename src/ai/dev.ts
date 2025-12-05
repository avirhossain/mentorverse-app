
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-mentor-recommendations.ts';
import '@/ai/flows/create-admin-user.ts';
import { setupFirstAdmin } from '@/ai/flows/setup-first-admin';
    
// This code runs once when the Genkit development server starts.
async function runSetup() {
    console.log('DEV server starting up. Running initial setup...');
    try {
        await setupFirstAdmin();
    } catch (e) {
        console.error('Error during initial setup:', e);
    }
    console.log('Initial setup complete.');
}

runSetup();
