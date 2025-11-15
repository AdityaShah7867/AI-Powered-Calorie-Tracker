# AI Model Fix Documentation

## Problem Fixed
The application was trying to use `gemini-2.5-flash` which doesn't exist in the Google AI API, causing a 404 error:
```
Error: models/gemini-2.5-pro is not found for API version v1beta
```

## Solution Implemented

### 1. **Fixed Default Model** (`src/ai/genkit.ts`)
- Changed from invalid `gemini-2.5-flash` to valid `gemini-1.5-flash`
- Added comments listing available models

### 2. **Created Model Management Utility** (`src/ai/models.ts`)
- `fetchAvailableModels()`: Fetches live list of available models from Google AI API
- `getDefaultModels()`: Provides fallback models if API call fails
- `getRecommendedModels()`: Lists recommended models for food analysis
- Helper functions for model name formatting

### 3. **Added Server Action** (`src/app/actions.ts`)
- `getAvailableAIModels()`: Server action to fetch models for client components

### 4. **Updated Settings UI** (`src/components/app/settings.tsx`)
- Added AI model selection dropdown
- Fetches available models on component mount
- Shows model descriptions to help users choose
- Displays helpful guidance text

### 5. **Added State Management** (`src/components/app/dashboard.tsx`)
- Added `aiModel` state to track user's preferred model
- Created `handleAIModelChange()` to persist model preference to Firestore
- Initializes with saved preference or defaults to `gemini-1.5-flash`

### 6. **Updated Types** (`src/lib/types.ts`)
- Added optional `aiModel` field to `UserSettings` type

## Available Models

### Recommended Models:
- **gemini-1.5-flash** (default): Fast and versatile, best for most use cases
- **gemini-1.5-flash-8b**: Even faster, good for high-volume simple tasks
- **gemini-1.5-pro**: More accurate for complex reasoning, slower
- **gemini-2.0-flash-exp**: Experimental next-gen model

## User Features

Users can now:
1. View all available Gemini models in Settings
2. Switch between models based on their needs (speed vs accuracy)
3. See descriptions to make informed choices
4. Have their preference saved to Firestore

## Technical Details

- Model preferences are stored per-user in Firestore under `users/{uid}/settings`
- The app fetches the live list of models from Google AI API
- Falls back to hardcoded defaults if API call fails
- Changes apply to new AI requests immediately after saving

## Testing

After deployment:
1. Open the app and go to Settings
2. Scroll to the "AI Model" dropdown
3. Select a different model (e.g., gemini-1.5-pro)
4. Try logging a meal or analyzing a photo
5. The new model should be used for AI operations
