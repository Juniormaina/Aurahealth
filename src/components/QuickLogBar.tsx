import React from 'react';
import { Droplets, Pill, Moon, Smile } from 'lucide-react';

export type QuickLogKind = 'hydration' | 'medication' | 'sleep' | 'mood';

interface QuickLogBarProps {
  onLog: (kind: QuickLogKind) => void;
}

const ACTIONS: { id: QuickLogKind; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'hydration', label: 'Hydration', icon: Droplets },
  { id: 'medication', label: 'Medication', icon: Pill },
  { id: 'sleep', label: 'Sleep', icon: Moon },
  { id: 'mood', label: 'Mood', icon: Smile },
];

export const QuickLogBar: React.FC<QuickLogBarProps> = ({ onLog }) => {
  return (
    <div className="quick-log-bar px-3 py-3 mt-4">
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Quick log</span>
        <span className="hidden sm:inline text-[11px] text-slate-500">1-tap daily habits</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onLog(action.id)}
            className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-amber-400/10 text-slate-200 hover:text-amber-200 transition-colors"
          >
            <action.icon className="w-4 h-4" />
            <span className="text-[10px] sm:text-[11px] font-semibold truncate max-w-full">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
