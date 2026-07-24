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
  TrendingUp,
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
  color: string;
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
          name: 'Hydration Target',
          category: 'hydration',
          current: 0,
          target: 64,
          unit: 'oz',
          icon: Droplets,
          color: 'from-cyan-500 to-blue-600',
          completed: false,
          xpReward: 50,
          cowriesReward: 30,
        },
        {
          id: 'meds',
          name: 'Medication Adherence',
          category: 'medication',
          current: 0,
          target: 1,
          unit: 'dose',
          icon: Pill,
          color: 'from-emerald-500 to-teal-600',
          completed: false,
          xpReward: 80,
          cowriesReward: 50,
        },
        {
          id: 'sleep',
          name: 'Quality Sleep Rest',
          category: 'sleep',
          current: 0,
          target: 7.0,
          unit: 'hrs',
          icon: Moon,
          color: 'from-purple-500 to-indigo-600',
          completed: false,
          xpReward: 60,
          cowriesReward: 40,
        },
        {
          id: 'movement',
          name: 'Physical Activity',
          category: 'activity',
          current: 0,
          target: 30,
          unit: 'mins',
          icon: Activity,
          color: 'from-amber-500 to-rose-500',
          completed: false,
          xpReward: 70,
          cowriesReward: 45,
        },
        {
          id: 'wellness',
          name: 'Daily AI Health Log',
          category: 'wellness',
          current: 0,
          target: 1,
          unit: 'report',
          icon: Sparkles,
          color: 'from-rose-500 to-pink-600',
          completed: false,
          xpReward: 100,
          cowriesReward: 60,
        },
      ];
    }
    return [
      {
        id: 'water',
        name: 'Hydration Target',
        category: 'hydration',
        current: 56,
        target: 64,
        unit: 'oz',
        icon: Droplets,
        color: 'from-cyan-500 to-blue-600',
        completed: false,
        xpReward: 50,
        cowriesReward: 30,
      },
      {
        id: 'meds',
        name: 'Medication Adherence',
        category: 'medication',
        current: 1,
        target: 1,
        unit: 'dose',
        icon: Pill,
        color: 'from-emerald-500 to-teal-600',
        completed: true,
        xpReward: 80,
        cowriesReward: 50,
      },
      {
        id: 'sleep',
        name: 'Quality Sleep Rest',
        category: 'sleep',
        current: 7.5,
        target: 7.0,
        unit: 'hrs',
        icon: Moon,
        color: 'from-purple-500 to-indigo-600',
        completed: true,
        xpReward: 60,
        cowriesReward: 40,
      },
      {
        id: 'movement',
        name: 'Physical Activity',
        category: 'activity',
        current: 35,
        target: 30,
        unit: 'mins',
        icon: Activity,
        color: 'from-amber-500 to-rose-500',
        completed: true,
        xpReward: 70,
        cowriesReward: 45,
      },
      {
        id: 'wellness',
        name: 'Daily AI Health Log',
        category: 'wellness',
        current: 1,
        target: 1,
        unit: 'report',
        icon: Sparkles,
        color: 'from-rose-500 to-pink-600',
        completed: true,
        xpReward: 100,
        cowriesReward: 60,
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
            colors: ['#10b981', '#38bdf8', '#f59e0b'],
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
            colors: ['#10b981', '#34d399'],
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
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Overall Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-black text-white">Daily Goal Accountability Tracker</h3>
            <span className="bg-emerald-500/10 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Today's Habits
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Track daily health milestones to feed Astra, maintain your <strong className="text-amber-300">{streakDays}-day streak</strong>, and earn bonus Cowries.
          </p>
        </div>

        {/* Progress Circular Badge / Status */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-4 shrink-0">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-emerald-400 transition-all duration-500"
                fill="transparent"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * overallPercentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-black text-white">{overallPercentage}%</span>
          </div>

          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{completedCount} of {totalCount} Completed</span>
              {overallPercentage === 100 && <span className="text-amber-400">👑</span>}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{streakDays}-Day Multiplier (1.2x)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Habits Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {habits.map((habit) => {
          const IconComponent = habit.icon;
          const pct = Math.min(100, Math.round((habit.current / habit.target) * 100));

          return (
            <div
              key={habit.id}
              className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                habit.completed
                  ? 'bg-slate-950/90 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Progress Line Bar on Top Edge */}
              <div
                className={`absolute top-0 left-0 h-1 bg-gradient-to-r ${habit.color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />

              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 text-white`}>
                    <IconComponent className="w-4 h-4 text-slate-200" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">{habit.name}</h4>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {habit.current} / {habit.target} {habit.unit}
                    </div>
                  </div>
                </div>

                {habit.completed ? (
                  <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </div>
                ) : (
                  <div className="text-[10px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                    {pct}%
                  </div>
                )}
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${habit.color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Action Buttons for Accountability */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> +{habit.xpReward} XP • +{habit.cowriesReward} 🐚
                </span>

                {habit.id === 'water' && (
                  <button
                    onClick={() => handleIncrement('water', 8)}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold px-2.5 py-1 rounded-lg border border-cyan-500/30 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> +8 oz
                  </button>
                )}

                {habit.id === 'meds' && (
                  <button
                    onClick={handleToggleMedication}
                    className={`${
                      habit.completed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    } font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1`}
                  >
                    {habit.completed ? 'Taken ✓' : 'Mark Taken'}
                  </button>
                )}

                {habit.id === 'movement' && (
                  <button
                    onClick={() => handleIncrement('movement', 10)}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> +10 min
                  </button>
                )}

                {habit.id === 'sleep' && (
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Logged 7.5h Rest
                  </span>
                )}

                {habit.id === 'wellness' && (
                  <button
                    onClick={onOpenCheckin}
                    className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold px-2.5 py-1 rounded-lg border border-rose-500/30 transition-colors flex items-center gap-1"
                  >
                    <span>Full Check-In</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Streak Bonus Callout */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-950/80 to-emerald-950/40 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Accountability Bonus Unlocked at 100% Completion</span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">
                +150 🐚 +200 XP
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Completing all 5 habit goals today secures your streak for tomorrow and upgrades Astra's vitality.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCheckin}
          className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95"
        >
          <span>Submit Full Health Check-In</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
