
'use server';

/**
 * @fileOverview An AI agent for parsing schedule from raw text.
 *
 * - parseScheduleFromText - A function that parses a schedule from a string.
 * - ParseScheduleTextInput - The input type for the parseScheduleFromText function.
 * - ParseScheduleTextOutput - The return type for the parseScheduleTextOutput function.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';


const ParseScheduleTextInputSchema = z.object({
  text: z.string().describe('The raw text containing schedule information.'),
  apiKey: z.string().describe('The Gemini API key to use for the request.'),
});
export type ParseScheduleTextInput = z.infer<typeof ParseScheduleTextInputSchema>;

const ParsedScheduleItemSchema = z.object({
    time: z.string().describe("The time of the event in HH:mm format. Must be an empty string '' for all types except 'timed'."),
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
    try {
        const ai = genkit({
            plugins: [googleAI({ apiKey: input.apiKey })],
        });

        const scheduleParserPrompt = ai.definePrompt({
            name: 'scheduleParserPrompt',
            model: 'gemini-1.5-pro',
            input: { schema: ParseScheduleTextInputSchema },
            output: { schema: ParseScheduleTextOutputSchema },
            prompt: `You are an expert assistant for parsing unstructured text into a structured schedule.
        The output language must be the same as the input language.

        - Generate a main title for the schedule and put it in 'cardTitle'.
        - For each item, determine its 'type': 'timed', 'untimed', 'date', 'h1', 'h2', 'h3', 'comment'.
        - For 'timed' events, the 'time' field MUST be in HH:mm format.
        - For ALL OTHER types ('untimed', 'date', 'h1', 'h2', 'h3', 'comment'), the 'time' field MUST be an empty string: "".
        - For 'date' items, the 'date' field must be a valid ISO date string.
        - The 'description' for each item should start with a capital letter.
        - Assign 'icon' and 'color' only if they are clearly suggested in the text.

        Parse the following text:
        {{{text}}}
        `
        });

        const { output } = await scheduleParserPrompt(input);
        if (!output) {
            throw new Error("AI returned no output.");
        }
        return output;

    } catch(e) {
        console.error("AI parsing failed:", e);
        throw new Error("Failed to parse schedule using AI.");
    }
}
