import { KENYAN_FOODS } from '../content/kenyanFoods';
import type { Food } from '../types/lifestyle';

/**
 * Food recognition provider interface.
 * MVP: manual selection only — no computer vision.
 * Swap `manualFoodRecognition` for a future AI provider without rewriting UI.
 */
export interface FoodRecognitionResult {
  candidates: Food[];
  provider: 'manual' | 'ai';
  note: string;
}

export interface FoodRecognitionProvider {
  recognizeFromImage(_image: Blob | string): Promise<FoodRecognitionResult>;
}

/** MVP provider — returns popular local foods for the user to confirm manually */
export const manualFoodRecognition: FoodRecognitionProvider = {
  async recognizeFromImage() {
    const popularIds = ['ugali', 'sukuma', 'beef', 'avocado', 'chapati', 'githeri'];
    const candidates = popularIds
      .map((id) => KENYAN_FOODS.find((f) => f.id === id))
      .filter((f): f is Food => Boolean(f));
    return {
      candidates,
      provider: 'manual',
      note: 'Automatic food recognition is not enabled yet. Pick what is on your plate from the local food list.',
    };
  },
};

let activeProvider: FoodRecognitionProvider = manualFoodRecognition;

export function setFoodRecognitionProvider(provider: FoodRecognitionProvider) {
  activeProvider = provider;
}

export function getFoodRecognitionProvider(): FoodRecognitionProvider {
  return activeProvider;
}

export async function recognizeFood(image: Blob | string): Promise<FoodRecognitionResult> {
  return activeProvider.recognizeFromImage(image);
}
