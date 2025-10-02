
'use server';

/**
 * @fileOverview An AI agent for parsing schedule from raw text.
 *
 * - parseScheduleFromText - A function that parses a schedule from a string.
 * - ParseScheduleTextInput - The input type for the parseScheduleFromText function.
 * - ParseScheduleTextOutput - The return type for the parseScheduleTextOutput function.
 */

import { ai, z } from '@/ai/genkit';

const ParseScheduleTextInputSchema = z.object({
  text: z.string().describe('The raw text containing schedule information.'),
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


export async function parseScheduleFromText(input: ParseScheduleTextInput): Promise<ParseScheduleTextOutput> {
    const prompt = ai.definePrompt({
        name: 'scheduleParserPrompt',
        input: { schema: ParseScheduleTextInputSchema },
        output: { schema: ParseScheduleTextOutputSchema },
        prompt: `You are an expert assistant for parsing unstructured text into a structured schedule.
Your task is to identify the schedule title, events, their times, types, and other metadata from the provided text. The output must be in the language of the input text.

- The user can provide schedule items of different types: timed events, untimed tasks, dates, comments, and headers (h1, h2, h3).
- Extract or generate a main title for the schedule and put it in 'cardTitle'.
- If the text contains a specific date, you can either include it in the 'cardTitle' or create a separate 'date' item for it, but avoid doing both to prevent redundancy.
- For each item, determine its 'type'.
- 'timed': An event with a specific time. The 'time' field should be in HH:mm format.
- 'untimed': A task or event without a specific time. The 'time' field should be an empty string.
- 'date': A specific date marker. The 'description' can be an optional annotation (like 'Day 1'). The 'date' field must be a valid ISO date string. The 'time' field must be empty.
- 'h1', 'h2', 'h3': Header text. Use for section titles like "Morning", "Game Day". The 'time' field must be empty.
- 'comment': A note or italicized text. The 'time' field must be empty.
- Ensure the 'description' for each schedule item starts with a capital letter.
- If the text suggests an icon, choose one from the available options: 'football-field', 'dumbbell', 'passport', 'plane-takeoff', 'plane-landing', 'camera', 'utensils', 'bed', 'stadium', 'document', 'home', 'bus', 'soccer-ball', 'lock', 'moon', 'cake', 'shirt'. Assign icons only to 'timed' and 'untimed' types.
- For "Теория" (theory) or "Установка" (instructions), assign the 'camera' icon.
- For a generic 'тренировка' (training), assign the 'football-field' icon. If the training is specified to be in a gym (e.g., 'тренировка в зале', 'тренажерный зал'), assign the 'dumbbell' icon.
- If the text suggests a color, choose one from the available options: 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'. Assign colors to all item types.
- Ignore any text that isn't a schedule item.

Here is the text to parse:
${input.text}
`
    });

    try {
        const { output } = await prompt(input);
        return output!;
    } catch(e) {
        console.error(e);
        throw e;
    }
}
