"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Mic, NotebookPen, BookOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useFirebase, useMemoFirebase } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Recipe } from "@/lib/types";

interface MealLoggerProps {
  onLogMeal: (description: string) => Promise<void>;
  onLogRecipe?: (recipe: Recipe, servings: number) => Promise<void>;
  isLogging: boolean;
}

export function MealLogger({ onLogMeal, onLogRecipe, isLogging }: MealLoggerProps) {
  const [description, setDescription] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [servings, setServings] = useState<number>(1);
  const { firestore, user } = useFirebase();

  // Fetch user's saved recipes
  const recipesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'recipes'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: recipes, isLoading: isLoadingRecipes } = useCollection<Recipe>(recipesQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onLogMeal(description.trim());
      setDescription("");
    }
  };

  const handleRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecipeId && onLogRecipe && recipes) {
      const recipe = recipes.find(r => r.id === selectedRecipeId);
      if (recipe) {
        onLogRecipe(recipe, servings);
        setSelectedRecipeId("");
        setServings(1);
      }
    }
  };

  const selectedRecipe = recipes?.find(r => r.id === selectedRecipeId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <NotebookPen className="h-5 w-5" />
        <div className="flex-1">
            <CardTitle className="font-headline">Log a Meal</CardTitle>
            <CardDescription>Describe your meal or select from saved recipes</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">
              <NotebookPen className="h-4 w-4 mr-2" />
              Describe Meal
            </TabsTrigger>
            <TabsTrigger value="recipe">
              <BookOpen className="h-4 w-4 mr-2" />
              From Recipe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="meal-description">What did you eat?</Label>
                <div className="relative">
                  <Textarea
                    id="meal-description"
                    placeholder="e.g., A bowl of oatmeal with a handful of blueberries and a drizzle of honey."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="pr-10"
                  />
                   <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute bottom-2 right-2 h-7 w-7"
                            disabled
                        >
                            <Mic className="h-4 w-4" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Voice input coming soon!</p>
                        </TooltipContent>
                    </Tooltip>
                   </TooltipProvider>
                </div>
              </div>
              <Button type="submit" disabled={isLogging || !description.trim()} className="w-full bg-primary hover:bg-primary/90">
                {isLogging ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Log Meal'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="recipe" className="space-y-4">
            <form onSubmit={handleRecipeSubmit} className="space-y-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="recipe-select">Select Recipe</Label>
                {isLoadingRecipes ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : recipes && recipes.length > 0 ? (
                  <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                    <SelectTrigger id="recipe-select">
                      <SelectValue placeholder="Choose a saved recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.name} ({recipe.calories} cal/serving)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No saved recipes yet. Create one first!
                  </p>
                )}
              </div>

              {selectedRecipe && (
                <>
                  <div className="grid w-full gap-2">
                    <Label htmlFor="servings">Number of Servings</Label>
                    <Input
                      id="servings"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={servings}
                      onChange={(e) => setServings(parseFloat(e.target.value) || 1)}
                    />
                  </div>

                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">Nutritional Info ({servings} serving{servings !== 1 ? 's' : ''})</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Calories: <span className="font-semibold">{Math.round(selectedRecipe.calories * servings)}</span></div>
                      {selectedRecipe.protein && <div>Protein: <span className="font-semibold">{Math.round(selectedRecipe.protein * servings)}g</span></div>}
                      {selectedRecipe.carbohydrates && <div>Carbs: <span className="font-semibold">{Math.round(selectedRecipe.carbohydrates * servings)}g</span></div>}
                      {selectedRecipe.fat && <div>Fat: <span className="font-semibold">{Math.round(selectedRecipe.fat * servings)}g</span></div>}
                    </div>
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                disabled={isLogging || !selectedRecipeId || !onLogRecipe} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isLogging ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Log Recipe Meal'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
