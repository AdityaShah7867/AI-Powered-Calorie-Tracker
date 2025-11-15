import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Valid models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, etc.
// Use gemini-flash-latest for automatic latest version
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
