"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Meal } from '@/lib/types';

interface ProteinIntakeChartProps {
  meals: Meal[];
  proteinGoal?: number;
}

export function ProteinIntakeChart({ meals, proteinGoal = 150 }: ProteinIntakeChartProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { totalProtein, chartData } = useMemo(() => {
    // Filter meals for the selected date
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const filteredMeals = meals.filter(meal => {
      const mealDateStr = new Date(meal.date).toISOString().split('T')[0];
      return mealDateStr === selectedDateStr;
    });

    // Calculate total protein for the day
    const total = filteredMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    
    // Prepare data for pie chart
    const consumed = Math.min(total, proteinGoal);
    const remaining = Math.max(0, proteinGoal - total);
    
    return {
      totalProtein: total,
      chartData: [
        {
          name: "Consumed",
          value: consumed,
          fill: "hsl(var(--chart-1))",
        },
        {
          name: "Remaining",
          value: remaining,
          fill: "hsl(var(--chart-2))",
        },
      ].filter(item => item.value > 0),
    };
  }, [meals, selectedDate, proteinGoal]);

  const percentage = Math.round((totalProtein / proteinGoal) * 100);
  const isOverGoal = totalProtein > proteinGoal;

  const chartConfig = {
    consumed: {
      label: "Consumed",
      color: "hsl(var(--chart-1))",
    },
    remaining: {
      label: "Remaining",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline">Daily Protein Intake</CardTitle>
            <CardDescription>Track your protein consumption</CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
              No protein data for this day
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4 text-center w-full">
            <div>
              <p className="text-sm text-muted-foreground">Consumed</p>
              <p className="text-2xl font-bold">{totalProtein.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Goal</p>
              <p className="text-2xl font-bold text-primary">{proteinGoal}</p>
              <p className="text-xs text-muted-foreground">g</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className={`text-2xl font-bold ${isOverGoal ? 'text-green-500' : ''}`}>
                {percentage}%
              </p>
              <p className="text-xs text-muted-foreground">
                {isOverGoal ? 'Over goal!' : 'of goal'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
