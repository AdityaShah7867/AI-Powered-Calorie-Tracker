'use client';

import { useState } from 'react';
import { generateRecipeWithAI } from '@/app/actions';
import { CreateRecipeOutput } from '@/ai/flows/create-recipe-with-ai';
import { Recipe, RecipeIngredient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Check, X, Edit2, Plus, Trash2 } from 'lucide-react';
import { useFirebase } from '@/firebase/provider';
import { collection, addDoc } from 'firebase/firestore';

export function RecipeManager() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const [recipePrompt, setRecipePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<CreateRecipeOutput | null>(null);
  
  // Editable fields for verification and modification
  const [editedRecipe, setEditedRecipe] = useState<CreateRecipeOutput | null>(null);

  const handleGenerateRecipe = async () => {
    if (!recipePrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a recipe description',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateRecipeWithAI({ recipePrompt });
      
      if (result.success && result.data) {
        setGeneratedRecipe(result.data);
        setEditedRecipe(result.data);
        toast({
          title: 'Recipe Generated!',
          description: 'Review the details and make any adjustments before saving.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to generate recipe',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!editedRecipe || !user || !firestore) {
      toast({
        title: 'Error',
        description: 'Please log in to save recipes',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const recipeData: Omit<Recipe, 'id'> = {
        userId: user.uid,
        name: editedRecipe.name,
        description: editedRecipe.description,
        ingredients: editedRecipe.ingredients,
        servings: editedRecipe.servings,
        calories: editedRecipe.calories,
        protein: editedRecipe.protein,
        carbohydrates: editedRecipe.carbohydrates,
        fat: editedRecipe.fat,
        fiber: editedRecipe.fiber,
        createdAt: now,
        updatedAt: now,
      };

      await addDoc(collection(firestore, 'users', user.uid, 'recipes'), recipeData);

      toast({
        title: 'Recipe Saved!',
        description: `${editedRecipe.name} has been saved to your recipes.`,
      });

      // Reset form
      setRecipePrompt('');
      setGeneratedRecipe(null);
      setEditedRecipe(null);
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to save recipe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setRecipePrompt('');
    setGeneratedRecipe(null);
    setEditedRecipe(null);
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string) => {
    if (!editedRecipe) return;
    const newIngredients = [...editedRecipe.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setEditedRecipe({ ...editedRecipe, ingredients: newIngredients });
  };

  const addIngredient = () => {
    if (!editedRecipe) return;
    setEditedRecipe({
      ...editedRecipe,
      ingredients: [...editedRecipe.ingredients, { name: '', quantity: '', notes: '' }],
    });
  };

  const removeIngredient = (index: number) => {
    if (!editedRecipe) return;
    setEditedRecipe({
      ...editedRecipe,
      ingredients: editedRecipe.ingredients.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Recipe with AI
          </CardTitle>
          <CardDescription>
            Describe your recipe and let AI generate detailed nutritional information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipePrompt">Recipe Description</Label>
            <Textarea
              id="recipePrompt"
              placeholder="E.g., 'Paneer Tikka Masala for 4 people' or 'Healthy Chicken Biryani with less oil'"
              value={recipePrompt}
              onChange={(e) => setRecipePrompt(e.target.value)}
              rows={3}
              disabled={isGenerating}
            />
          </div>

          <Button
            onClick={handleGenerateRecipe}
            disabled={isGenerating || !recipePrompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Recipe...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Recipe
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {editedRecipe && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Edit Recipe</CardTitle>
            <CardDescription>
              Verify the AI-generated details and make any necessary adjustments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recipe Name */}
            <div className="space-y-2">
              <Label htmlFor="recipeName">Recipe Name</Label>
              <Input
                id="recipeName"
                value={editedRecipe.name}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="recipeDescription">Description (Optional)</Label>
              <Textarea
                id="recipeDescription"
                value={editedRecipe.description || ''}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Servings */}
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={editedRecipe.servings}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, servings: parseInt(e.target.value) || 1 })}
              />
            </div>

            {/* Ingredients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Ingredients</Label>
                <Button variant="outline" size="sm" onClick={addIngredient}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Ingredient
                </Button>
              </div>
              <div className="space-y-2">
                {editedRecipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Ingredient name"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Quantity (e.g., 2 cups)"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutritional Information */}
            <div className="space-y-3">
              <Label>Nutritional Information (Per Serving)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories" className="text-sm text-muted-foreground">
                    Calories
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    value={editedRecipe.calories}
                    onChange={(e) => setEditedRecipe({ ...editedRecipe, calories: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein" className="text-sm text-muted-foreground">
                    Protein (g)
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editedRecipe.protein || ''}
                    onChange={(e) => setEditedRecipe({ ...editedRecipe, protein: parseFloat(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs" className="text-sm text-muted-foreground">
                    Carbs (g)
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editedRecipe.carbohydrates || ''}
                    onChange={(e) => setEditedRecipe({ ...editedRecipe, carbohydrates: parseFloat(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat" className="text-sm text-muted-foreground">
                    Fat (g)
                  </Label>
                  <Input
                    id="fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editedRecipe.fat || ''}
                    onChange={(e) => setEditedRecipe({ ...editedRecipe, fat: parseFloat(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiber" className="text-sm text-muted-foreground">
                    Fiber (g)
                  </Label>
                  <Input
                    id="fiber"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editedRecipe.fiber || ''}
                    onChange={(e) => setEditedRecipe({ ...editedRecipe, fiber: parseFloat(e.target.value) || undefined })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleSaveRecipe} disabled={isSaving} className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Recipe
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isSaving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
