
'use server';
import { ai } from './genkit';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// The default export for the Genkit development server should be the
// Genkit configuration object itself.
export default ai;
