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

  const [popId, setPopId] = useState<string | null>(null);

  const burst = () => {
    confetti({
      particleCount: 28,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#2F7A73', '#5EC8B8', '#6E62C4'],
    });
  };

  const markComplete = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id || habit.completed) return habit;
        burst();
        setPopId(id);
        window.setTimeout(() => setPopId(null), 550);
        if (onGoalUpdated) onGoalUpdated(habit.xpReward, habit.cowriesReward);
        return { ...habit, current: habit.target, completed: true };
      })
    );
  };
  const handleIncrement = (id: string, step: number) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;
        const newCurrent = Math.min(habit.target * 2, +(habit.current + step).toFixed(1));
        const wasCompleted = habit.completed;
        const nowCompleted = newCurrent >= habit.target;

        if (!wasCompleted && nowCompleted) {
          burst();
          setPopId(id);
          window.setTimeout(() => setPopId(null), 550);
          if (onGoalUpdated) onGoalUpdated(habit.xpReward, habit.cowriesReward);
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
            colors: ['#FBAF40', '#009688'],
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-line">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-[4px] bg-ivory border border-line flex items-center justify-center">
              <Target className="w-4 h-4 text-harmony" />
            </div>
            <h3 className="text-xl font-bold text-navy">Habits Tracker</h3>
            <span className="aura-badge aura-badge-success text-[10px]">
              <ShieldCheck className="w-3 h-3" /> Today
            </span>
          </div>
          <p className="text-sm text-muted leading-[1.6]">
            Track daily health milestones to feed Astra, keep your{' '}
            <strong className="text-gold">{streakDays}-day streak</strong>, and earn Cowries.
          </p>
        </div>

        <div className="astra-frame p-3 flex items-center gap-4 shrink-0">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-line"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-harmony transition-all duration-500"
                fill="transparent"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * overallPercentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-bold text-white tabular-nums">{overallPercentage}%</span>
          </div>

          <div>
            <div className="text-xs font-bold text-navy flex items-center gap-1.5">
              <span>{completedCount} of {totalCount} Done</span>
              {overallPercentage === 100 && <span className="text-gold">👑</span>}
            </div>
            <div className="text-[11px] text-muted flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-gold" />
              <span>{streakDays}-Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Habits Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-stretch">
        {habits.map((habit) => {
          const IconComponent = habit.icon;
          const pct = Math.min(100, Math.round((habit.current / habit.target) * 100));

          return (
            <div
              key={habit.id}
              className={`aura-module-card p-4 habit-card habit-ripple ${popId === habit.id ? 'pop' : ''} ${
                habit.completed ? 'border-harmony/40' : ''
              }`}
            >
              <div
                className={`absolute top-0 left-0 h-1 transition-all duration-500 ${habit.completed ? 'bg-harmony' : 'bg-sunlight'}`}
                style={{ width: `${pct}%` }}
              />

              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-[4px] ${habit.completed ? 'bg-harmony/15 text-harmony' : 'bg-ivory text-gold'}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">{habit.name}</h4>
                    <div className="text-[11px] text-muted tabular-nums">
                      {habit.current} / {habit.target} {habit.unit}
                    </div>
                  </div>
                </div>

                {habit.completed ? (
                  <div className="flex items-center gap-1 text-harmony bg-harmony/10 px-2 py-0.5 rounded-[4px] text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </div>
                ) : (
                  <div className="text-[10px] font-medium text-muted bg-ivory px-2 py-0.5 rounded-[4px] border border-line tabular-nums">
                    {pct}%
                  </div>
                )}
              </div>

              <div className="w-full bg-ivory h-2 rounded-[4px] overflow-hidden mb-3">
                <div
                  className={`h-full rounded-[4px] transition-all duration-500 ${habit.completed ? 'bg-harmony' : 'bg-sunlight'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 text-[11px] pt-1 border-t border-line flex-wrap">
                <span className="text-muted flex items-center gap-1 tabular-nums">
                  <Zap className="w-3 h-3 text-gold" /> +{habit.xpReward} XP • <span className="text-gold font-semibold">+{habit.cowriesReward} 🐚</span>
                </span>

                <div className="flex items-center gap-1.5">
                {habit.id === 'water' && !habit.completed && (
                  <button
                    onClick={() => handleIncrement('water', 8)}
                    className="bg-ivory hover:bg-peach text-white font-bold px-2.5 py-1 rounded-[4px] border border-line flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> +8 oz
                  </button>
                )}

                {habit.id === 'meds' && (
                  <button
                    onClick={handleToggleMedication}
                    className={`${
                      habit.completed
                        ? 'bg-harmony/15 text-harmony border-harmony/30'
                        : 'bg-ivory text-ink border-line'
                    } font-bold px-2.5 py-1 rounded-[4px] border flex items-center gap-1`}
                  >
                    {habit.completed ? 'Taken ✓' : 'Mark Taken'}
                  </button>
                )}

                {habit.id === 'movement' && !habit.completed && (
                  <button
                    onClick={() => handleIncrement('movement', 10)}
                    className="bg-ivory hover:bg-peach text-white font-bold px-2.5 py-1 rounded-[4px] border border-line flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> +10 min
                  </button>
                )}

                {!habit.completed && habit.id !== 'meds' && (
                  <button
                    type="button"
                    onClick={() => markComplete(habit.id)}
                    className="btn-primary !py-1 !px-2.5 text-[11px]"
                  >
                    Done
                  </button>
                )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Streak Bonus Callout */}
      <div className="bg-ivory p-4 rounded-[4px] border border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[4px] bg-peach border border-line flex items-center justify-center text-gold shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-navy flex items-center gap-1.5">
              <span>Complete all habits for a bonus</span>
              <span className="bg-peach text-gold text-[10px] px-2 py-0.5 rounded-[4px] border border-line">
                +150 🐚 +200 XP
              </span>
            </div>
            <p className="text-muted text-[11px] mt-0.5 leading-[1.6]">
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
