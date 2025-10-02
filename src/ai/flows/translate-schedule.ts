
'use server';

/**
 * @fileOverview A schedule translation AI agent.
 *
 * - translateSchedule - A function that translates a schedule into multiple languages.
 * - TranslateScheduleInput - The input type for the translateSchedule function.
 * - TranslateScheduleOutput - The return type for the translateSchedule function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';


const TranslateScheduleInputSchema = z.object({
  descriptions: z.array(z.string()).describe('The schedule item descriptions to translate.'),
  targetLanguages: z.array(z.string()).describe('The target languages to translate the schedule into.'),
});
export type TranslateScheduleInput = z.infer<typeof TranslateScheduleInputSchema>;


const TranslatedItemSchema = z.object({
    original: z.string().describe('The original text.'),
    translations: z.record(z.string()).describe('An object where keys are language codes and values are translated texts.')
});

const TranslateScheduleOutputSchema = z.object({
  results: z.array(TranslatedItemSchema).describe('An array of original-translated text pairs for multiple languages.')
});
export type TranslateScheduleOutput = z.infer<typeof TranslateScheduleOutputSchema>;

const scheduleTranslatorPrompt = ai.definePrompt({
    name: 'scheduleTranslatorPrompt',
    model: 'gemini-1.5-pro',
    input: { schema: TranslateScheduleInputSchema },
    output: { schema: TranslateScheduleOutputSchema },
    prompt: `Your task is to translate a list of schedule items into multiple languages.

**Key vocabulary for translation:**
* \`зал\`, \`спортзал\` -> \`gym\`
* \`тренировка\` -> \`training\`
* \`разминка\` -> \`warm-up\`
* \`поле\` -> \`pitch\`
* \`теория\` -> \`analysis\`
* \`сбор\` -> \`gathering\`
* \`заезд\` -> \`base stay\`
* \`установка\` -> \`instructions\`

Based on these rules, translate the following list of descriptions into {{{targetLanguages}}}:
{{#each descriptions}}- {{{this}}}
{{/each}}

Return a JSON object with a 'results' key. This key should hold an array of objects, where each object has 'original' and a 'translations' object (with language codes as keys). Do not wrap the JSON in markdown.
Example response for target languages "es, fr":
{
  "results": [
    { 
      "original": "Description 1", 
      "translations": { 
        "es": "Translated Description 1 to Spanish",
        "fr": "Translated Description 1 to French"
      } 
    },
    { 
      "original": "Description 2", 
      "translations": { 
        "es": "Translated Description 2 to Spanish",
        "fr": "Translated Description 2 to French"
      } 
    }
  ]
}

Output JSON:`
});


const translateScheduleFlow = ai.defineFlow(
  {
    name: 'translateScheduleFlow',
    inputSchema: TranslateScheduleInputSchema,
    outputSchema: TranslateScheduleOutputSchema,
  },
  async (input) => {
    const { output } = await scheduleTranslatorPrompt(input);
    if (!output) {
      throw new Error("AI response was not valid JSON.");
    }
    return output;
  }
);


export async function translateSchedule(input: TranslateScheduleInput): Promise<TranslateScheduleOutput> {
  try {
    return await translateScheduleFlow(input);
  } catch (error) {
    console.error("AI translation failed.", error);
    throw new Error("AI translation failed.");
  }
}
