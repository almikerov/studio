
'use server';

/**
 * @fileOverview An AI agent for translating text into multiple languages.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLangs: z.array(z.string()).describe('An array of ISO 639-1 language codes to translate the text into.'),
  apiKeys: z.array(z.string()).describe('A list of API keys for the AI service to try.'),
  model: z.string().describe('The AI model to use for translation.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

// The output schema will be a dynamic object where keys are language codes.
const TranslateTextOutputSchema = z.record(z.string());
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  const { text, targetLangs, apiKeys, model } = input;

  if (!text.trim() || targetLangs.length === 0) {
    return {};
  }
  if (!apiKeys || apiKeys.length === 0) {
    throw new Error("No API keys provided.");
  }


  const dynamicOutputSchema = z.object(
    targetLangs.reduce((acc, lang) => {
      acc[lang] = z.string().describe(`The translated text in ${lang}.`);
      return acc;
    }, {} as Record<string, z.ZodString>)
  );

  const prompt = `Translate the following text into the specified languages.
The original text is in Russian.
Your output MUST be a valid JSON object matching the requested schema. Do not include any other text or markdown formatting.

Original text: "${text}"

Target languages: ${targetLangs.join(', ')}
`;

  let lastError: any = null;

  for (const apiKey of apiKeys) {
    try {
      const ai = genkit({
        plugins: [googleAI({ apiKey })],
      });

      const { output } = await ai.generate({
        model: `googleai/${model}`,
        prompt: prompt,
        output: {
          format: 'json',
          schema: dynamicOutputSchema,
        },
      });

      if (output) {
        return output;
      }
    } catch (e) {
      lastError = e;
      console.warn(`API key ending in ...${apiKey.slice(-4)} failed. Trying next key.`);
    }
  }

  if (lastError) {
    throw lastError;
  }
  
  throw new Error("AI returned no output for translation after trying all keys.");
}
