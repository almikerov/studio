// src/ai/flows/translate-text.ts
'use server';

/**
 * @fileOverview A simple text translation AI agent.
 *
 * - translateText - A function that translates a single string into multiple languages.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguages: z.array(z.string()).describe('The list of target languages to translate the text into.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translations: z.record(z.string()).describe('An object where keys are the language codes and values are the translated texts.')
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  const result = await translateTextFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `You are a translation expert. You will be given a text and a list of target languages.
Your job is to translate the text into each of the target languages.
Return a JSON object where the 'translations' key holds an object with language codes as keys and the translated text as values.

Text:
"{{text}}"

Target Languages:
{{#each targetLanguages}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Output JSON:`, 
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
