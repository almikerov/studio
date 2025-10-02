
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

export { z };
