
'use server';

/**
 * @fileOverview An AI agent for parsing schedule from raw text.
 *
 * - parseScheduleFromText - A function that parses a schedule from a string.
 * - ParseScheduleTextInput - The input type for the parseScheduleFromText function.
 * - ParseScheduleTextOutput - The return type for the parseScheduleTextOutput function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';


const ParseScheduleTextInputSchema = z.object({
  text: z.string().describe('The raw text containing schedule information.'),
  apiKeys: z.array(z.string()).optional().describe('An array of Gemini API keys to use for the request.'),
});
export type ParseScheduleTextInput = z.infer<typeof ParseScheduleTextInputSchema>;

const ParsedScheduleItemSchema = z.object({
    time: z.string().describe("The time of the event in HH:mm format. Should be empty for non-timed events."),
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


const scheduleParserFlow = ai.defineFlow(
  {
    name: 'scheduleParserFlow',
    inputSchema: ParseScheduleTextInputSchema,
    outputSchema: ParseScheduleTextOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'scheduleParserPrompt',
        model: 'gemini-1.5-flash',
        input: { schema: z.object({ text: z.string() }) },
        output: { schema: ParseScheduleTextOutputSchema },
        config: {
            // Use user-provided API keys if available
            plugins: input.apiKeys && input.apiKeys.length > 0 ? [googleAI({ apiKeys: input.apiKeys })] : undefined,
        },
        prompt: `You are an expert assistant for parsing unstructured text into a structured schedule.
Your task is to identify the schedule title, events, their times, types, and other metadata from the provided text. The output must be in the language of the input text.

- The user can provide schedule items of different types: timed events, untimed tasks, dates, comments, and headers (h1, h2, h3).
- Extract or generate a main title for the schedule and put it in 'cardTitle'.
- For each item, determine its 'type'.
- 'timed': An event with a specific time. The 'time' field should be in HH:mm format.
- 'untimed': A task or event without a specific time. The 'time' field should be an empty string.
- 'date': A specific date marker. The 'description' can be an optional annotation (like 'Day 1'). The 'date' field must be a valid ISO date string. The 'time' field must be empty.
- 'h1', 'h2', 'h3': Header text. Use for section titles like "Morning", "Game Day". The 'time' field must be empty.
- 'comment': A note or italicized text. The 'time' field must be empty.
- Ensure the 'description' for each schedule item starts with a capital letter.
- If the text suggests an icon, choose one from the available options: 'football-field', 'dumbbell', 'passport', 'plane-takeoff', 'plane-landing', 'camera', 'utensils', 'bed', 'stadium', 'document', 'home', 'bus', 'soccer-ball', 'lock', 'moon', 'cake', 'shirt'. Assign icons only to 'timed' and 'untimed' types.
- If the text suggests a color, choose one from the available options: 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'. Assign colors to all item types.
- Ignore any text that isn't a schedule item.

Here is the text to parse:
{{{text}}}
`
    });

    const { output } = await prompt({ text: input.text });
    return output!;
  }
);


export async function parseScheduleFromText(input: ParseScheduleTextInput): Promise<ParseScheduleTextOutput> {
    try {
        return await scheduleParserFlow(input);
    } catch(e) {
        console.error("AI parsing failed:", e);
        throw new Error("Failed to parse schedule using AI.");
    }
}
