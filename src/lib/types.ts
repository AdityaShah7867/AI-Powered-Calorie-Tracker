export type Meal = {
  id: string;
  userId: string;
  name: string;
  date: string;
  description: string;
  foodItems: string[];
  calories: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
};

export type WeeklyTarget = {
    id: string;
    userId: string;
    startDate: string;
    targetCalories: number;
}

export type UserSettings = {
    id: string;
    userId: string;
    proteinGoal: number;
    dietaryPreference: DietaryPreference;
    aiModel?: string; // Gemini model name (e.g., 'gemini-1.5-flash')
}

export type DietaryPreference = 'vegetarian-eggless' | 'non-vegetarian';

export type SuggestionState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'awaiting-input'; question: string, options: string[] }
  | { status: 'suggestions-ready'; suggestions: {name: string, recipe: string}[] }
  | { status: 'error'; message: string };

export type SuggestionInput = {
    question: string;
    answer: string;
    history: { question: string; answer: string }[];
}

export type Recipe = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  servings: number;
  calories: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  createdAt: string;
  updatedAt: string;
};

export type RecipeIngredient = {
  name: string;
  quantity: string; // e.g., "2 cups", "100g", "1 tbsp"
  notes?: string;
};
