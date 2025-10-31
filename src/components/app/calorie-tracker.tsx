"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CalorieTrackerProps {
  totalCalories: number;
  calorieGoal: number;
}

export function CalorieTracker({ totalCalories, calorieGoal }: CalorieTrackerProps) {
  const progress = (totalCalories / calorieGoal) * 100;
  const remainingCalories = calorieGoal - totalCalories;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Daily Calorie-Deficit Tracker</CardTitle>
        <CardDescription>Your progress for today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-4 w-full">
          <Progress value={progress} className="h-4" />
          <div
            className="absolute left-0 top-0 h-4 flex items-center justify-center text-xs font-bold text-primary-foreground"
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            {Math.round(progress)}%
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Consumed</p>
            <p className="text-2xl font-bold">{totalCalories.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Goal</p>
            <p className="text-2xl font-bold text-primary">{calorieGoal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className={`text-2xl font-bold ${remainingCalories < 0 ? 'text-destructive' : ''}`}>{remainingCalories.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
