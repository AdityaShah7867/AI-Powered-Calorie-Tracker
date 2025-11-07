"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

import { Settings } from '@/components/app/settings';
import { CalorieTracker } from '@/components/app/calorie-tracker';
import { MealLogger } from '@/components/app/meal-logger';
import { MealHistory } from '@/components/app/meal-history';
import { FoodSuggestions } from '@/components/app/food-suggestions';
import { WeeklyGoal } from '@/components/app/weekly-goal';
import { QuickCalorieCheck } from '@/components/app/quick-calorie-check';
import { ProteinIntakeChart } from '@/components/app/protein-intake-chart';
import { PhotoMealLogger } from '@/components/app/photo-meal-logger';

import type { DietaryPreference, Meal, WeeklyTarget, UserSettings } from '@/lib/types';
import type { FoodItem } from '@/ai/flows/analyze-meal-image';
import { useToast } from '@/hooks/use-toast';
import { submitMeal } from '@/app/actions';
import { startOfWeek, endOfWeek } from 'date-fns';

export function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [dietPreference, setDietPreference] = useState<DietaryPreference>('vegetarian-eggless');
  
  const mealsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return query(
      collection(firestore, 'users', user.uid, 'meals'),
      where('date', '>=', today.toISOString()),
      orderBy('date', 'desc')
    );
  }, [firestore, user]);
  const { data: meals, isLoading: mealsLoading } = useCollection<Meal>(mealsQuery);

  // Query for all meals (for protein chart to access historical data)
  const allMealsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'meals'),
      orderBy('date', 'desc')
    );
  }, [firestore, user]);
  const { data: allMeals } = useCollection<Meal>(allMealsQuery);

  const weeklyTargetQuery = useMemoFirebase(() => {
    if (!user) return null;
    const today = new Date();
    const weekStart = startOfWeek(today).toISOString();
    return query(
      collection(firestore, 'users', user.uid, 'weeklyTargets'),
      where('startDate', '==', weekStart)
    );
  }, [firestore, user]);

  const { data: weeklyTargets } = useCollection<WeeklyTarget>(weeklyTargetQuery);
  const weeklyTarget = weeklyTargets?.[0];

  // Query for user settings (protein goal and dietary preference)
  const userSettingsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'settings')
    );
  }, [firestore, user]);

  const { data: userSettingsData } = useCollection<UserSettings>(userSettingsQuery);
  const userSettings = userSettingsData?.[0];

  const weeklyMealsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    return query(
        collection(firestore, 'users', user.uid, 'meals'),
        where('date', '>=', weekStart.toISOString()),
        where('date', '<=', weekEnd.toISOString())
    );
  }, [firestore, user]);
  const { data: weeklyMeals } = useCollection<Meal>(weeklyMealsQuery);

  const [isLoggingMeal, setIsLoggingMeal] = useState(false);

  // Initialize weekly target
  useEffect(() => {
    if (weeklyTarget) {
      setCalorieGoal(Math.round(weeklyTarget.targetCalories / 7));
    } else if(user){
        const weekStart = startOfWeek(new Date());
        const newTarget: Omit<WeeklyTarget, 'id'> = {
            userId: user.uid,
            startDate: weekStart.toISOString(),
            targetCalories: 14000
        };
        addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'weeklyTargets'), newTarget);
    }
  }, [weeklyTarget, user, firestore]);

  // Initialize user settings (protein goal and dietary preference)
  useEffect(() => {
    if (userSettings) {
      setProteinGoal(userSettings.proteinGoal);
      setDietPreference(userSettings.dietaryPreference);
    } else if (user) {
      // Create default settings for new users
      const defaultSettings: Omit<UserSettings, 'id'> = {
        userId: user.uid,
        proteinGoal: 150,
        dietaryPreference: 'vegetarian-eggless'
      };
      addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'settings'), defaultSettings);
    }
  }, [userSettings, user, firestore]);
  
  const totalCalories = useMemo(() => {
    return meals?.reduce((sum, meal) => sum + meal.calories, 0) || 0;
  }, [meals]);

  const handleLogMeal = async (mealDescription: string) => {
    if (!user) return;
    setIsLoggingMeal(true);
    const result = await submitMeal({ mealDescription });
    if (result.success && result.data) {
      const newMeal: Omit<Meal, 'id'> = {
        userId: user.uid,
        name: 'Meal',
        date: new Date().toISOString(),
        description: mealDescription,
        foodItems: result.data.foodItems,
        calories: result.data.estimatedCalories,
        protein: result.data.protein,
        carbohydrates: result.data.carbohydrates,
        fat: result.data.fat,
        fiber: result.data.fiber,
      };
      await addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'meals'), newMeal);
      toast({
        title: "Meal Logged!",
        description: `Estimated ${result.data.estimatedCalories} calories.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
    setIsLoggingMeal(false);
  };

  const handleLogPhotoMeal = async (foodItems: FoodItem[], imageUrl: string) => {
    if (!user) return;
    
    // Calculate totals from food items
    const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = foodItems.reduce((sum, item) => sum + (item.protein || 0), 0);
    const totalCarbs = foodItems.reduce((sum, item) => sum + (item.carbohydrates || 0), 0);
    const totalFat = foodItems.reduce((sum, item) => sum + (item.fat || 0), 0);
    const totalFiber = foodItems.reduce((sum, item) => sum + (item.fiber || 0), 0);
    
    const newMeal: Omit<Meal, 'id'> = {
      userId: user.uid,
      name: 'Photo Meal',
      date: new Date().toISOString(),
      description: foodItems.map(item => `${item.name} (${item.quantity})`).join(', '),
      foodItems: foodItems.map(item => item.name),
      calories: totalCalories,
      protein: totalProtein,
      carbohydrates: totalCarbs,
      fat: totalFat,
      fiber: totalFiber,
    };
    
    await addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'meals'), newMeal);
    toast({
      title: "Photo Meal Logged!",
      description: `${foodItems.length} items, ${totalCalories} calories.`,
    });
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!user) return;
    const mealRef = doc(firestore, 'users', user.uid, 'meals', mealId);
    await deleteDocumentNonBlocking(mealRef);
    toast({ title: 'Meal Deleted' });
  };
  
  const handleUpdateMeal = async (mealId: string, updatedData: Partial<Meal>) => {
    if (!user) return;
    const mealRef = doc(firestore, 'users', user.uid, 'meals', mealId);
    await updateDocumentNonBlocking(mealRef, updatedData);
    toast({ title: 'Meal Updated' });
  };
  
  const handleWeeklyTargetChange = async (newTarget: number) => {
    if (!user) return;
    if (weeklyTarget) {
      const targetRef = doc(firestore, 'users', user.uid, 'weeklyTargets', weeklyTarget.id);
      await updateDocumentNonBlocking(targetRef, { targetCalories: newTarget });
    }
  };

  const handleProteinGoalChange = async (newProteinGoal: number) => {
    if (!user) return;
    setProteinGoal(newProteinGoal);
    if (userSettings) {
      const settingsRef = doc(firestore, 'users', user.uid, 'settings', userSettings.id);
      await updateDocumentNonBlocking(settingsRef, { proteinGoal: newProteinGoal });
      toast({ title: 'Protein Goal Updated', description: `New goal: ${newProteinGoal}g` });
    }
  };

  const handleDietPreferenceChange = async (newPreference: DietaryPreference) => {
    if (!user) return;
    setDietPreference(newPreference);
    if (userSettings) {
      const settingsRef = doc(firestore, 'users', user.uid, 'settings', userSettings.id);
      await updateDocumentNonBlocking(settingsRef, { dietaryPreference: newPreference });
      toast({ title: 'Dietary Preference Updated' });
    }
  };

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:grid-cols-3">
      <div className="grid gap-4 lg:col-span-2">
        <CalorieTracker totalCalories={totalCalories} calorieGoal={calorieGoal} />
        <div className="grid md:grid-cols-2 gap-4">
            <MealLogger onLogMeal={handleLogMeal} isLogging={isLoggingMeal} />
            <QuickCalorieCheck />
        </div>
        <PhotoMealLogger onLogMeal={handleLogPhotoMeal} />
        <WeeklyGoal
          weeklyTarget={weeklyTarget?.targetCalories || 14000}
          weeklyMeals={weeklyMeals || []}
        />
        <FoodSuggestions 
            dietPreference={dietPreference}
            calorieGoal={calorieGoal}
        />
      </div>
      <div className="grid gap-4">
        <ProteinIntakeChart meals={allMeals || []} proteinGoal={proteinGoal} />
        <Settings
          calorieGoal={calorieGoal}
          onCalorieGoalChange={setCalorieGoal}
          proteinGoal={proteinGoal}
          onProteinGoalChange={handleProteinGoalChange}
          dietPreference={dietPreference}
          onDietPreferenceChange={handleDietPreferenceChange}
          weeklyTarget={weeklyTarget?.targetCalories || 14000}
          onWeeklyTargetChange={handleWeeklyTargetChange}
        />
        <MealHistory 
            meals={meals || []} 
            isLoading={mealsLoading}
            onDeleteMeal={handleDeleteMeal}
            onUpdateMeal={handleUpdateMeal}
        />
      </div>
    </div>
  );
}
