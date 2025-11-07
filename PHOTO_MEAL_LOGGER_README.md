# Photo Meal Logger Feature

## Overview
This feature allows users to log meals by uploading or taking photos. The AI analyzes the image, detects food items, estimates nutritional values, and allows users to verify/edit before submitting.

## Features Implemented

### 1. **Photo Upload & Camera Capture**
- Upload meal photos from device
- Take photos directly using device camera
- Support for front and back camera

### 2. **AI Image Analysis**
- Powered by Google Gemini 2.5 Flash with vision capabilities
- Detects individual food items in the image
- Estimates portion sizes for each item
- Calculates nutritional values:
  - Calories
  - Protein
  - Carbohydrates
  - Fat
  - Fiber

### 3. **Verification & Editing Interface**
- Review AI-detected food items
- Edit food names and quantities
- Modify nutritional values if needed
- Add missing items manually
- Remove incorrect detections
- See real-time totals

### 4. **Database Integration**
- Meals saved with all nutritional data
- Photo meals marked as "Photo Meal" type
- Full description includes all items and quantities
- Integrates with existing meal tracking system

## Files Created/Modified

### New Files:
1. **`src/ai/flows/analyze-meal-image.ts`**
   - AI flow for image analysis
   - Multimodal prompt with vision support
   - Structured output schema

2. **`src/components/app/photo-meal-logger.tsx`**
   - Complete photo meal logging UI
   - Camera integration
   - Editing interface
   - Form validation

### Modified Files:
1. **`src/app/actions.ts`**
   - Added `analyzeMealPhoto` server action

2. **`src/components/app/dashboard.tsx`**
   - Added `PhotoMealLogger` component
   - Added `handleLogPhotoMeal` handler
   - Imported FoodItem type

## How to Use

### For Users:
1. Click **"Upload Photo"** or **"Take Photo"** button
2. Select/capture an image of your meal
3. Wait for AI analysis (a few seconds)
4. Review detected food items:
   - Click edit icon to modify any item
   - Add missing items with "+ Add Item" button
   - Remove incorrect items
5. Verify nutritional totals
6. Click **"Log Meal"** to save

### For Developers:

#### Server Action:
```typescript
import { analyzeMealPhoto } from '@/app/actions';

const result = await analyzeMealPhoto({ 
  imageUrl: base64ImageString 
});
```

#### Component Usage:
```tsx
<PhotoMealLogger onLogMeal={handleLogPhotoMeal} />
```

## API Schema

### Input (AnalyzeMealImageInput):
```typescript
{
  imageUrl: string // Base64 data URL or image URL
}
```

### Output (AnalyzeMealImageOutput):
```typescript
{
  foodItems: Array<{
    name: string
    quantity: string
    calories: number
    protein?: number
    carbohydrates?: number
    fat?: number
    fiber?: number
  }>
  totalCalories: number
  totalProtein: number
  totalCarbohydrates: number
  totalFat: number
  totalFiber: number
  confidence?: string
  suggestions?: string
}
```

## Technical Details

### AI Model:
- **Model**: Google Gemini 2.5 Flash
- **Capabilities**: Multimodal (text + vision)
- **Temperature**: 0.7 (balanced creativity)

### Image Processing:
- Accepts: JPEG, PNG, WebP
- Format: Base64 data URLs
- Camera: Uses MediaDevices API
- Canvas: For image capture from video stream

### State Management:
- Local state for image and food items
- Real-time editing with instant updates
- Optimistic UI updates

## Browser Compatibility
- Modern browsers with MediaDevices API
- Camera requires HTTPS in production
- File upload works on all browsers

## Security Considerations
- Images processed client-side before upload
- Base64 encoding for data transfer
- Firestore rules apply to saved meals
- User authentication required

## Future Enhancements
- [ ] Image compression before analysis
- [ ] Batch photo upload
- [ ] Photo gallery for meal history
- [ ] Barcode scanning for packaged foods
- [ ] Voice notes for meal context
- [ ] Share meal photos with nutritionist
- [ ] Export meal photos to PDF reports

## Notes
- First photo analysis may take 3-5 seconds
- Accuracy depends on image quality and lighting
- Best results with clear, well-lit photos
- Multiple angles can improve detection
- AI provides estimates - always verify accuracy
