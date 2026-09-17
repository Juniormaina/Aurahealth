import type { Food, FoodCategory } from '../types/lifestyle';

/**
 * Local Kenyan / East African food estimates per typical home serving.
 * Values are approximate for wellness tracking — not clinical nutrition.
 */
export const KENYAN_FOODS: Food[] = [
  // Staples
  { id: 'ugali', name: 'Ugali', category: 'staple', servingSize: '1 cup cooked (~200g)', calories: 220, protein: 4, carbohydrates: 46, fat: 1 },
  { id: 'rice', name: 'Rice', category: 'staple', servingSize: '1 cup cooked (~180g)', calories: 205, protein: 4, carbohydrates: 45, fat: 0.5 },
  { id: 'chapati', name: 'Chapati', category: 'staple', servingSize: '1 piece (~60g)', calories: 180, protein: 5, carbohydrates: 28, fat: 6 },
  { id: 'githeri', name: 'Githeri', category: 'staple', servingSize: '1 bowl (~250g)', calories: 280, protein: 12, carbohydrates: 42, fat: 6 },
  { id: 'mukimo', name: 'Mukimo', category: 'staple', servingSize: '1 cup (~220g)', calories: 240, protein: 7, carbohydrates: 40, fat: 5 },
  { id: 'matoke', name: 'Matoke', category: 'staple', servingSize: '1 cup (~200g)', calories: 180, protein: 2, carbohydrates: 42, fat: 0.5 },
  { id: 'pilau', name: 'Pilau', category: 'staple', servingSize: '1 plate (~280g)', calories: 420, protein: 14, carbohydrates: 55, fat: 14 },
  // Vegetables
  { id: 'sukuma', name: 'Sukuma wiki', category: 'vegetable', servingSize: '1 cup cooked (~120g)', calories: 50, protein: 3, carbohydrates: 7, fat: 2 },
  { id: 'cabbage', name: 'Cabbage', category: 'vegetable', servingSize: '1 cup cooked (~150g)', calories: 45, protein: 2, carbohydrates: 8, fat: 1 },
  { id: 'spinach', name: 'Spinach', category: 'vegetable', servingSize: '1 cup cooked (~120g)', calories: 40, protein: 3, carbohydrates: 5, fat: 1 },
  { id: 'managu', name: 'Managu', category: 'vegetable', servingSize: '1 cup cooked (~120g)', calories: 45, protein: 3, carbohydrates: 6, fat: 1.5 },
  { id: 'terere', name: 'Terere', category: 'vegetable', servingSize: '1 cup cooked (~120g)', calories: 40, protein: 3, carbohydrates: 5, fat: 1 },
  // Protein
  { id: 'beef', name: 'Beef', category: 'protein', servingSize: '1 serving (~100g cooked)', calories: 250, protein: 26, carbohydrates: 0, fat: 16 },
  { id: 'chicken', name: 'Chicken', category: 'protein', servingSize: '1 serving (~100g cooked)', calories: 200, protein: 27, carbohydrates: 0, fat: 9 },
  { id: 'fish', name: 'Fish', category: 'protein', servingSize: '1 serving (~100g cooked)', calories: 150, protein: 25, carbohydrates: 0, fat: 5 },
  { id: 'omena', name: 'Omena', category: 'protein', servingSize: '1 cup (~80g)', calories: 180, protein: 22, carbohydrates: 0, fat: 9 },
  { id: 'beans', name: 'Beans', category: 'protein', servingSize: '1 cup cooked (~170g)', calories: 220, protein: 15, carbohydrates: 40, fat: 1 },
  { id: 'ndengu', name: 'Ndengu', category: 'protein', servingSize: '1 cup cooked (~170g)', calories: 210, protein: 14, carbohydrates: 38, fat: 1 },
  { id: 'eggs', name: 'Eggs', category: 'protein', servingSize: '2 large eggs', calories: 140, protein: 12, carbohydrates: 1, fat: 10 },
  // Other
  { id: 'nyama_choma', name: 'Nyama choma', category: 'other', servingSize: '1 serving (~120g)', calories: 320, protein: 28, carbohydrates: 0, fat: 22 },
  { id: 'avocado', name: 'Avocado', category: 'other', servingSize: '½ fruit', calories: 120, protein: 1.5, carbohydrates: 6, fat: 11 },
  { id: 'milk', name: 'Milk', category: 'other', servingSize: '1 cup (250ml)', calories: 150, protein: 8, carbohydrates: 12, fat: 8 },
  { id: 'tea', name: 'Tea (with milk)', category: 'other', servingSize: '1 cup', calories: 60, protein: 2, carbohydrates: 8, fat: 2 },
  { id: 'mandazi', name: 'Mandazi', category: 'other', servingSize: '1 piece', calories: 180, protein: 3, carbohydrates: 24, fat: 8 },
  { id: 'fruits', name: 'Fruits (mixed)', category: 'other', servingSize: '1 medium portion', calories: 90, protein: 1, carbohydrates: 22, fat: 0.5 },
];

export const FOOD_CATEGORIES: { id: FoodCategory; label: string }[] = [
  { id: 'staple', label: 'Staples' },
  { id: 'vegetable', label: 'Vegetables' },
  { id: 'protein', label: 'Protein' },
  { id: 'other', label: 'Other' },
];

export function getFoodById(id: string): Food | undefined {
  return KENYAN_FOODS.find((f) => f.id === id);
}

export function foodsByCategory(category: FoodCategory): Food[] {
  return KENYAN_FOODS.filter((f) => f.category === category);
}
