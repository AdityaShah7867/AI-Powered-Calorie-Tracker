'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing meal images using AI.
 *
 * It allows users to log meals by uploading photos, and the AI identifies food items
 * and estimates their nutritional information.
 *
 * @interface AnalyzeMealImageInput - The input type for the analyzeMealImage function.
 * @interface FoodItem - Detected food item with nutritional details.
 * @interface AnalyzeMealImageOutput - The output type for the analyzeMealImage function.
 * @function analyzeMealImage - The main function to analyze a meal image and estimate nutrition.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMealImageInputSchema = z.object({
  imageUrl: z.string().describe('The URL or base64 data of the meal image to analyze.'),
});
export type AnalyzeMealImageInput = z.infer<typeof AnalyzeMealImageInputSchema>;

const FoodItemSchema = z.object({
  name: z.string().describe('The name of the food item'),
  quantity: z.string().describe('The estimated quantity (e.g., "1 cup", "200g", "2 pieces")'),
  calories: z.number().describe('Estimated calories for this item'),
  protein: z.number().optional().describe('Estimated grams of protein'),
  carbohydrates: z.number().optional().describe('Estimated grams of carbohydrates'),
  fat: z.number().optional().describe('Estimated grams of fat'),
  fiber: z.number().optional().describe('Estimated grams of fiber'),
});
export type FoodItem = z.infer<typeof FoodItemSchema>;

const AnalyzeMealImageOutputSchema = z.object({
  foodItems: z.array(FoodItemSchema).describe('List of detected food items with nutritional information'),
  totalCalories: z.number().describe('Total estimated calories for the entire meal'),
  totalProtein: z.number().describe('Total estimated grams of protein'),
  totalCarbohydrates: z.number().describe('Total estimated grams of carbohydrates'),
  totalFat: z.number().describe('Total estimated grams of fat'),
  totalFiber: z.number().describe('Total estimated grams of fiber'),
  confidence: z.string().optional().describe('Confidence level of the analysis (high, medium, low)'),
  suggestions: z.string().optional().describe('Any suggestions or notes about the meal'),
});
export type AnalyzeMealImageOutput = z.infer<typeof AnalyzeMealImageOutputSchema>;

export async function analyzeMealImage(input: AnalyzeMealImageInput): Promise<AnalyzeMealImageOutput> {
  return analyzeMealImageFlow(input);
}

const analyzeMealImagePrompt = ai.definePrompt({
  name: 'analyzeMealImagePrompt',
  input: {schema: AnalyzeMealImageInputSchema},
  output: {schema: AnalyzeMealImageOutputSchema},
  config: {
    temperature: 0.7,
  },
},
async (input) => {
  return {
    messages: [
      {
        role: 'user',
        content: [
          {
            text: `You are an expert nutritionist and food recognition specialist with deep knowledge of Indian cuisine. 

Analyze the meal image and provide detailed nutritional information.

Instructions:
1. Identify all visible food items in the image
2. Estimate the quantity/portion size for each item (be specific: use cups, grams, pieces, etc.)
3. Calculate nutritional values for each item individually
4. Provide total nutritional information for the entire meal
5. Consider typical Indian meal portions and preparations
6. If you're uncertain about any item, indicate lower confidence and provide your best estimate

Important:
- Be conservative with calorie estimates if portions are unclear
- Include common condiments and sides if visible
- Note if the image quality affects your confidence
- Provide actionable suggestions if needed

Return the analysis as a structured JSON object with individual food items and totals.`
          },
          {
            media: {
              url: input.imageUrl,
            }
          }
        ]
      }
    ]
  };
});

const analyzeMealImageFlow = ai.defineFlow(
  {
    name: 'analyzeMealImageFlow',
    inputSchema: AnalyzeMealImageInputSchema,
    outputSchema: AnalyzeMealImageOutputSchema,
  },
  async input => {
    const {output} = await analyzeMealImagePrompt(input);
    return output!;
  }
);
