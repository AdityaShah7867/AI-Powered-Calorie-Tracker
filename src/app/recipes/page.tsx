'use client';

import { useFirebase, useMemoFirebase } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Recipe } from '@/lib/types';
import { RecipeManager } from '@/components/app/recipe-manager';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ChefHat, Users } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function RecipesPage() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const recipesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'recipes'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: recipes, isLoading } = useCollection<Recipe>(recipesQuery);

  const handleDeleteRecipe = async (recipeId: string, recipeName: string) => {
    if (!user || !firestore) return;

    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'recipes', recipeId));
      toast({
        title: 'Recipe Deleted',
        description: `${recipeName} has been removed from your recipes.`,
      });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete recipe. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Recipes</h1>
        <p className="text-muted-foreground">
          Create and manage your saved recipes for quick meal logging
        </p>
      </div>

      <RecipeManager />

      <Separator />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Saved Recipes</h2>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-primary" />
                        {recipe.name}
                      </CardTitle>
                      {recipe.description && (
                        <CardDescription className="mt-2">
                          {recipe.description}
                        </CardDescription>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{recipe.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRecipe(recipe.id, recipe.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="secondary" className="justify-center">
                      {recipe.calories} cal
                    </Badge>
                    {recipe.protein && (
                      <Badge variant="outline" className="justify-center">
                        {recipe.protein}g protein
                      </Badge>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Ingredients:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                        <li key={idx} className="truncate">
                          • {ing.name} - {ing.quantity}
                        </li>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <li className="italic">
                          + {recipe.ingredients.length - 3} more...
                        </li>
                      )}
                    </ul>
                  </div>

                  {(recipe.carbohydrates || recipe.fat || recipe.fiber) && (
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      <div className="grid grid-cols-3 gap-1">
                        {recipe.carbohydrates && <div>Carbs: {recipe.carbohydrates}g</div>}
                        {recipe.fat && <div>Fat: {recipe.fat}g</div>}
                        {recipe.fiber && <div>Fiber: {recipe.fiber}g</div>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recipes Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first recipe using the AI generator above
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
