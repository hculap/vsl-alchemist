import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { openAICompatible } from '@genkit-ai/compat-oai';
import dotenv from 'dotenv';

dotenv.config();

// Create the genkit instance
export const g = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
      apiVersion: 'v1'
    }),
    openAICompatible({
      name: 'openai',
      apiKey: process.env.OPENAI_API_KEY
    })
  ]
});

// Export the registry for use in actions
export const registry = g.registry; 