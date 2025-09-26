
// src/ai/flows/translate-text.ts
'use server';

/**
 * @fileOverview A simple text translation AI agent.
 *
 * - translateText - A function that translates a single string into multiple languages.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguages: z.array(z.string()).describe('The list of target languages to translate the text into.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translations: z.record(z.string()).describe('An object where keys are the language codes and values are the translated texts.')
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;


export async function translateText(input: TranslateTextInput, apiKey: string): Promise<TranslateTextOutput> {
  if (!apiKey) {
    throw new Error('API key is not provided');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});

  const languages = input.targetLanguages.join(', ');

  const prompt = `You are a translation expert. You will be given a text and a list of target languages.
Your job is to translate the text into each of the target languages.
Return a JSON object where the 'translations' key holds an object with language codes as keys and the translated text as values. Do not wrap the JSON in markdown.

Text:
"${input.text}"

Target Languages:
${languages}

Output JSON:`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    const parsedJson = JSON.parse(text);
    return TranslateTextOutputSchema.parse(parsedJson);
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("AI response was not valid JSON.");
  }
}
