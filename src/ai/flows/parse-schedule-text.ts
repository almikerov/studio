
'use server';

/**
 * @fileOverview An AI agent for parsing schedule from raw text.
 *
 * - parseScheduleFromText - A function that parses a schedule from a string.
 * - ParseScheduleTextInput - The input type for the parseScheduleFromText function.
 * - ParseScheduleTextOutput - The return type for the parseScheduleFromText function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

const ParseScheduleTextInputSchema = z.object({
  text: z.string().describe('The raw text containing schedule information.'),
  apiKey: z.string().describe('The API key for the AI service.'),
});
export type ParseScheduleTextInput = z.infer<typeof ParseScheduleTextInputSchema>;

const ParsedScheduleItemSchema = z.object({
    time: z.string().describe("The time of the event in HH:mm format. Must be an empty string '' for all types except 'timed'.").optional(),
    description: z.string().describe("The description of the schedule event."),
    icon: z.enum(['football-field', 'dumbbell', 'passport', 'plane-takeoff', 'plane-landing', 'camera', 'utensils', 'bed', 'stadium', 'document', 'home', 'bus', 'soccer-ball', 'lock', 'moon', 'cake', 'shirt']).optional().describe("An icon for the event."),
    color: z.enum(['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray']).optional().describe('A color for the event row.'),
    type: z.enum(['timed', 'untimed', 'comment', 'date', 'h1', 'h2', 'h3']).describe("The type of the schedule item."),
    date: z.string().optional().describe("The date for 'date' type items in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)."),
});

const ParseScheduleTextOutputSchema = z.object({
  cardTitle: z.string().describe("The title for the schedule card. If not specified in the text, generate a suitable one."),
  schedule: z.array(ParsedScheduleItemSchema).describe('An array of schedule items parsed from the text.')
});
export type ParseScheduleTextOutput = z.infer<typeof ParseScheduleTextOutputSchema>;


export async function parseScheduleFromText(input: ParseScheduleTextInput): Promise<ParseScheduleTextOutput> {
    // Local, per-request Genkit instance with user's API key
    const ai = genkit({
        plugins: [googleAI({ apiKey: input.apiKey })],
    });

    const prompt = `You are an expert assistant for parsing unstructured text into a structured schedule.
The output language must be the same as the input language. Your output MUST be a valid JSON object matching the requested schema.

- Generate a main title for the schedule and put it in 'cardTitle'.
- If the text contains only one distinct date, use it either for the 'cardTitle' (e.g., "Schedule for June 5th") OR create a 'date' type item, but not both. Prefer creating a 'date' item.
- For each item, determine its 'type': 'timed', 'untimed', 'date', 'h1', 'h2', 'h3', 'comment'.
- For 'timed' events, the 'time' field MUST be in HH:mm format.
- For ALL OTHER types ('untimed', 'date', 'h1', 'h2', 'h3', 'comment'), the 'time' field MUST be an empty string: "".
- For 'date' items, the 'date' field must be a valid ISO date string.
- The 'description' for each item should start with a capital letter.
- Assign 'icon' and 'color' only if they are clearly suggested in the text.

Parse the following text:
${input.text}
`;

    const { output } = await ai.generate({
        model: 'googleai/gemini-2.5-pro',
        prompt: prompt,
        output: {
            format: 'json',
            schema: ParseScheduleTextOutputSchema,
        },
    });
    
    if (!output) {
        throw new Error("AI returned no output.");
    }
    
    return output;
}
