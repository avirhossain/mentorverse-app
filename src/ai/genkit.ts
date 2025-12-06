/**
 * @fileoverview This file initializes and configures the Genkit AI platform.
 * It sets up the necessary plugins, in this case, the Google AI plugin for Gemini,
 * and exports a configured `ai` instance for use throughout the application.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Initialize the Genkit AI platform with the Google AI plugin.
// This allows the application to use Google's generative AI models (e.g., Gemini).
// The GENAI_API_KEY environment variable must be set for this to work.
export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
});