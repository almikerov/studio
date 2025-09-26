
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
  scheduleText: z.string().describe('The schedule text to translate.'),
  targetLanguages: z.array(z.string()).describe('The list of target languages to translate the schedule into.'),
});
export type TranslateScheduleInput = z.infer<typeof TranslateScheduleInputSchema>;

const TranslateScheduleOutputSchema = z.object({
  translations: z.record(z.string()).describe('An object where keys are the language codes and values are the translated schedule text.')
});
export type TranslateScheduleOutput = z.infer<typeof TranslateScheduleOutputSchema>;

export async function translateSchedule(input: TranslateScheduleInput, apiKey: string): Promise<Record<string, string>> {
  if (!apiKey) {
    throw new Error('API key is not provided');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const languages = input.targetLanguages.join(', ');

  const prompt = `Твоя задача — перевести присланное расписание тренировок.

**Ключевые инструкции по переводу:**
Используй следующий футбольный вокабуляр:
* \`зал\`, \`спортзал\` -> \`gym\`
* \`тренировка\` -> \`training\`
* \`разминка\` -> \`warm-up\`
* \`поле\` -> \`pitch\`
* \`теория\` -> \`analysis\`
* \`сбор\` -> \`gathering\`
* \`заезд\` -> \`base stay\`

Теперь, основываясь на этих правилах, переведи следующее расписание:
${input.scheduleText}

Return a JSON object where the 'translations' key holds an object with language codes as keys and the translated text as values. The translated text should be a single string with line breaks. Do not wrap the JSON in markdown.
Only translate to these languages:
${languages}

Output JSON:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedJson = JSON.parse(cleanedText);
    const validated = TranslateScheduleOutputSchema.parse(parsedJson);
    return validated.translations;
  } catch (error) {
    console.error("Failed to parse AI response:", text, error);
    throw new Error("AI response was not valid JSON.");
  }
}
