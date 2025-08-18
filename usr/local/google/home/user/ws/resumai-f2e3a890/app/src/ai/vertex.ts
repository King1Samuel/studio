import {genkit} from 'genkit';
import {vertexAI} from '@genkit-ai/googleai/vertex';

export const ai = genkit({
  plugins: [vertexAI()],
  model: 'googleai/gemini-2.0-flash',
});
