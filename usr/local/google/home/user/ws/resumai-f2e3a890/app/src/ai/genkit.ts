import {genkit} from 'genkit';
import {googleAI} from '@gen-ai/google-ai';

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY})],
  model: 'googleai/gemini-2.0-flash',
});
