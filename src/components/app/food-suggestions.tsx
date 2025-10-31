"use client";

import React, { useState, useEffect } from 'react';
import { fetchSuggestions } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Loader2, Bot, UtensilsCrossed } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import type { DietaryPreference, SuggestionState } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface FoodSuggestionsProps {
  dietPreference: DietaryPreference;
  calorieGoal: number;
}

const OTHER_OPTION = "Other";

export function FoodSuggestions({ dietPreference, calorieGoal }: FoodSuggestionsProps) {
  const [conversationHistory, setConversationHistory] = useState<{ question: string; answer: string }[]>([]);
  const [suggestionState, setSuggestionState] = useState<SuggestionState>({ status: 'idle' });
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [otherValue, setOtherValue] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (suggestionState.status === 'awaiting-input') {
      const currentOptions = [...suggestionState.options];
      if (!currentOptions.includes(OTHER_OPTION)) {
        currentOptions.push(OTHER_OPTION);
      }
      setOptions(currentOptions);
    }
  }, [suggestionState]);

  const handleStart = async () => {
    setSuggestionState({ status: 'loading' });
    setConversationHistory([]);
    setOtherValue('');
    setSelectedValue('');
    await getNextStep('');
  };

  const handleAnswer = async () => {
    const answer = selectedValue === OTHER_OPTION ? otherValue : selectedValue;
    if (!answer) return;

    const currentQuestion = suggestionState.status === 'awaiting-input' ? suggestionState.question : '';
    setSuggestionState({ status: 'loading' });
    
    const newHistory = [...conversationHistory, { question: currentQuestion, answer }];
    setConversationHistory(newHistory);
    
    await getNextStep(answer, newHistory);
    setSelectedValue('');
    setOtherValue('');
  };

  const getNextStep = async (answer: string, history: { question: string; answer: string }[] = []) => {
    const result = await fetchSuggestions({
      dietaryPreferences: dietPreference,
      calorieGoal,
      conversationHistory: history,
    });

    if (result.success && result.data) {
      if (result.data.suggestions) {
        setSuggestionState({ status: 'suggestions-ready', suggestions: result.data.suggestions });
      } else if (result.data.nextQuestion) {
        setSuggestionState({
          status: 'awaiting-input',
          question: result.data.nextQuestion.question,
          options: result.data.nextQuestion.options,
        });
      } else {
         setSuggestionState({ status: 'error', message: 'Something went wrong.' });
      }
    } else {
      setSuggestionState({ status: 'error', message: result.error || 'Failed to get suggestions.' });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };
  
  const renderContent = () => {
    switch (suggestionState.status) {
      case 'loading':
        return (
          <div className="flex min-h-[150px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        );
      
      case 'awaiting-input':
        return (
          <div className="space-y-4">
            <p className="font-medium text-foreground">{suggestionState.question}</p>
            <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
              {options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="font-normal">{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {selectedValue === OTHER_OPTION && (
              <Input
                type="text"
                placeholder="Please specify"
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                className="mt-2"
              />
            )}
            <Button onClick={handleAnswer} disabled={!selectedValue || (selectedValue === OTHER_OPTION && !otherValue)}>Next</Button>
          </div>
        );
        
      case 'suggestions-ready':
        return (
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {suggestionState.suggestions.map((suggestion, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="font-medium text-primary hover:no-underline">
                     <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4" />
                        {suggestion.name}
                     </div>
                    </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground prose">
                    <p className="whitespace-pre-line">{suggestion.recipe}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Button onClick={handleStart} variant="outline">Start Over</Button>
          </div>
        );

      case 'error':
        return (
            <div className="text-center text-destructive-foreground min-h-[150px] flex flex-col justify-center items-center gap-4">
                <p>{suggestionState.message}</p>
                <Button onClick={handleStart} variant="outline">Try Again</Button>
            </div>
        )
      
      case 'idle':
      default:
        return (
          <div className="flex min-h-[150px] flex-col items-center justify-center gap-4 text-center">
            <Bot className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Let our AI chef help you find the perfect Indian meal!
            </p>
            <Button onClick={handleStart}>Start Questionnaire</Button>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          <div>
            <CardTitle className="font-headline">AI Chef Assistant</CardTitle>
            <CardDescription>Get personalized Indian meal suggestions.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
