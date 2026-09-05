import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { MovementPattern } from '../content/calisthenicsProgram';
import {
  AnimationState,
  TempoPhase,
  motionProgress,
  phaseLabel,
  resolveExercise3DConfig,
} from '../content/calisthenicsExercises3D';
import { OrganicViewportShell } from './organic/OrganicAvatar';
import { CoachCharacter, StudioSceneChrome } from './organic/CoachCharacter';
import { TrainerSelect } from './organic/TrainerSelect';
import { loadTrainerId, saveTrainerId, type TrainerId } from './organic/trainerConfig';
import type { BreathPhase } from './organic/organicMotion';

export interface Calisthenics3DViewportProps {
  exerciseId?: string;
  exerciseName?: string;
  pattern?: MovementPattern;
  tempo?: string;
  isHold?: boolean;
  isResting?: boolean;
  instructionCue?: string;
  setIndex: number;
  targetSets: number;
  repCount: number;
  targetRepsLabel?: string;
  phase: TempoPhase;
  phaseLeft: number;
  phaseTotal: number;
  label?: string;
  className?: string;
}

function phaseToBreath(phase: TempoPhase, isResting: boolean): BreathPhase {
  if (isResting) return 'exhale';
  switch (phase) {
    case 'eccentric':
      return 'inhale';
    case 'pause_bottom':
      return 'hold_top';
    case 'concentric':
      return 'exhale';
    case 'pause_top':
      return 'hold_bottom';
    case 'hold':
      return 'idle';
    default:
      return 'idle';
  }
}

export const Calisthenics3DViewport: React.FC<Calisthenics3DViewportProps> = ({
  exerciseId,
  exerciseName,
  pattern,
  tempo,
  isHold,
  isResting = false,
  instructionCue,
  setIndex,
  targetSets,
  repCount,
  targetRepsLabel,
  phase,
  phaseLeft,
  phaseTotal,
  label,
  className = '',
}) => {
  const [trainerId, setTrainerId] = useState<TrainerId>(() => loadTrainerId());

  const config = useMemo(
    () =>
      resolveExercise3DConfig({
        exerciseId,
        pattern,
        name: exerciseName,
        isHold,
        tempo,
      }),
    [exerciseId, pattern, exerciseName, isHold, tempo]
  );

  const animationState: AnimationState = isResting ? 'rest' : config.animationState;
  const phaseElapsed = Math.max(0, phaseTotal - phaseLeft);
  const progress = isResting ? 0 : motionProgress(phase, phaseElapsed, phaseTotal || 1);
  const breathPhase = phaseToBreath(phase, isResting);

  const onTrainerChange = (id: TrainerId) => {
    setTrainerId(id);
    saveTrainerId(id);
  };

  return (
    <OrganicViewportShell
      className={className}
      topLeft={
        <>
          <TrainerSelect value={trainerId} onChange={onTrainerChange} />
          <span className="rounded-md bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200/90 backdrop-blur-sm w-fit">
            {label ?? (isResting ? 'Recovery' : 'Coach Aura · live')}
          </span>
        </>
      }
      topRight={
        <span className="rounded-md bg-emerald-950/55 px-2 py-1 text-[10px] font-medium tabular-nums text-emerald-50/90 backdrop-blur-sm">
          Set {setIndex + 1}/{targetSets}
          {!isHold && !isResting ? ` · Rep ${repCount}` : ''}
          {targetRepsLabel && !isResting ? ` · ${targetRepsLabel}` : ''}
        </span>
      }
      bottomLeft={
        <>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300/85">
            {isResting ? 'Rest' : phaseLabel(phase)}
            {!isResting && phaseTotal > 0 ? ` · ${phaseLeft}s` : ''}
          </p>
          <p className="mt-0.5 max-w-[70%] truncate text-[10px] text-emerald-200/55">
            {exerciseName ?? config.displayName}
          </p>
        </>
      }
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [2.7, 1.75, 3.5], fov: 36, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <StudioSceneChrome>
            <CoachCharacter
              mode="calisthenics"
              trainerId={trainerId}
              animationState={animationState}
              progress={progress}
              poseName={exerciseName}
              instructionCue={instructionCue}
              breathPhase={breathPhase}
              isBreathing={!isResting}
              isResting={isResting}
              swayAmp={
                isResting ? 1.25 : animationState === 'plank' || animationState === 'hang' ? 1.1 : 0.95
              }
            />
          </StudioSceneChrome>
        </Suspense>
      </Canvas>
    </OrganicViewportShell>
  );
};
