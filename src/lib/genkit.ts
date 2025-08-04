import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Create the OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Export for backward compatibility (will be removed)
export const registry = null; 