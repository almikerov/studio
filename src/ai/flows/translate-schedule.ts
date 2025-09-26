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
  translations: z.any().describe('An object where keys are the language codes and values are the translated schedule text.')
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
  prompt: `Твоя задача — перевести присланное расписание тренировок на английский язык и отформатировать его для прямой отправки в чат WhatsApp.

**Ключевые инструкции:**

1.  **Перевод:** Используй следующий футбольный вокабуляр:
    * \`зал\`, \`спортзал\` -> \`gym\`
    * \`тренировка\` -> \`training\`
    * \`разминка\` -> \`warm-up\`
    * \`поле\` -> \`pitch\`
    * \`теория\` -> \`analysis\`
    * \`сбор\` -> \`gathering\`
    * \`заезд\` -> \`base stay\`

2.  **Форматирование для WhatsApp:**
    * Весь ответ должен быть единым текстовым блоком, готовым к копированию и вставке.
    * Используй звёздочки, чтобы выделить время и заголовки *жирным шрифтом* (например, *10:00*).
    * Сохраняй структуру списка.

**Пример готового ответа, который ты должен сгенерировать:**

*Расписание на 25.07:*
*09:00* - Gathering
*10:00* - Warm-up
*10:30* - Training on the pitch
*13:30* - Lunch
*16:00* - Analysis
*18:00* - Gym

Теперь, основываясь на этих правилах, переведи и отформатируй следующее расписание:

{{scheduleText}}

Return a JSON object where the 'translations' key holds an object with language codes as keys and the translated text as values.
Only translate to these languages:
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
