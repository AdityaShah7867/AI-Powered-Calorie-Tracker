"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X, Plus, Trash2, Edit2, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeMealPhoto } from '@/app/actions';
import type { FoodItem } from '@/ai/flows/analyze-meal-image';
import Image from 'next/image';

interface PhotoMealLoggerProps {
  onLogMeal: (foodItems: FoodItem[], imageUrl: string) => Promise<void>;
}

export function PhotoMealLogger({ onLogMeal }: PhotoMealLoggerProps) {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload an image file.",
      });
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setImage(base64);
      await analyzeImage(base64);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process image.",
      });
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
      });
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setImage(imageData);
      stopCamera();
      analyzeImage(imageData);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // Analyze image with AI
  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeMealPhoto({ imageUrl: imageData });
      if (result.success && result.data) {
        setFoodItems(result.data.foodItems);
        toast({
          title: "Image Analyzed!",
          description: `Found ${result.data.foodItems.length} food items.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: result.error || "Could not analyze the image.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze image.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Update food item
  const updateFoodItem = (index: number, field: keyof FoodItem, value: string | number) => {
    const updated = [...foodItems];
    updated[index] = { ...updated[index], [field]: value };
    setFoodItems(updated);
  };

  // Add new food item
  const addFoodItem = () => {
    setFoodItems([
      ...foodItems,
      {
        name: '',
        quantity: '',
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
      },
    ]);
    setEditingIndex(foodItems.length);
  };

  // Remove food item
  const removeFoodItem = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  // Submit meal
  const handleSubmit = async () => {
    if (!image || foodItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Cannot Submit",
        description: "Please upload an image and verify food items.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogMeal(foodItems, image);
      // Reset form
      setImage(null);
      setFoodItems([]);
      setEditingIndex(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log meal.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear all
  const handleClear = () => {
    setImage(null);
    setFoodItems([]);
    setEditingIndex(null);
    stopCamera();
  };

  const totalCalories = foodItems.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = foodItems.reduce((sum, item) => sum + (item.protein || 0), 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline">Photo Meal Logger</CardTitle>
        <CardDescription>Upload or capture a photo to log your meal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!image && !showCamera && (
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
            <Button
              onClick={startCamera}
              className="flex-1"
              variant="outline"
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {showCamera && (
          <div className="space-y-2">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2">
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {image && !showCamera && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={image}
                alt="Meal"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                onClick={handleClear}
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isAnalyzing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Analyzing meal...</span>
              </div>
            )}

            {!isAnalyzing && foodItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Detected Food Items</h3>
                  <Button onClick={addFoodItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {foodItems.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    {editingIndex === index ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={item.name}
                              onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                              placeholder="Food name"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              value={item.quantity}
                              onChange={(e) => updateFoodItem(index, 'quantity', e.target.value)}
                              placeholder="e.g., 1 cup"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Calories</Label>
                            <Input
                              type="number"
                              value={item.calories}
                              onChange={(e) => updateFoodItem(index, 'calories', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Protein (g)</Label>
                            <Input
                              type="number"
                              value={item.protein || 0}
                              onChange={(e) => updateFoodItem(index, 'protein', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Carbs (g)</Label>
                            <Input
                              type="number"
                              value={item.carbohydrates || 0}
                              onChange={(e) => updateFoodItem(index, 'carbohydrates', Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setEditingIndex(null)}
                            size="sm"
                            variant="outline"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Done
                          </Button>
                          <Button
                            onClick={() => removeFoodItem(index)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.quantity}</p>
                          <p className="text-sm">
                            {item.calories} cal | {item.protein}g protein
                          </p>
                        </div>
                        <Button
                          onClick={() => setEditingIndex(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-semibold">Total: {totalCalories} calories</p>
                  <p className="text-sm text-muted-foreground">
                    Protein: {totalProtein.toFixed(1)}g
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging Meal...
                    </>
                  ) : (
                    'Log Meal'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
