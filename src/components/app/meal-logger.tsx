"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Mic, NotebookPen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MealLoggerProps {
  onLogMeal: (description: string) => Promise<void>;
  isLogging: boolean;
}

export function MealLogger({ onLogMeal, isLogging }: MealLoggerProps) {
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onLogMeal(description.trim());
      setDescription("");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <NotebookPen className="h-5 w-5" />
        <div className="flex-1">
            <CardTitle className="font-headline">Log a Meal with AI</CardTitle>
            <CardDescription>Describe your meal and let AI do the rest.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
