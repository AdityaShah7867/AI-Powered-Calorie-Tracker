"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { History, Trash2, Edit, Save, X, Loader2 } from "lucide-react";
import type { Meal } from "@/lib/types";

interface MealHistoryProps {
  meals: Meal[];
  isLoading: boolean;
  onDeleteMeal: (mealId: string) => void;
  onUpdateMeal: (mealId: string, updatedData: Partial<Meal>) => void;
}

export function MealHistory({ meals, isLoading, onDeleteMeal, onUpdateMeal }: MealHistoryProps) {
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [editedCalories, setEditedCalories] = useState(0);
  const [editedProtein, setEditedProtein] = useState(0);
  const [editedCarbs, setEditedCarbs] = useState(0);
  const [editedFat, setEditedFat] = useState(0);
  const [editedFiber, setEditedFiber] = useState(0);

  const handleEdit = (meal: Meal) => {
    setEditingMealId(meal.id);
    setEditedDescription(meal.description);
    setEditedCalories(meal.calories);
    setEditedProtein(meal.protein || 0);
    setEditedCarbs(meal.carbohydrates || 0);
    setEditedFat(meal.fat || 0);
    setEditedFiber(meal.fiber || 0);
  };

  const handleCancelEdit = () => {
    setEditingMealId(null);
  };

  const handleSave = (mealId: string) => {
    onUpdateMeal(mealId, { 
        description: editedDescription, 
        calories: editedCalories,
        protein: editedProtein,
        carbohydrates: editedCarbs,
        fat: editedFat,
        fiber: editedFiber,
    });
    setEditingMealId(null);
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <History className="h-5 w-5" />
        <div className="flex-1">
          <CardTitle className="font-headline">Today's Log</CardTitle>
          <CardDescription>Meals you've logged today</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[420px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : meals.length > 0 ? (
            <div className="space-y-4">
              {meals.map((meal, index) => (
                <div key={meal.id}>
                  {editingMealId === meal.id ? (
                     <div className="space-y-2 text-xs">
                        <Input value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                            <Input type="number" value={editedCalories} onChange={(e) => setEditedCalories(Number(e.target.value))} placeholder="Calories" />
                            <Input type="number" value={editedProtein} onChange={(e) => setEditedProtein(Number(e.target.value))} placeholder="Protein" />
                            <Input type="number" value={editedCarbs} onChange={(e) => setEditedCarbs(Number(e.target.value))} placeholder="Carbs" />
                            <Input type="number" value={editedFat} onChange={(e) => setEditedFat(Number(e.target.value))} placeholder="Fat" />
                            <Input type="number" value={editedFiber} onChange={(e) => setEditedFiber(Number(e.target.value))} placeholder="Fiber" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleSave(meal.id)}><Save className="h-4 w-4"/></Button>
                            <Button size="icon" variant="ghost" onClick={handleCancelEdit}><X className="h-4 w-4"/></Button>
                        </div>
                     </div>
                  ) : (
                    <div className="space-y-2">
                        <div className="flex justify-between items-start">
                            <p className="font-medium flex-1 pr-4">{meal.description}</p>
                            <Badge variant="secondary" className="font-bold text-base bg-accent/20 text-accent-foreground">{meal.calories} kcal</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {meal.protein && <Badge variant="outline">P: {meal.protein}g</Badge>}
                            {meal.carbohydrates && <Badge variant="outline">C: {meal.carbohydrates}g</Badge>}
                            {meal.fat && <Badge variant="outline">F: {meal.fat}g</Badge>}
                            {meal.fiber && <Badge variant="outline">Fb: {meal.fiber}g</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                            {meal.foodItems.map(item => (
                                <Badge key={item} variant="outline" className="text-xs font-normal">{item}</Badge>
                            ))}
                        </div>
                        <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(meal)}><Edit className="h-4 w-4"/></Button>
                            <Button size="icon" variant="ghost" onClick={() => onDeleteMeal(meal.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    </div>
                  )}
                  {index < meals.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">No meals logged yet today. <br/> Use the logger to get started!</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
