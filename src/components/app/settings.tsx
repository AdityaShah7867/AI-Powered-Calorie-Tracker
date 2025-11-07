"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Cog } from "lucide-react";
import type { DietaryPreference } from "@/lib/types";

interface SettingsProps {
  calorieGoal: number;
  onCalorieGoalChange: (value: number) => void;
  proteinGoal?: number;
  onProteinGoalChange?: (value: number) => void;
  dietPreference: DietaryPreference;
  onDietPreferenceChange: (value: DietaryPreference) => void;
  weeklyTarget: number;
  onWeeklyTargetChange: (value: number) => void;
}

export function Settings({ calorieGoal, onCalorieGoalChange, proteinGoal = 150, onProteinGoalChange, dietPreference, onDietPreferenceChange, weeklyTarget, onWeeklyTargetChange }: SettingsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Cog className="h-5 w-5" />
        <div className="flex-1">
          <CardTitle className="font-headline">Settings</CardTitle>
          <CardDescription>Adjust your goals and preferences</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="calorie-goal">Daily Calorie Goal (kcal)</Label>
          <Input
            id="calorie-goal"
            type="number"
            value={calorieGoal}
            onChange={(e) => onCalorieGoalChange(Number(e.target.value))}
            className="text-lg"
            disabled
          />
           <p className="text-xs text-muted-foreground">Daily goal is based on your weekly target.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="weekly-target">Weekly Calorie Target (kcal)</Label>
          <Input
            id="weekly-target"
            type="number"
            value={weeklyTarget}
            onChange={(e) => onWeeklyTargetChange(Number(e.target.value))}
            className="text-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="protein-goal">Daily Protein Goal (g)</Label>
          <Input
            id="protein-goal"
            type="number"
            value={proteinGoal}
            onChange={(e) => onProteinGoalChange?.(Number(e.target.value))}
            className="text-lg"
          />
          <p className="text-xs text-muted-foreground">Recommended: 1.6-2.2g per kg of body weight.</p>
        </div>
        <div className="space-y-3">
          <Label>Dietary Preference</Label>
          <RadioGroup 
            value={dietPreference}
            onValueChange={(value: DietaryPreference) => onDietPreferenceChange(value)}
            >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vegetarian-eggless" id="veg" />
              <Label htmlFor="veg">Vegetarian (eggless)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="non-vegetarian" id="non-veg" />
              <Label htmlFor="non-veg">Non-Vegetarian</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
