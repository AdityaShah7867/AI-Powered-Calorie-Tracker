/**
 * @fileOverview Utilities for managing AI models
 * 
 * This file provides functions to fetch available Gemini models and manage model configurations
 */

export interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  supportedGenerationMethods: string[];
}

/**
 * Fetches the list of available Gemini models from the Google AI API
 * @returns Promise containing array of available models
 */
export async function fetchAvailableModels(): Promise<GeminiModel[]> {
  'use server';
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('API key not found (GOOGLE_GENAI_API_KEY or GEMINI_API_KEY)');
    return getDefaultModels();
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch models:', response.statusText);
      return getDefaultModels();
    }

    const data = await response.json();
    
    // Filter for models that support generateContent
    const models = data.models
      .filter((model: any) => 
        model.supportedGenerationMethods?.includes('generateContent')
      )
      .map((model: any) => ({
        name: model.name.replace('models/', ''),
        displayName: model.displayName || model.name.replace('models/', ''),
        description: model.description || '',
        supportedGenerationMethods: model.supportedGenerationMethods || [],
      }));

    return models.length > 0 ? models : getDefaultModels();
  } catch (error) {
    console.error('Error fetching models:', error);
    return getDefaultModels();
  }
}

/**
 * Returns a list of default/fallback models
 */
function getDefaultModels(): GeminiModel[] {
  return [
    {
      name: 'gemini-2.5-flash',
      displayName: 'Gemini 2.5 Flash (Recommended)',
      description: 'Stable version of Gemini 2.5 Flash, our mid-size multimodal model',
      supportedGenerationMethods: ['generateContent'],
    },
    {
      name: 'gemini-2.5-flash-lite',
      displayName: 'Gemini 2.5 Flash-Lite',
      description: 'Lighter, faster version for high-volume tasks',
      supportedGenerationMethods: ['generateContent'],
    },
    {
      name: 'gemini-2.5-pro',
      displayName: 'Gemini 2.5 Pro',
      description: 'Most capable model for complex reasoning tasks',
      supportedGenerationMethods: ['generateContent'],
    },
    {
      name: 'gemini-2.0-flash',
      displayName: 'Gemini 2.0 Flash',
      description: 'Fast and versatile multimodal model',
      supportedGenerationMethods: ['generateContent'],
    },
    {
      name: 'gemini-flash-latest',
      displayName: 'Gemini Flash (Auto-Latest)',
      description: 'Automatically uses the latest Flash model version',
      supportedGenerationMethods: ['generateContent'],
    },
  ];
}

/**
 * Get recommended models for food analysis
 */
export async function getRecommendedModels(): Promise<string[]> {
  'use server';
  return [
    'gemini-2.5-flash',      // Best balance of speed and accuracy (recommended)
    'gemini-2.5-pro',        // Better accuracy, slower
    'gemini-2.0-flash',      // Faster alternative
  ];
}

/**
 * Formats model name for genkit (adds googleai/ prefix)
 */
export async function formatModelForGenkit(modelName: string): Promise<string> {
  'use server';
  return modelName.startsWith('googleai/') ? modelName : `googleai/${modelName}`;
}

/**
 * Extracts model name from genkit format (removes googleai/ prefix)
 */
export async function extractModelName(genkitModel: string): Promise<string> {
  'use server';
  return genkitModel.replace('googleai/', '');
}
