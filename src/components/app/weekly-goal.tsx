'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Meal } from "@/lib/types";
import { getDay } from 'date-fns';

interface WeeklyGoalProps {
    weeklyTarget: number;
    weeklyMeals: Meal[];
}

export function WeeklyGoal({ weeklyTarget, weeklyMeals }: WeeklyGoalProps) {
    const weeklyConsumed = weeklyMeals.reduce((acc, meal) => acc + meal.calories, 0);
    const weeklyRemaining = weeklyTarget - weeklyConsumed;
    const progress = (weeklyConsumed / weeklyTarget) * 100;
    
    const today = new Date();
    const dayOfWeek = getDay(today); // Sunday = 0, Monday = 1, etc.
    const daysRemaining = 7 - dayOfWeek;
    const dailyAverageRemaining = daysRemaining > 0 ? Math.round(weeklyRemaining / daysRemaining) : 0;
    
    let suggestionText = "You're on track for your weekly goal!";
    if (dailyAverageRemaining < 0) {
        suggestionText = `You're over your average. Try to consume less today.`;
    } else if (dailyAverageRemaining < 1000) {
        suggestionText = `Looking good! Aim for around ${dailyAverageRemaining} kcal today.`;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Weekly Goal Tracker</CardTitle>
                <CardDescription>{suggestionText}</CardDescription>
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
                        <p className="text-sm text-muted-foreground">Consumed (Week)</p>
                        <p className="text-2xl font-bold">{weeklyConsumed.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Weekly Goal</p>
                        <p className="text-2xl font-bold text-primary">{weeklyTarget.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Avg. Daily Remaining</p>
                        <p className={`text-2xl font-bold ${dailyAverageRemaining < 0 ? 'text-destructive' : ''}`}>{dailyAverageRemaining.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">kcal/day</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
