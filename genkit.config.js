import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { openai } from '@genkit-ai/compat-oai';
import dotenv from 'dotenv';

dotenv.config();

export default genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
      apiVersion: 'v1'
    }),
    openai({
      apiKey: process.env.OPENAI_API_KEY
    })
  ]
});