'use client';

import { useState, useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { Meal } from '@/lib/types';

function SummaryCard({ title, value, unit }: { title: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg bg-card p-4 text-center shadow">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{unit}</p>
    </div>
  );
}

export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });

  const mealsQuery = useMemoFirebase(() => {
    if (!user || !date?.from || !date?.to) return null;
    
    const fromDate = new Date(date.from);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(date.to);
    toDate.setHours(23, 59, 59, 999);

    return query(
      collection(firestore, 'users', user.uid, 'meals'),
      where('date', '>=', fromDate.toISOString()),
      where('date', '<=', toDate.toISOString()),
      orderBy('date', 'desc')
    );
  }, [firestore, user, date]);
  
  const { data: meals, isLoading: mealsLoading } = useCollection<Meal>(mealsQuery);

  const summaryStats = useMemo(() => {
    if (!meals || meals.length === 0) {
      return { totalCalories: 0, avgCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 };
    }
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbohydrates || 0), 0);
    const totalFat = meals.reduce((sum, meal) => sum + (meal.fat || 0), 0);
    const avgCalories = totalCalories / meals.length;

    return { 
        totalCalories, 
        avgCalories,
        totalProtein,
        totalCarbs,
        totalFat,
    };
  }, [meals]);


  if (isUserLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Meal History & Summary</CardTitle>
                <CardDescription>Review your logged meals and nutritional trends.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className="w-[300px] justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                            date.to ? (
                                <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pick a date</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                    <div className='flex items-center gap-2'>
                        <Button variant="outline" size="sm" onClick={() => setDate({from: startOfWeek(new Date()), to: endOfWeek(new Date())})}>This Week</Button>
                        <Button variant="outline" size="sm" onClick={() => setDate({from: startOfMonth(new Date()), to: endOfMonth(new Date())})}>This Month</Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <SummaryCard title="Total Calories" value={summaryStats.totalCalories.toLocaleString()} unit="kcal" />
                    <SummaryCard title="Avg. Meal Cals" value={summaryStats.avgCalories.toFixed(0)} unit="kcal" />
                    <SummaryCard title="Total Protein" value={summaryStats.totalProtein.toFixed(0)} unit="grams" />
                    <SummaryCard title="Total Carbs" value={summaryStats.totalCarbs.toFixed(0)} unit="grams" />
                    <SummaryCard title="Total Fat" value={summaryStats.totalFat.toFixed(0)} unit="grams" />
                </div>
                
                <Separator/>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Logged Meals</h3>
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                    {mealsLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : meals && meals.length > 0 ? (
                        <div className="space-y-4">
                        {meals.map((meal) => (
                            <div key={meal.id} className="text-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold">{format(new Date(meal.date), "PPP p")}</p>
                                        <p className="text-muted-foreground">{meal.description}</p>
                                    </div>
                                    <Badge variant="secondary" className="font-bold text-base bg-accent/20 text-accent-foreground">{meal.calories} kcal</Badge>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs mt-1">
                                    {meal.protein && <Badge variant="outline">P: {meal.protein}g</Badge>}
                                    {meal.carbohydrates && <Badge variant="outline">C: {meal.carbohydrates}g</Badge>}
                                    {meal.fat && <Badge variant="outline">F: {meal.fat}g</Badge>}
                                    {meal.fiber && <Badge variant="outline">Fb: {meal.fiber}g</Badge>}
                                </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-center">
                            <p className="text-sm text-muted-foreground">No meals found in this date range.</p>
                        </div>
                    )}
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
