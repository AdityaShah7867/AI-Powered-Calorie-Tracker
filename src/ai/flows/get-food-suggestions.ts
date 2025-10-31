'use server';
/**
 * @fileOverview An AI agent to provide intelligent food suggestions via a conversational questionnaire.
 *
 * - getFoodSuggestions - A function that handles the food suggestion process.
 * - GetFoodSuggestionsInput - The input type for the getFoodSuggestions function.
 * - GetFoodSuggestionsOutput - The return type for the getFoodSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input: The user's preferences, calorie goal, and conversation history.
const GetFoodSuggestionsInputSchema = z.object({
  dietaryPreferences: z
    .string()
    .describe("The user's dietary preferences, e.g., vegetarian, non-vegetarian, vegan."),
  calorieGoal: z.number().describe('The user’s daily calorie goal.'),
  conversationHistory: z
    .array(z.object({question: z.string(), answer: z.string()}))
    .describe('The history of questions asked and answers received so far.'),
});
export type GetFoodSuggestionsInput = z.infer<typeof GetFoodSuggestionsInputSchema>;

// Output: Either the next question or the final suggestions.
const GetFoodSuggestionsOutputSchema = z.object({
  nextQuestion: z
    .object({
      question: z.string().describe('The next question to ask the user.'),
      options: z
        .array(z.string())
        .describe('A list of options for the user to choose from.'),
    })
    .optional(),
  suggestions: z
    .array(
      z.object({
        name: z.string().describe('The name of the suggested dish.'),
        recipe: z
          .string()
          .describe('A brief recipe or preparation instructions.'),
      })
    )
    .optional()
    .describe('The final list of 2 meal suggestions.'),
});
export type GetFoodSuggestionsOutput = z.infer<typeof GetFoodSuggestionsOutputSchema>;

export async function getFoodSuggestions(
  input: GetFoodSuggestionsInput
): Promise<GetFoodSuggestionsOutput> {
  return getFoodSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getFoodSuggestionsPrompt',
  input: {schema: GetFoodSuggestionsInputSchema},
  output: {schema: GetFoodSuggestionsOutputSchema},
  prompt: `
    You are an expert Indian chef and nutritionist AI. Your goal is to help a user find two perfect meal suggestions by asking a series of contextual questions.

    The user's profile:
    - Dietary Preference: {{{dietaryPreferences}}}
    - Daily Calorie Goal: {{{calorieGoal}}}

    Conversation History:
    {{#if conversationHistory.length}}
      {{#each conversationHistory}}
        - You asked: "{{this.question}}"
        - User answered: "{{this.answer}}"
      {{/each}}
    {{else}}
      No questions asked yet. This is the start of the conversation.
    {{/if}}

    Based on the conversation history, decide the next step:

    1.  **If you don't have enough information**, ask ONE more clarifying and CONTEXTUAL question. The question should be relevant to Indian cuisine and help narrow down the choices based on previous answers.
        - Bad Example (Non-contextual): "What do you want?"
        - Good Example (Contextual): "You chose Lunch. What is your main ingredient preference for lunch?"
        - Initial questions could be: "What type of meal are you looking for (e.g., Breakfast, Lunch, Dinner)?", "What is your main protein preference (e.g., Paneer, Tofu, Soya, Chicken, Fish)?", "What is your preferred spice level (e.g., Mild, Medium, Spicy)?"
        - Provide a few multiple-choice options for the user to select.
        - Set the 'nextQuestion' field in your response.

    2.  **If you have enough information** (after 2-3 questions), provide exactly TWO detailed meal suggestions.
        - Each suggestion must include a 'name' and a brief 'recipe'.
        - The suggestions should be tailored to the user's preferences and calorie goal.
        - Set the 'suggestions' field in your response. Do not set 'nextQuestion'.
  `,
});

const getFoodSuggestionsFlow = ai.defineFlow(
  {
    name: 'getFoodSuggestionsFlow',
    inputSchema: GetFoodSuggestionsInputSchema,
    outputSchema: GetFoodSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
