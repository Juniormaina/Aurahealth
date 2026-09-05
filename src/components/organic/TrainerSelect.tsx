import React from 'react';
import type { TrainerId } from './trainerConfig';
import { TRAINER_MODELS } from './trainerConfig';

interface TrainerSelectProps {
  value: TrainerId;
  onChange: (id: TrainerId) => void;
}

/** Minimalist male/female trainer toggle for the 3D canvas overlay. */
export const TrainerSelect: React.FC<TrainerSelectProps> = ({ value, onChange }) => {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-emerald-500/30 bg-black/45 p-0.5 backdrop-blur-sm"
      role="tablist"
      aria-label="Trainer model"
    >
      {(Object.keys(TRAINER_MODELS) as TrainerId[]).map((id) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-md transition-colors ${
              active
                ? 'bg-emerald-500/25 text-emerald-100'
                : 'text-emerald-200/55 hover:text-emerald-100/90'
            }`}
          >
            {TRAINER_MODELS[id].label}
          </button>
        );
      })}
    </div>
  );
};
