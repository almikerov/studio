import { config } from 'dotenv';
config();

// Genkit dev server is no longer strictly necessary as we are not defining
// genkit flows anymore, but we can keep the file for potential future use.
import '@/ai/flows/translate-schedule.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/parse-schedule-text.ts';
