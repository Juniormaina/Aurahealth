import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  Circle,
  Droplets,
  Pill,
  Moon,
  Activity,
  Sparkles,
  Flame,
  Plus,
  Zap,
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface DailyGoalHabit {
  id: string;
  name: string;
  category: 'hydration' | 'medication' | 'sleep' | 'activity' | 'wellness';
  current: number;
  target: number;
  unit: string;
  icon: any;
  completed: boolean;
  xpReward: number;
  cowriesReward: number;
}

interface DailyGoalTrackerProps {
  onOpenCheckin: () => void;
  streakDays: number;
  onGoalUpdated?: (addedXp: number, addedCowries: number) => void;
  isFreshStart?: boolean;
}

export const DailyGoalTracker: React.FC<DailyGoalTrackerProps> = ({
  onOpenCheckin,
  streakDays,
  onGoalUpdated,
  isFreshStart = false,
}) => {
  const [habits, setHabits] = useState<DailyGoalHabit[]>(() => {
    if (isFreshStart) {
      return [
        {
          id: 'water',
          name: 'Hydration',
          category: 'hydration',
          current: 0,
          target: 64,
          unit: 'oz',
          icon: Droplets,
          completed: false,
          xpReward: 50,
          cowriesReward: 30,
        },
        {
          id: 'meds',
          name: 'Medication',
          category: 'medication',
          current: 0,
          target: 1,
          unit: 'dose',
          icon: Pill,
          completed: false,
          xpReward: 80,
          cowriesReward: 50,
        },
        {
          id: 'sleep',
          name: 'Sleep',
          category: 'sleep',
          current: 0,
          target: 7.0,
          unit: 'hrs',
          icon: Moon,
          completed: false,
          xpReward: 60,
          cowriesReward: 40,
        },
        {
          id: 'movement',
          name: 'Exercise',
          category: 'activity',
          current: 0,
          target: 30,
          unit: 'mins',
          icon: Activity,
          completed: false,
          xpReward: 70,
          cowriesReward: 45,
        },
      ];
    }
    return [
      {
        id: 'water',
        name: 'Hydration',
        category: 'hydration',
        current: 56,
        target: 64,
        unit: 'oz',
        icon: Droplets,
        completed: false,
        xpReward: 50,
        cowriesReward: 30,
      },
      {
        id: 'meds',
        name: 'Medication',
        category: 'medication',
        current: 1,
        target: 1,
        unit: 'dose',
        icon: Pill,
        completed: true,
        xpReward: 80,
        cowriesReward: 50,
      },
      {
        id: 'sleep',
        name: 'Sleep',
        category: 'sleep',
        current: 7.5,
        target: 7.0,
        unit: 'hrs',
        icon: Moon,
        completed: true,
        xpReward: 60,
        cowriesReward: 40,
      },
      {
        id: 'movement',
        name: 'Exercise',
        category: 'activity',
        current: 35,
        target: 30,
        unit: 'mins',
        icon: Activity,
        completed: true,
        xpReward: 70,
        cowriesReward: 45,
      },
    ];
  });

  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;
  const overallPercentage = Math.round((completedCount / totalCount) * 100);

  const handleIncrement = (id: string, step: number) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;
        const newCurrent = Math.min(habit.target * 2, +(habit.current + step).toFixed(1));
        const wasCompleted = habit.completed;
        const nowCompleted = newCurrent >= habit.target;

        if (!wasCompleted && nowCompleted) {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#71C7EC', '#FFD700', '#10b981'],
          });
          if (onGoalUpdated) {
            onGoalUpdated(habit.xpReward, habit.cowriesReward);
          }
        }

        return {
          ...habit,
          current: newCurrent,
          completed: nowCompleted,
        };
      })
    );
  };

  const handleToggleMedication = () => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== 'meds') return h;
        const nowCompleted = !h.completed;
        if (nowCompleted) {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#71C7EC', '#10b981'],
          });
          if (onGoalUpdated) onGoalUpdated(h.xpReward, h.cowriesReward);
        }
        return {
          ...h,
          current: nowCompleted ? 1 : 0,
          completed: nowCompleted,
        };
      })
    );
  };

  return (
    <div className="aura-module-card p-6 relative overflow-hidden">
      {/* Header & Overall Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
              <Target className="w-4 h-4 text-teal-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Habits Tracker</h3>
            <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Today
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Track daily health milestones to feed Astra, keep your{' '}
            <strong className="text-amber-600">{streakDays}-day streak</strong>, and earn Cowries.
          </p>
        </div>

        {/* Progress Circular Badge / Status */}
        <div className="aura-module-card p-3 flex items-center gap-4 shrink-0">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-100"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-teal-500 transition-all duration-500"
                fill="transparent"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * overallPercentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-bold text-slate-700">{overallPercentage}%</span>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>{completedCount} of {totalCount} Done</span>
              {overallPercentage === 100 && <span className="text-amber-500">👑</span>}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{streakDays}-Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Habits Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {habits.map((habit) => {
          const IconComponent = habit.icon;
          const pct = Math.min(100, Math.round((habit.current / habit.target) * 100));

          return (
            <div
              key={habit.id}
              className={`aura-module-card p-4 transition-all relative overflow-hidden ${
                habit.completed
                  ? 'border-teal-300'
                  : 'border-slate-100 hover:border-teal-200'
              }`}
            >
              {/* Progress Line Bar on Top Edge (solid teal) */}
              <div
                className="absolute top-0 left-0 h-1 bg-teal-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />

              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  {/* Flat icon — solid teal tint, no gradient */}
                  <div className={`p-2 rounded-xl ${habit.completed ? 'bg-teal-100 text-teal-600' : 'bg-teal-50 text-teal-500'}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-snug">{habit.name}</h4>
                    <div className="text-[11px] text-slate-500">
                      {habit.current} / {habit.target} {habit.unit}
                    </div>
                  </div>
                </div>

                {habit.completed ? (
                  <div className="flex items-center gap-1 text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </div>
                ) : (
                  <div className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                    {pct}%
                  </div>
                )}
              </div>

              {/* Progress Track (solid teal fill) */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${habit.completed ? 'bg-amber-400' : 'bg-teal-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Action Buttons for Accountability */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                <span className="text-slate-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> +{habit.xpReward} XP • <span className="text-amber-600 font-semibold">+{habit.cowriesReward} 🐚</span>
                </span>

                {habit.id === 'water' && (
                  <button
                    onClick={() => handleIncrement('water', 8)}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold px-2.5 py-1 rounded-lg border border-teal-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> +8 oz
                  </button>
                )}

                {habit.id === 'meds' && (
                  <button
                    onClick={handleToggleMedication}
                    className={`${
                      habit.completed
                        ? 'bg-teal-100 text-teal-700 border-teal-300'
                        : 'bg-slate-50 hover:bg-teal-50 text-slate-600 border-slate-200 hover:border-teal-200'
                    } font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1`}
                  >
                    {habit.completed ? 'Taken ✓' : 'Mark Taken'}
                  </button>
                )}

                {habit.id === 'movement' && (
                  <button
                    onClick={() => handleIncrement('movement', 10)}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold px-2.5 py-1 rounded-lg border border-teal-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> +10 min
                  </button>
                )}

                {habit.id === 'sleep' && (
                  <span className="text-[10px] text-teal-600 font-semibold">
                    Logged {habit.current}h Rest
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Streak Bonus Callout */}
      <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-500 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Complete all habits for a bonus</span>
              <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full border border-amber-200">
                +150 🐚 +200 XP
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Finishing every habit today secures your streak and boosts Astra's vitality.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCheckin}
          className="btn-primary shrink-0"
        >
          <span>Full Check-In</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
