"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Zap } from "lucide-react";
import { quickCheckCalories } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";

export function QuickCalorieCheck() {
  const [description, setDescription] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{calories: number, items: string[]} | null>(null);
  const { toast } = useToast();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
        setIsChecking(true);
        setResult(null);
        const response = await quickCheckCalories({ mealDescription: description.trim() });
        if(response.success && response.data) {
            setResult({calories: response.data.estimatedCalories, items: response.data.foodItems});
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: response.error
            });
        }
        setIsChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Zap className="h-5 w-5" />
        <div className="flex-1">
            <CardTitle className="font-headline">Quick Calorie Check</CardTitle>
            <CardDescription>Estimate calories without logging.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCheck} className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="quick-check-description">Food item or description</Label>
            <Textarea
              id="quick-check-description"
              placeholder="e.g., One medium apple"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <Button type="submit" disabled={isChecking || !description.trim()} className="w-full">
            {isChecking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Check Calories'
            )}
          </Button>
        </form>
        {result && (
            <div className="mt-4 rounded-lg border bg-card p-4">
                <div className="flex justify-between items-center">
                    <p className="font-medium">Estimated Calories</p>
                    <Badge variant="secondary" className="font-bold text-base bg-accent/20 text-accent-foreground">{result.calories} kcal</Badge>
                </div>
                <div className="flex flex-wrap gap-1 pt-2">
                    {result.items.map(item => (
                        <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                    ))}
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
