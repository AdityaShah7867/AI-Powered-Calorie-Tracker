# Recipe Management Feature

## Overview
The Recipe Management feature allows users to create and save custom recipes using AI assistance and manual verification. Users can then quickly log meals from their saved recipes.

## Features

### 1. **AI-Powered Recipe Creation**
- Describe a recipe in natural language (e.g., "Paneer Tikka Masala for 4 people")
- AI generates detailed recipe information:
  - Recipe name
  - List of ingredients with quantities
  - Number of servings
  - Complete nutritional information per serving (calories, protein, carbs, fat, fiber)

### 2. **Manual Verification & Editing**
After AI generates the recipe, you can:
- Edit the recipe name and description
- Adjust the number of servings
- Add, remove, or modify ingredients
- Fine-tune nutritional values
- Review everything before saving

### 3. **Recipe Library**
- View all saved recipes in a beautiful grid layout
- See nutritional information at a glance
- Delete recipes you no longer need
- Access recipes quickly when logging meals

### 4. **Quick Meal Logging**
In the main dashboard, the Meal Logger now has two modes:
- **Describe Meal**: Traditional AI-assisted meal logging
- **From Recipe**: Select a saved recipe and specify servings
  - Automatically calculates nutritional values based on serving size
  - Shows real-time preview of calories and macros

## How to Use

### Creating a Recipe

1. Navigate to the **Recipes** page (chef hat icon in header)
2. Enter a recipe description in the "Recipe Description" field
   - Example: "Healthy Chicken Biryani with less oil for 6 people"
3. Click **Generate Recipe**
4. Review and edit the AI-generated details:
   - Verify ingredient quantities
   - Adjust nutritional values if needed
   - Add or remove ingredients
5. Click **Save Recipe**

### Logging a Meal from a Recipe

1. Go to the main Dashboard
2. In the Meal Logger, click the **From Recipe** tab
3. Select a saved recipe from the dropdown
4. Enter the number of servings you consumed
5. Review the calculated nutritional info
6. Click **Log Recipe Meal**

## Technical Implementation

### Files Added
- `src/lib/types.ts` - Added `Recipe` and `RecipeIngredient` types
- `src/ai/flows/create-recipe-with-ai.ts` - AI flow for recipe generation
- `src/app/actions.ts` - Server action for recipe generation
- `src/components/app/recipe-manager.tsx` - Recipe creation UI
- `src/app/recipes/page.tsx` - Recipes library page
- `firestore.rules` - Security rules for recipes collection

### Files Modified
- `src/components/app/meal-logger.tsx` - Added recipe-based logging
- `src/components/app/dashboard.tsx` - Added recipe meal handler
- `src/components/app/header.tsx` - Added recipes navigation link

### Data Structure

**Firestore Path**: `/users/{userId}/recipes/{recipeId}`

**Recipe Document**:
```typescript
{
  id: string;
  userId: string;
  name: string;
  description?: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    notes?: string;
  }>;
  servings: number;
  calories: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  createdAt: string;
  updatedAt: string;
}
```

## Future Enhancements

Potential features for future development:
- Recipe sharing between users
- Recipe categories/tags (breakfast, lunch, dinner, snacks)
- Cooking instructions
- Recipe photos
- Nutrition targets per recipe
- Import recipes from URLs
- Export recipes to PDF
- Favorite/star recipes
- Search and filter recipes
- Recipe duplicating/cloning
- Meal planning with recipes

## Benefits

1. **Consistency**: Log the same meals with accurate nutrition data
2. **Speed**: No need to describe common meals repeatedly
3. **Accuracy**: Pre-verified nutritional information
4. **Flexibility**: Adjust serving sizes as needed
5. **Organization**: Keep all your favorite recipes in one place
