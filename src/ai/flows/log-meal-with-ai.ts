'use server';

/**
 * @fileOverview This file defines a Genkit flow for logging meals using AI.
 *
 * It allows users to log meals by describing them in text or voice, and the AI estimates the calories and other nutrients.
 *
 * @interface LogMealInput - The input type for the logMeal function.
 * @interface LogMealOutput - The output type for the logMeal function.
 * @function logMeal - The main function to log a meal and estimate its calories.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LogMealInputSchema = z.object({
  mealDescription: z
    .string()
    .describe(
      'A description of the meal, including all food items and approximate quantities.'
    ),
});
export type LogMealInput = z.infer<typeof LogMealInputSchema>;

const LogMealOutputSchema = z.object({
  estimatedCalories: z
    .number()
    .describe('The estimated calorie count for the meal.'),
  foodItems: z
    .array(z.string())
    .describe('A list of the food items identified in the meal description.'),
  protein: z.number().optional().describe('Estimated grams of protein.'),
  carbohydrates: z.number().optional().describe('Estimated grams of carbohydrates.'),
  fat: z.number().optional().describe('Estimated grams of fat.'),
  fiber: z.number().optional().describe('Estimated grams of fiber.'),
});
export type LogMealOutput = z.infer<typeof LogMealOutputSchema>;

export async function logMeal(input: LogMealInput): Promise<LogMealOutput> {
  return logMealFlow(input);
}

const logMealPrompt = ai.definePrompt({
  name: 'logMealPrompt',
  input: {schema: LogMealInputSchema},
  output: {schema: LogMealOutputSchema},
  prompt: `You are an expert Indian nutritionist. A user has described a meal they ate. Your job is to:

1.  Identify the individual food items in the meal, assuming it's Indian cuisine.
2.  Estimate the total calorie count for the entire meal.
3.  Estimate the protein, carbohydrates, fat, and fiber in grams.

Here is the meal description:

{{{mealDescription}}}

Please provide the output as a JSON object. The foodItems field should be a list of strings.
`,
});

const logMealFlow = ai.defineFlow(
  {
    name: 'logMealFlow',
    inputSchema: LogMealInputSchema,
    outputSchema: LogMealOutputSchema,
  },
  async input => {
    const {output} = await logMealPrompt(input);
    return output!;
  }
);
