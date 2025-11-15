"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cog, Brain } from "lucide-react";
import type { DietaryPreference } from "@/lib/types";
import { useEffect, useState } from "react";
import { getAvailableAIModels } from "@/app/actions";
import type { GeminiModel } from "@/ai/models";

interface SettingsProps {
  calorieGoal: number;
  onCalorieGoalChange: (value: number) => void;
  proteinGoal?: number;
  onProteinGoalChange?: (value: number) => void;
  dietPreference: DietaryPreference;
  onDietPreferenceChange: (value: DietaryPreference) => void;
  weeklyTarget: number;
  onWeeklyTargetChange: (value: number) => void;
  aiModel?: string;
  onAIModelChange?: (value: string) => void;
}

export function Settings({ calorieGoal, onCalorieGoalChange, proteinGoal = 150, onProteinGoalChange, dietPreference, onDietPreferenceChange, weeklyTarget, onWeeklyTargetChange, aiModel = 'gemini-2.5-flash', onAIModelChange }: SettingsProps) {
  const [availableModels, setAvailableModels] = useState<GeminiModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  useEffect(() => {
    async function loadModels() {
      setIsLoadingModels(true);
      const result = await getAvailableAIModels();
      if (result.success && result.data) {
        setAvailableModels(result.data);
      }
      setIsLoadingModels(false);
    }
    loadModels();
  }, []);

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
        
        {onAIModelChange && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="ai-model">AI Model</Label>
            </div>
            <Select value={aiModel} onValueChange={onAIModelChange} disabled={isLoadingModels}>
              <SelectTrigger id="ai-model">
                <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select AI model"} />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.name} value={model.name}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{model.displayName}</span>
                      {model.description && (
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the AI model for meal analysis. Flash models are faster, Pro models are more accurate.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
