import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Plus, Trash2, Utensils } from 'lucide-react';
import { FOOD_CATEGORIES, KENYAN_FOODS, foodsByCategory } from '../content/kenyanFoods';
import { buildMeal, buildMealItem, PORTION_LABELS } from '../lib/lifestyleCalculations';
import { addMeal, loadMeals } from '../lib/lifestyleStorage';
import { recognizeFood } from '../services/foodRecognition';
import type { FoodCategory, Meal, MealItem, PortionSize } from '../types/lifestyle';
import { IconBadge } from './ui/IconBadge';

interface FoodLensProps {
  userKey: string;
  onChanged?: () => void;
}

const PORTIONS: PortionSize[] = ['half', 'small', 'medium', 'full', 'large'];

export const FoodLens: React.FC<FoodLensProps> = ({ userKey, onChanged }) => {
  const [meals, setMeals] = useState<Meal[]>(() => loadMeals(userKey));
  const [category, setCategory] = useState<FoodCategory>('staple');
  const [draft, setDraft] = useState<MealItem[]>([]);
  const [portion, setPortion] = useState<PortionSize>('medium');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [manualPickNote, setManualPickNote] = useState<string | null>(null);
  const [pickCandidates, setPickCandidates] = useState<typeof KENYAN_FOODS>([]);

  useEffect(() => {
    setMeals(loadMeals(userKey));
  }, [userKey]);

  const foods = useMemo(() => foodsByCategory(category), [category]);
  const draftTotals = useMemo(() => {
    return draft.reduce(
      (acc, i) => ({
        calories: acc.calories + i.calories,
        protein: acc.protein + i.protein,
        carbohydrates: acc.carbohydrates + i.carbohydrates,
        fat: acc.fat + i.fat,
      }),
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
    );
  }, [draft]);

  const addFood = (foodId: string) => {
    const item = buildMealItem(foodId, portion);
    if (!item) return;
    setDraft((prev) => {
      const idx = prev.findIndex((p) => p.foodId === foodId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [...prev, item];
    });
  };

  const removeFood = (foodId: string) => {
    setDraft((prev) => prev.filter((p) => p.foodId !== foodId));
  };

  const saveMeal = () => {
    if (!draft.length) return;
    const meal = buildMeal(draft, undefined, photoPreview ?? undefined);
    const next = addMeal(userKey, meal);
    setMeals(next);
    setDraft([]);
    setPhotoPreview(null);
    setCameraOpen(false);
    setManualPickNote(null);
    setPickCandidates([]);
    onChanged?.();
  };

  const onPhotoSelected = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      setPhotoPreview(dataUrl);
      const result = await recognizeFood(dataUrl);
      setManualPickNote(result.note);
      setPickCandidates(result.candidates);
      setCameraOpen(true);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <header className="glass-panel rounded-2xl p-5 sm:p-6">
        <p className="view-kicker">Eat · Kenyan Food Lens</p>
        <h2 className="view-title !text-2xl sm:!text-3xl mt-1">Food tracking that understands your plate.</h2>
        <p className="view-copy mt-2 max-w-2xl">
          Log ugali, sukuma, nyama choma, and more. Nutrition values are estimates for wellness — not clinical advice.
        </p>
      </header>

      <section className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IconBadge icon={Utensils} variant="teal" size="sm" />
            <h3 className="text-sm font-bold text-white">What&apos;s on your plate?</h3>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-harmony)] cursor-pointer px-3 py-2 rounded-xl border border-white/10 hover:border-white/25">
            <Camera className="w-3.5 h-3.5" />
            Food Lens photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onPhotoSelected(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {cameraOpen && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            {photoPreview && (
              <img src={photoPreview} alt="Meal preview" className="max-h-40 rounded-lg object-cover w-full" />
            )}
            <p className="text-xs text-slate-400 leading-relaxed">{manualPickNote}</p>
            <p className="text-sm font-semibold text-white">What do you have on your plate?</p>
            <div className="flex flex-wrap gap-2">
              {pickCandidates.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => addFood(f.id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-slate-200 hover:border-[var(--color-harmony)]/50"
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {FOOD_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                category === c.id
                  ? 'bg-primary text-[var(--color-primary-foreground)] border-transparent'
                  : 'border-white/10 text-slate-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Portion</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {PORTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPortion(p)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${
                  portion === p
                    ? 'border-[var(--color-harmony)] text-[var(--color-harmony)]'
                    : 'border-white/10 text-slate-400'
                }`}
              >
                {PORTION_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {foods.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => addFood(f.id)}
              className="text-left rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 hover:border-white/25"
            >
              <span className="text-sm font-semibold text-white block">{f.name}</span>
              <span className="text-[10px] text-slate-500">~{f.calories} kcal / serving</span>
            </button>
          ))}
        </div>

        {draft.length > 0 && (
          <div className="border-t border-white/10 pt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Estimated nutrition</p>
            <ul className="space-y-2">
              {draft.map((item) => (
                <li key={item.foodId} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-slate-200">
                    {item.foodName}{' '}
                    <span className="text-slate-500">({PORTION_LABELS[item.portion]})</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-slate-400 tabular-nums">~{item.calories} kcal</span>
                    <button type="button" aria-label={`Remove ${item.foodName}`} onClick={() => removeFood(item.foodId)} className="text-slate-500 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-slate-300 pt-2">
              ~<strong className="text-white">{draftTotals.calories} kcal</strong>
              {' · '}P {Math.round(draftTotals.protein)}g
              {' · '}C {Math.round(draftTotals.carbohydrates)}g
              {' · '}F {Math.round(draftTotals.fat)}g
            </p>
            <button
              type="button"
              onClick={saveMeal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-[var(--color-primary-foreground)] text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              Save meal
            </button>
          </div>
        )}
      </section>

      <section className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Recent meals</h3>
        {meals.length === 0 ? (
          <p className="text-sm text-slate-400">No meals logged yet.</p>
        ) : (
          <ul className="space-y-3">
            {meals.slice(0, 8).map((m) => (
              <li key={m.id} className="border-b border-white/5 pb-3 last:border-0">
                <p className="text-sm text-slate-200">{m.items.map((i) => i.foodName).join(' · ')}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Est. ~{m.totals.calories} kcal · {new Date(m.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
