import React, { useState } from 'react';
import { Dumbbell, Flower2 } from 'lucide-react';
import { CalisthenicsProgram } from './CalisthenicsProgram';
import { YogaFlowProgram } from './YogaFlowProgram';

interface TrainHubProps {
  userKey: string;
  onCalisthenicsCompleted?: (programDay: number, activityMinutes: number) => void;
  onYogaCompleted?: (sessionId: string, minutes: number) => void;
  onShowToast?: (message: string) => void;
}

type TrainMode = 'calisthenics' | 'yoga';

export const TrainHub: React.FC<TrainHubProps> = ({
  userKey,
  onCalisthenicsCompleted,
  onYogaCompleted,
  onShowToast,
}) => {
  const [mode, setMode] = useState<TrainMode>('calisthenics');

  return (
    <div className="space-y-5">
      <div className="glass-panel rounded-2xl p-2 flex gap-1 max-w-md">
        <button
          type="button"
          onClick={() => setMode('calisthenics')}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
            mode === 'calisthenics'
              ? 'bg-primary text-[var(--color-primary-foreground)]'
              : 'text-muted hover:text-white'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          Calisthenics
        </button>
        <button
          type="button"
          onClick={() => setMode('yoga')}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
            mode === 'yoga'
              ? 'bg-primary text-[var(--color-primary-foreground)]'
              : 'text-muted hover:text-white'
          }`}
        >
          <Flower2 className="w-3.5 h-3.5" />
          Yoga & Breath
        </button>
      </div>

      {mode === 'calisthenics' ? (
        <CalisthenicsProgram
          storageKey={`aura-calisthenics-v1:${userKey}`}
          onWorkoutCompleted={onCalisthenicsCompleted}
          onShowToast={onShowToast}
        />
      ) : (
        <YogaFlowProgram
          storageKey={`aura-yoga-v1:${userKey}`}
          onFlowCompleted={onYogaCompleted}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
