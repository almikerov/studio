import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GENKIT_API_KEY})],
  model: 'googleai/gemini-1.5-flash-latest',
});
