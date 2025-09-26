// src/ai/flows/debug-models.ts
'use server';

/**
 * @fileOverview A debug tool to test different Gemini models.
 *
 * - debugModels - A function that tests a list of models with a given API key.
 * - DebugModelsOutput - The return type for the debugModels function.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const DebugModelsOutputSchema = z.object({
  successful: z.array(z.string()).describe('List of models that succeeded.'),
  failed: z.array(z.object({
    model: z.string(),
    error: z.string(),
  })).describe('List of models that failed with their error messages.'),
});
export type DebugModelsOutput = z.infer<typeof DebugModelsOutputSchema>;

const MODELS_TO_TEST = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
];

export async function debugModels(apiKey: string): Promise<DebugModelsOutput> {
  if (!apiKey) {
    throw new Error('API key is not provided');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const successful: string[] = [];
  const failed: { model: string, error: string }[] = [];

  for (const modelName of MODELS_TO_TEST) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      await model.generateContent("hello");
      successful.push(modelName);
    } catch (e: any) {
      failed.push({ model: modelName, error: e.message || 'Unknown error' });
    }
  }

  return { successful, failed };
}
