
'use server';

/**
 * @fileOverview An AI agent for translating text into multiple languages in a single batch.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

const TranslationItemSchema = z.object({
  id: z.string().describe('The unique identifier for the text item.'),
  text: z.string().describe('The text to translate.'),
});

const TranslateTextInputSchema = z.object({
  items: z.array(TranslationItemSchema).describe('An array of items to translate.'),
  targetLangs: z.array(z.string()).describe('An array of ISO 639-1 language codes to translate the text into.'),
  apiKeys: z.array(z.string()).describe('A list of API keys for the AI service to try.'),
  model: z.string().describe('The AI model to use for translation.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

// The output schema will be a dynamic object where keys are item IDs.
// Each value is another object where keys are language codes.
const TranslateTextOutputSchema = z.record(z.record(z.string()));
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;


export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  const { items, targetLangs, apiKeys, model } = input;

  if (items.length === 0 || targetLangs.length === 0) {
    return {};
  }
  if (!apiKeys || apiKeys.length === 0) {
    throw new Error("No API keys provided.");
  }
  
  // Create a dynamic output schema based on the input items and target languages
  const dynamicOutputSchema = z.object(
    items.reduce((acc, item) => {
      acc[item.id] = z.object(
        targetLangs.reduce((langAcc, lang) => {
          langAcc[lang] = z.string().describe(`Translation of '${item.text.substring(0, 20)}...' into ${lang}`);
          return langAcc;
        }, {} as Record<string, z.ZodString>)
      );
      return acc;
    }, {} as Record<string, z.ZodObject<any>>)
  );

  const prompt = `You are a translation expert. Translate the list of items provided in the JSON below.
The original text is in Russian.

When translating to English, use the following glossary for football-related terms:
- 'зал', 'спортзал' -> 'gym'
- 'тренировка' -> 'training'
- 'разминка' -> 'warm-up'
- 'поле' -> 'pitch'
- 'теория' -> 'analysis'
- 'сбор' -> 'gathering'
- 'заезд' -> 'base stay'

Your output MUST be a valid JSON object matching the requested schema. The keys of the output object must be the 'id's from the input items. Each value must be an object containing the translations for the specified target languages. Do not include any other text or markdown formatting.

Target languages: ${targetLangs.join(', ')}

Input items to translate:
${JSON.stringify(items, null, 2)}
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
