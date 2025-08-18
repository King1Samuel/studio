import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {vertexAI} from '@genkit-ai/googleai/vertex';

export const ai = genkit({
  plugins: [googleAI(), vertexAI()],
  model: 'googleai/gemini-2.0-flash',
});
