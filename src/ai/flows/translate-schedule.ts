
'use server';

/**
 * @fileOverview A schedule translation AI agent.
 *
 * - translateSchedule - A function that translates a schedule into multiple languages.
 * - TranslateScheduleInput - The input type for the translateSchedule function.
 * - TranslateScheduleOutput - The return type for the translateSchedule function.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const TranslateScheduleInputSchema = z.object({
  descriptions: z.array(z.string()).describe('The schedule item descriptions to translate.'),
  targetLanguage: z.string().describe('The target language to translate the schedule into.'),
});
export type TranslateScheduleInput = z.infer<typeof TranslateScheduleInputSchema>;

const TranslatedItemSchema = z.object({
    original: z.string().describe('The original text.'),
    translated: z.string().describe('The translated text.')
});

const TranslateScheduleOutputSchema = z.object({
  translations: z.array(TranslatedItemSchema).describe('An array of original-translated text pairs.')
});
export type TranslateScheduleOutput = z.infer<typeof TranslateScheduleOutputSchema>;

export async function translateSchedule(input: TranslateScheduleInput, apiKey: string): Promise<TranslateScheduleOutput> {
  if (!apiKey) {
    throw new Error('API key is not provided');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


  const prompt = `Your task is to translate a list of schedule items.

**Key vocabulary for translation:**
* \`зал\`, \`спортзал\` -> \`gym\`
* \`тренировка\` -> \`training\`
* \`разминка\` -> \`warm-up\`
* \`поле\` -> \`pitch\`
* \`теория\` -> \`analysis\`
* \`сбор\` -> \`gathering\`
* \`заезд\` -> \`base stay\`
* \`установка\` -> \`instructions\`

Based on these rules, translate the following list of descriptions into ${input.targetLanguage}:
${input.descriptions.map(d => `- ${d}`).join('\n')}

Return a JSON object with a 'translations' key. This key should hold an array of objects, where each object has 'original' and 'translated' properties. Do not wrap the JSON in markdown.
Example response:
{
  "translations": [
    { "original": "Description 1", "translated": "Translated Description 1" },
    { "original": "Description 2", "translated": "Translated Description 2" }
  ]
}

Output JSON:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in the AI response.");
    }
    const jsonString = jsonMatch[0];
    const parsedJson = JSON.parse(jsonString);
    return TranslateScheduleOutputSchema.parse(parsedJson);
  } catch (error) {
    console.error("Failed to parse AI response:", rawText, error);
    throw new Error("AI response was not valid JSON.");
  }
}
