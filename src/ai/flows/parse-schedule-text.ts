
'use server';

/**
 * @fileOverview An AI agent for parsing schedule from raw text.
 *
 * - parseScheduleFromText - A function that parses a schedule from a string.
 * - ParseScheduleTextInput - The input type for the parseScheduleFromText function.
 * - ParseScheduleTextOutput - The return type for the parseScheduleTextOutput function.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';


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


export async function parseScheduleFromText(input: ParseScheduleTextInput, apiKey: string): Promise<ParseScheduleTextOutput> {
  if (!apiKey) {
    throw new Error('API key is not provided');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are an expert assistant for parsing unstructured text into a structured schedule.
Your task is to identify the schedule title, events, their times, types, and other metadata from the provided text.

- The user can provide schedule items of different types: timed events, untimed tasks, dates, comments, and headers (h1, h2, h3).
- Extract or generate a main title for the schedule and put it in 'cardTitle'.
- For each item, determine its 'type'.
- 'timed': An event with a specific time. The 'time' field should be in HH:mm format.
- 'untimed': A task or event without a specific time. The 'time' field should be an empty string.
- 'date': A specific date marker. The 'description' can be an optional annotation (like 'Day 1'). The 'date' field must be a valid ISO date string. The 'time' field must be empty.
- 'h1', 'h2', 'h3': Header text. Use for section titles like "Morning", "Game Day". The 'time' field must be empty.
- 'comment': A note or italicized text. The 'time' field must be empty.
- If the text suggests an icon, choose one from the available options: 'football-field', 'dumbbell', 'passport', 'plane-takeoff', 'plane-landing', 'camera', 'utensils', 'bed', 'stadium', 'document', 'home', 'bus', 'soccer-ball', 'lock', 'moon', 'cake', 'shirt'. Assign icons only to 'timed' and 'untimed' types.
- If the text suggests a color, choose one from the available options: 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'. Assign colors only to 'timed' and 'untimed' types.
- Ignore any text that isn't a schedule item.

Here is the text to parse:
${input.text}

Return a JSON object with a 'cardTitle' and a 'schedule' array. Do not wrap the JSON in markdown.
Example:
Input text: "My Match Day. Dec 25, 2024. Morning session. 10am meeting in red room. 13:00 lunch. // Don't be late. Then buy tickets for the trip."
Output JSON:
{
  "cardTitle": "My Match Day",
  "schedule": [
    { "type": "date", "date": "2024-12-25T00:00:00.000Z", "description": "", "time": "" },
    { "type": "h1", "description": "Morning session", "time": "" },
    { "type": "timed", "time": "10:00", "description": "meeting", "color": "red" },
    { "type": "timed", "time": "13:00", "description": "lunch", "icon": "utensils" },
    { "type": "comment", "description": "Don't be late", "time": "" },
    { "type": "untimed", "time": "", "description": "buy tickets for the trip", "icon": "passport" }
  ]
}

Output JSON:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    // It's possible the model will wrap the JSON in markdown, so we'll clean it.
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedJson = JSON.parse(cleanedText);
    return ParseScheduleTextOutputSchema.parse(parsedJson);
  } catch (error) {
    console.error("Failed to parse AI response:", text, error);
    throw new Error("AI response was not valid JSON.");
  }
}
