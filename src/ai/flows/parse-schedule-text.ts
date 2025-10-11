
'use server';

/**
 * @fileOverview An AI agent for parsing schedule from raw text.
 *
 * - parseScheduleFromText - A function that parses a schedule from a string.
 * - ParseScheduleTextInput - The input type for the parseScheduleFromText function.
 * - ParseScheduleTextOutput - The return type for the parseScheduleTextOutput function.
 */

import {genkit} from 'genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const ParseScheduleTextInputSchema = z.object({
  text: z.string().describe('The raw text containing schedule information.'),
  apiKeys: z
    .array(z.string())
    .describe('A list of API keys for the AI service to try.'),
  model: z.string().describe('The AI model to use for parsing.'),
});
export type ParseScheduleTextInput = z.infer<
  typeof ParseScheduleTextInputSchema
>;

const ParsedScheduleItemSchema = z.object({
  time: z
    .string()
    .describe(
      "The time of the event in HH:mm format. Must be an empty string '' for all types except 'timed'."
    )
    .optional(),
  description: z.string().describe('The description of the schedule event.'),
  icon: z
    .enum([
      'football-field',
      'dumbbell',
      'passport',
      'plane-takeoff',
      'plane-landing',
      'camera',
      'utensils',
      'bed',
      'stadium',
      'document',
      'home',
      'bus',
      'soccer-ball',
      'lock',
      'moon',
      'cake',
      'shirt',
    ])
    .optional()
    .describe('An icon for the event.'),
  type: z
    .enum(['timed', 'untimed', 'comment', 'date', 'h1', 'h2', 'h3'])
    .describe('The type of the schedule item.'),
  date: z
    .string()
    .optional()
    .describe(
      "The date for 'date' type items in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)."
    ),
});

const ParseScheduleTextOutputSchema = z.object({
  cardTitle: z
    .string()
    .describe(
      'The title for the schedule card. If not specified in the text, generate a suitable one.'
    ),
  schedule: z
    .array(ParsedScheduleItemSchema)
    .describe('An array of schedule items parsed from the text.'),
});
export type ParseScheduleTextOutput = z.infer<
  typeof ParseScheduleTextOutputSchema
>;

export async function parseScheduleFromText(
  input: ParseScheduleTextInput
): Promise<ParseScheduleTextOutput> {
  const {text, apiKeys, model} = input;

  if (!apiKeys || apiKeys.length === 0) {
    throw new Error('No API keys provided.');
  }

  const prompt = `You are an expert assistant for parsing unstructured text into a structured schedule.
The output language must be the same as the input language. Your output MUST be a valid JSON object matching the requested schema.

- Generate a main title for the schedule and put it in 'cardTitle'.
- If the text contains a date, use it for the 'cardTitle' in DD.MM.YYYY format (e.g., "Расписание на 10.10.2024"). Do not create a 'date' type item if there is only one distinct date.
- For each item, determine its 'type': 'timed', 'untimed', 'date', 'h1', 'h2', 'h3', 'comment'.
- For 'timed' events, the 'time' field MUST be in HH:mm format.
- For ALL OTHER types ('untimed', 'date', 'h1', 'h2', 'h3', 'comment'), the 'time' field MUST be an empty string: "".
- If an item mentions a deadline (e.g., 'до 10:00', 'к 15:00'), treat it as a 'comment' and keep the original text, including the time part, in the 'description'. For such items, 'type' must be 'comment' and 'time' must be "".
- For 'date' items, the 'date' field must be a valid ISO date string.
- The 'description' for each item should start with a capital letter.
- Assign 'icon' only if it is clearly suggested in the text. Do not assign colors.
- If an event is related to 'теория', 'анализ' or 'видео', assign it the 'camera' icon.

Parse the following text:
${text}
`;

  let lastError: any = null;

  for (const apiKey of apiKeys) {
    try {
      const ai = genkit({
        plugins: [googleAI({apiKey})],
      });

      const {output} = await ai.generate({
        model: `googleai/${model}`,
        prompt: prompt,
        output: {
          format: 'json',
          schema: ParseScheduleTextOutputSchema,
        },
      });

      if (output) {
        return output;
      }
    } catch (e) {
      lastError = e;
      console.warn(
        `API key ending in ...${apiKey.slice(-4)} failed. Trying next key.`
      );
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('AI returned no output after trying all API keys.');
}
