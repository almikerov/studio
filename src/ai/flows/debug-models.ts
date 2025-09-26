
'use server';

/**
 * @fileOverview A debug tool to test different Gemini models.
 *
 * - debugModels - A function that tests a list of models with a given API key and project ID.
 * - DebugModelsOutput - The return type for the debugModels function.
 */

import { VertexAI } from '@google-cloud/vertexai';
import { z } from 'zod';

const DebugModelsInputSchema = z.object({
  apiKey: z.string(),
  projectId: z.string(),
});
export type DebugModelsInput = z.infer<typeof DebugModelsInputSchema>;

const DebugModelsOutputSchema = z.object({
  successful: z.array(z.string()).describe('List of models that succeeded.'),
  failed: z.array(z.object({
    model: z.string(),
    error: z.string(),
  })).describe('List of models that failed with their error messages.'),
});
export type DebugModelsOutput = z.infer<typeof DebugModelsOutputSchema>;

const MODELS_TO_TEST = [
    'gemini-1.5-flash-001',
    'gemini-1.5-pro-001',
    'gemini-pro',
];

export async function debugModels(input: DebugModelsInput): Promise<DebugModelsOutput> {
  if (!input.apiKey) {
    throw new Error('API key is not provided');
  }
  if (!input.projectId) {
    throw new Error('Project ID is not provided');
  }

  const vertexAI = new VertexAI({
    project: input.projectId,
    location: 'us-central1',
  });
  
  const successful: string[] = [];
  const failed: { model: string, error: string }[] = [];

  for (const modelName of MODELS_TO_TEST) {
    try {
      const model = vertexAI.getGenerativeModel({ model: modelName, generationConfig: {
        // @ts-ignore
        apiKey: input.apiKey,
      } });
      await model.generateContent("hello");
      successful.push(modelName);
    } catch (e: any) {
      failed.push({ model: modelName, error: e.message || 'Unknown error' });
    }
  }

  return { successful, failed };
}
