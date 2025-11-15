'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating recipes using AI.
 *
 * It allows users to describe a recipe they want to create, and the AI generates
 * detailed nutritional information, ingredients list with quantities.
 *
 * @interface CreateRecipeInput - The input type for the createRecipe function.
 * @interface CreateRecipeOutput - The output type for the createRecipe function.
 * @function createRecipe - The main function to generate recipe details using AI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecipeIngredientSchema = z.object({
  name: z.string().describe('Name of the ingredient'),
  quantity: z.string().describe('Quantity with unit (e.g., "2 cups", "100g", "1 tbsp")'),
  notes: z.string().optional().describe('Optional notes about the ingredient'),
});

const CreateRecipeInputSchema = z.object({
  recipePrompt: z
    .string()
    .describe(
      'A description of the recipe the user wants to create, including the dish name and any specific requirements.'
    ),
});
export type CreateRecipeInput = z.infer<typeof CreateRecipeInputSchema>;

const CreateRecipeOutputSchema = z.object({
  name: z.string().describe('A clear, concise name for the recipe'),
  description: z.string().optional().describe('A brief description of the dish'),
  ingredients: z.array(RecipeIngredientSchema).describe('List of ingredients with quantities'),
  servings: z.number().describe('Number of servings this recipe makes'),
  calories: z.number().describe('Total calories per serving'),
  protein: z.number().optional().describe('Grams of protein per serving'),
  carbohydrates: z.number().optional().describe('Grams of carbohydrates per serving'),
  fat: z.number().optional().describe('Grams of fat per serving'),
  fiber: z.number().optional().describe('Grams of fiber per serving'),
});
export type CreateRecipeOutput = z.infer<typeof CreateRecipeOutputSchema>;

export async function createRecipe(input: CreateRecipeInput): Promise<CreateRecipeOutput> {
  return createRecipeFlow(input);
}

const createRecipePrompt = ai.definePrompt({
  name: 'createRecipePrompt',
  input: {schema: CreateRecipeInputSchema},
  output: {schema: CreateRecipeOutputSchema},
  prompt: `You are an expert Indian nutritionist and chef. A user wants to create a recipe. Your job is to:

1. Generate a clear recipe name based on the description
2. Provide a list of ingredients with specific quantities (be realistic and precise)
3. Determine the number of servings this recipe typically makes
4. Calculate nutritional information PER SERVING including:
   - Total calories
   - Protein in grams
   - Carbohydrates in grams
   - Fat in grams
   - Fiber in grams

Here is the recipe description from the user:

{{{recipePrompt}}}

Important guidelines:
- Use realistic ingredient quantities that make sense for Indian cuisine
- Be specific with measurements (use cups, grams, tablespoons, etc.)
- If it's a traditional Indian dish, use authentic ingredients
- Calculate nutritional values accurately per serving
- Consider typical Indian serving sizes

Please provide the output as a JSON object.
`,
});

const createRecipeFlow = ai.defineFlow(
  {
    name: 'createRecipeFlow',
    inputSchema: CreateRecipeInputSchema,
    outputSchema: CreateRecipeOutputSchema,
  },
  async input => {
    const {output} = await createRecipePrompt(input);
    return output!;
  }
);
