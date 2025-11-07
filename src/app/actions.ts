"use server";

import { getFoodSuggestions, GetFoodSuggestionsInput } from '@/ai/flows/get-food-suggestions';
import { logMeal, LogMealInput } from '@/ai/flows/log-meal-with-ai';
import { analyzeMealImage, AnalyzeMealImageInput } from '@/ai/flows/analyze-meal-image';

export async function submitMeal(data: LogMealInput) {
  try {
    const result = await logMeal(data);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to log meal. Please try again.' };
  }
}

export async function fetchSuggestions(data: GetFoodSuggestionsInput) {
  try {
    const result = await getFoodSuggestions(data);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get suggestions. Please try again.' };
  }
}

export async function quickCheckCalories(data: LogMealInput) {
    try {
      const result = await logMeal(data);
      return { success: true, data: result };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to estimate calories. Please try again.' };
    }
  }

export async function analyzeMealPhoto(data: AnalyzeMealImageInput) {
  try {
    const result = await analyzeMealImage(data);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to analyze meal image. Please try again.' };
  }
}
