import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
if (!GEMINI_KEY || GEMINI_KEY.includes('your_') || GEMINI_KEY.includes('replace')) {
  console.warn('GEMINI_API_KEY is not set or looks like a placeholder. Set a valid key in .env.local to enable Google Generative API calls.');
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: GEMINI_KEY })],
  model: 'googleai/gemini-2.5-flash',
});
