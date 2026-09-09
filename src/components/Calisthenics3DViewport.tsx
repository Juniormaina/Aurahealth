import React, { Suspense, useEffect, useMemo, useState } from 'react';
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
import { StudioGearPanel } from './organic/StudioGearPanel';
import { StudioPlayground } from './organic/StudioPlayground';
import { useStudioPlayground } from './organic/useStudioPlayground';
import { STUDIO_GRID } from './organic/studioPlaygroundState';
import { loadTrainerId, saveTrainerId, type TrainerId } from './organic/trainerConfig';
import type { BreathPhase } from './organic/organicMotion';
import { useReducedMotionPref } from '../lib/motionPrefs';

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
  const playground = useStudioPlayground();
  const reduceMotion = useReducedMotionPref();

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
  const liveBreath = phaseToBreath(phase, isResting);
  const breathPhase: BreathPhase = reduceMotion ? 'idle' : liveBreath;
  const exerciseKey = isResting ? 'rest' : config.id;

  useEffect(() => {
    playground.syncExercise({
      mode: 'calisthenics',
      exerciseKey,
      animationState,
      libraryId: config.id,
      isResting,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on module / rest transition
  }, [exerciseKey, animationState, isResting, config.id]);

  const onTrainerChange = (id: TrainerId) => {
    setTrainerId(id);
    saveTrainerId(id);
  };

  return (
    <OrganicViewportShell
      className={className}
      expanded={playground.state.editMode}
      bottomRight={
        playground.state.editMode
          ? 'Drag props on grid · orbit disabled while dragging'
          : playground.propBinding.mode !== 'bodyweight'
            ? `Aligned · ${playground.propBinding.label}`
            : 'Drag to orbit · scroll to zoom'
      }
      topLeft={
        <>
          <TrainerSelect value={trainerId} onChange={onTrainerChange} />
          <StudioGearPanel
            mode="calisthenics"
            state={playground.state}
            aiStatus={playground.propBinding.label}
            onToggleEdit={() => playground.setEditMode(!playground.state.editMode)}
            onAdd={playground.addGear}
            onApplyZone={playground.applyZone}
            onRotate={playground.rotateSelected}
            onRemove={playground.removeSelected}
            onClear={playground.clearAll}
          />
          <span className="rounded-md bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200/90 backdrop-blur-sm w-fit">
            {label ?? (isResting ? 'Recovery' : 'Aura studio · live')}
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
      <div
        style={{
          width: '100%',
          height: '100%',
          touchAction: playground.state.editMode ? 'none' : 'auto',
        }}
      >
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [3.4, 2.1, 4.2], fov: 38, near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <StudioSceneChrome
              omitFloor
              floorRadius={STUDIO_GRID.floorRadius}
              orbitEnabled={!playground.dragging}
            >
              <StudioPlayground
                instances={playground.state.instances}
                selectedId={playground.state.selectedId}
                editMode={playground.state.editMode}
                onSelect={playground.select}
                onMove={playground.moveInstance}
                onDraggingChange={playground.setDragging}
                showChair={
                  playground.state.sessionMeta?.bindMode === 'chair' ||
                  playground.state.sessionMeta?.activeGearId === 'gym_chair' ||
                  playground.propBinding.mode === 'chair'
                }
              />
              <CoachCharacter
                mode="calisthenics"
                trainerId={trainerId}
                animationState={animationState}
                progress={progress}
                poseName={exerciseName}
                instructionCue={instructionCue}
                breathPhase={breathPhase}
                isBreathing={!isResting && !reduceMotion}
                isResting={isResting}
                swayAmp={
                  reduceMotion
                    ? 0
                    : isResting
                      ? 1.25
                      : animationState === 'plank' || animationState === 'hang'
                        ? 1.1
                        : 0.95
                }
                propBinding={playground.propBinding}
              />
            </StudioSceneChrome>
          </Suspense>
        </Canvas>
      </div>
    </OrganicViewportShell>
  );
};
