// src/ai/flows/translate-schedule.ts
'use server';

/**
 * @fileOverview A schedule translation AI agent.
 *
 * - translateSchedule - A function that translates a schedule into multiple languages.
 * - TranslateScheduleInput - The input type for the translateSchedule function.
 * - TranslateScheduleOutput - The return type for the translateSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateScheduleInputSchema = z.object({
  scheduleText: z.string().describe('The schedule text to translate.'),
  targetLanguages: z.array(z.string()).describe('The list of target languages to translate the schedule into.'),
});
export type TranslateScheduleInput = z.infer<typeof TranslateScheduleInputSchema>;

const TranslateScheduleOutputSchema = z.object({
  translations: z.record(z.string(), z.string()).describe('A map of language code to translated schedule text. The keys should be the language codes provided in the input, and the values should be the translated schedule text.')
});
export type TranslateScheduleOutput = z.infer<typeof TranslateScheduleOutputSchema>;

export async function translateSchedule(input: TranslateScheduleInput): Promise<Record<string, string>> {
  const result = await translateScheduleFlow(input);
  return result.translations;
}

const prompt = ai.definePrompt({
  name: 'translateSchedulePrompt',
  input: {schema: TranslateScheduleInputSchema},
  output: {schema: TranslateScheduleOutputSchema},
  prompt: `You are a translation expert. You will be given a schedule and a list of target languages.
Your job is to translate the schedule into each of the target languages and return a JSON object where the 'translations' key holds an object with language codes as keys and the translated schedules as values.

Schedule:
{{scheduleText}}

Target Languages:
{{#each targetLanguages}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Output JSON:`, 
});

const translateScheduleFlow = ai.defineFlow(
  {
    name: 'translateScheduleFlow',
    inputSchema: TranslateScheduleInputSchema,
    outputSchema: TranslateScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
