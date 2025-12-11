/**
 * @fileoverview This file initializes the Genkit AI platform and exports the configured `ai` object.
 * It uses the Google AI plugin for generative model access. This setup ensures that all AI flows
 * throughout the application use a single, consistent configuration.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the Genkit AI object with the Google AI plugin.
// This `ai` object will be used to define and run all AI flows.
export const ai = genkit({
  plugins: [
    googleAI(), // Enables access to Google's AI models like Gemini.
  ],
  logLevel: 'debug', // Provides detailed logs for development and debugging.
  enableTracingAndMetrics: true, // Enables performance monitoring for AI flows.
});
