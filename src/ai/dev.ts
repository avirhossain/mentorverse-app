
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-mentor-recommendations.ts';
    
// This code runs once when the Genkit development server starts.
async function runSetup() {
    console.log('DEV server starting up.');
    // First admin setup has been removed as it's handled in the Firebase Console.
    console.log('Admin users should be managed in the Firebase Console or via the admin dashboard.');
}

runSetup();
