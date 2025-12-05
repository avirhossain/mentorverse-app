'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-mentor-recommendations.ts';
import '@/ai/flows/create-admin-user.ts';
    
// This code runs once when the Genkit development server starts.
    
