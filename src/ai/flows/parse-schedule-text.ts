
'use server';

/**
 * @fileOverview An AI agent for parsing schedule from raw text.
 *
 * - parseScheduleFromText - A function that parses a schedule from a string.
 * - ParseScheduleTextInput - The input type for the parseScheduleFromText function.
 * - ParseScheduleTextOutput - The return type for the parseScheduleFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseScheduleTextInputSchema = z.object({
  text: z.string().describe('The raw text containing schedule information.'),
});
export type ParseScheduleTextInput = z.infer<typeof ParseScheduleTextInputSchema>;

const ParsedScheduleItemSchema = z.object({
    time: z.string().describe("The time of the event in HH:mm format. If the event has no specific time, this should be an empty string."),
    description: z.string().describe("The description of the schedule event."),
    icon: z.enum(['football-field', 'dumbbell', 'passport', 'plane-takeoff', 'plane-landing', 'camera', 'utensils', 'bed', 'stadium', 'document', 'home', 'bus', 'soccer-ball', 'lock', 'moon', 'cake', 'shirt']).optional().describe("An icon for the event."),
    color: z.enum(['red', 'orange', 'yellow', 'green', 'blue', 'purple']).optional().describe('A color for the event row.'),
});

const ParseScheduleTextOutputSchema = z.object({
  cardTitle: z.string().describe("The title for the schedule card. If not specified in the text, generate a suitable one."),
  schedule: z.array(ParsedScheduleItemSchema).describe('An array of schedule items parsed from the text.')
});
export type ParseScheduleTextOutput = z.infer<typeof ParseScheduleTextOutputSchema>;

export async function parseScheduleFromText(input: ParseScheduleTextInput, apiKey: string): Promise<ParseScheduleTextOutput> {
  const result = await parseScheduleFlow(input, { apiKey });
  return result;
}

const prompt = ai.definePrompt({
  name: 'parseSchedulePrompt',
  input: {schema: ParseScheduleTextInputSchema},
  output: {schema: ParseScheduleTextOutputSchema},
  model: 'gemini-1.5-flash',
  prompt: `You are an expert assistant for parsing unstructured text into a structured schedule.
Your task is to identify the schedule title, events, their times, and relevant metadata from the provided text.

- Extract or generate a main title for the schedule and put it in 'cardTitle'.
- For each event, provide a 'time' and a 'description'.
- The time should be in HH:mm format.
- If an event doesn't have a specific time (e.g., it's just a task), the 'time' field should be an empty string.
- If the text suggests an icon, choose one from the available options: 'football-field', 'dumbbell', 'passport', 'plane-takeoff', 'plane-landing', 'camera', 'utensils', 'bed', 'stadium', 'document', 'home', 'bus', 'soccer-ball', 'lock', 'moon', 'cake', 'shirt'.
- If the text suggests a color, choose one from the available options: 'red', 'orange', 'yellow', 'green', 'blue', 'purple'.
- Ignore any text that isn't a schedule item.

Here is the text to parse:
{{text}}

Return a JSON object with a 'cardTitle' and a 'schedule' array.
Example:
Input text: "My Match Day. 10am meeting in red room, then lunch at 13:00. also need to buy tickets for the trip."
Output JSON:
{
  "cardTitle": "My Match Day",
  "schedule": [
    { "time": "10:00", "description": "meeting", "color": "red" },
    { "time": "13:00", "description": "lunch", "icon": "utensils" },
    { "time": "", "description": "buy tickets for the trip", "icon": "passport" }
  ]
}

Output JSON:`, 
});

const parseScheduleFlow = ai.defineFlow(
  {
    name: 'parseScheduleFlow',
    inputSchema: ParseScheduleTextInputSchema,
    outputSchema: ParseScheduleTextOutputSchema,
  },
  async (input, { apiKey }) => {
    const {output} = await prompt(input, {}, { apiKey });
    return output!;
  }
);
