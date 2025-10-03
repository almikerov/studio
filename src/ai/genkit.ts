
'use server';

import {genkit, type GenkitOptions} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

let aiInstance: ReturnType<typeof genkit> | undefined;

function getAiInstance(options?: GenkitOptions) {
  if (aiInstance) {
    return aiInstance;
  }
  aiInstance = genkit(options);
  return aiInstance;
}

export const ai = getAiInstance({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
