
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
});

const ParseScheduleTextOutputSchema = z.object({
  schedule: z.array(ParsedScheduleItemSchema).describe('An array of schedule items parsed from the text.')
});
export type ParseScheduleTextOutput = z.infer<typeof ParseScheduleTextOutputSchema>;

export async function parseScheduleFromText(input: ParseScheduleTextInput): Promise<ParseScheduleTextOutput> {
  const result = await parseScheduleFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'parseSchedulePrompt',
  input: {schema: ParseScheduleTextInputSchema},
  output: {schema: ParseScheduleTextOutputSchema},
  prompt: `You are an expert assistant for parsing unstructured text into a structured schedule.
Your task is to identify events and their times from the provided text.

- Each event should have a 'time' and a 'description'.
- The time should be in HH:mm format.
- If an event doesn't have a specific time (e.g., it's just a task), the 'time' field should be an empty string.
- The description should be a concise summary of the event.
- Ignore any text that isn't a schedule item.

Here is the text to parse:
{{text}}

Return a JSON object with a 'schedule' key, containing an array of the parsed events.
Example:
Input text: "at 10am we have a meeting, then lunch at 13:00. also need to buy tickets"
Output JSON:
{
  "schedule": [
    { "time": "10:00", "description": "we have a meeting" },
    { "time": "13:00", "description": "lunch" },
    { "time": "", "description": "buy tickets" }
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
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
