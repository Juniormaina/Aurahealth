import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import type { MovementPattern } from '../content/calisthenicsProgram';
import {
  AnimationState,
  MuscleGroup,
  TempoPhase,
  motionProgress,
  phaseLabel,
  resolveExercise3DConfig,
} from '../content/calisthenicsExercises3D';
import {
  OrganicAvatar,
  OrganicSceneChrome,
  OrganicViewportShell,
  type MuscleSpot,
} from './organic/OrganicAvatar';
import {
  BreathPhase,
  ChainPose,
  EMERALD,
  blendChainPose,
  standingChain,
} from './organic/organicMotion';

export interface Calisthenics3DViewportProps {
  exerciseId?: string;
  exerciseName?: string;
  pattern?: MovementPattern;
  tempo?: string;
  isHold?: boolean;
  isResting?: boolean;
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

const DEG = Math.PI / 180;

const POSE_A: Record<AnimationState, ChainPose> = {
  idle: standingChain(),
  rest: standingChain({
    head: [0, 8 * DEG, 0],
    lShoulder: [18 * DEG, 0, 32 * DEG],
    rShoulder: [-12 * DEG, 0, -38 * DEG],
    lElbow: 0.35,
    rElbow: 0.55,
    lHip: [0, 0, 6 * DEG],
    rHip: [0, 0, -6 * DEG],
    rootRot: [0, 10 * DEG, 0],
  }),
  push_up: standingChain({
    pelvis: [88 * DEG, 0, 0],
    spine: [2 * DEG, 0, 0],
    lShoulder: [-88 * DEG, 0, 10 * DEG],
    rShoulder: [-88 * DEG, 0, -10 * DEG],
    lElbow: 0.15,
    rElbow: 0.15,
    rootY: 0.52,
  }),
  pike_press: standingChain({
    pelvis: [48 * DEG, 0, 0],
    spine: [18 * DEG, 0, 0],
    chest: [12 * DEG, 0, 0],
    head: [22 * DEG, 0, 0],
    lShoulder: [-98 * DEG, 0, 8 * DEG],
    rShoulder: [-98 * DEG, 0, -8 * DEG],
    lElbow: 0.2,
    rElbow: 0.2,
    lHip: [-35 * DEG, 0, 0],
    rHip: [-35 * DEG, 0, 0],
    rootY: 0.22,
  }),
  pull_up: standingChain({
    lShoulder: [-158 * DEG, 0, 18 * DEG],
    rShoulder: [-158 * DEG, 0, -18 * DEG],
    lElbow: 0.25,
    rElbow: 0.25,
    lHip: [8 * DEG, 0, 6 * DEG],
    rHip: [8 * DEG, 0, -6 * DEG],
    rootY: 0.32,
  }),
  hang: standingChain({
    lShoulder: [-168 * DEG, 0, 12 * DEG],
    rShoulder: [-168 * DEG, 0, -12 * DEG],
    lElbow: 0.08,
    rElbow: 0.08,
    rootY: 0.42,
  }),
  row: standingChain({
    pelvis: [72 * DEG, 0, 0],
    spine: [8 * DEG, 0, 0],
    head: [8 * DEG, 0, 0],
    lShoulder: [-68 * DEG, 0, 12 * DEG],
    rShoulder: [-68 * DEG, 0, -12 * DEG],
    lElbow: 0.35,
    rElbow: 0.35,
    rootY: 0.32,
  }),
  squat: standingChain({
    spine: [6 * DEG, 0, 0],
    chest: [4 * DEG, 0, 0],
    lShoulder: [0, 0, 22 * DEG],
    rShoulder: [0, 0, -22 * DEG],
    lHip: [12 * DEG, 0, 0],
    rHip: [12 * DEG, 0, 0],
    lKnee: 0.2,
    rKnee: 0.2,
  }),
  pistol_squat: standingChain({
    spine: [8 * DEG, 0, 0],
    lShoulder: [0, 0, 28 * DEG],
    rShoulder: [-35 * DEG, 0, -18 * DEG],
    lHip: [18 * DEG, 0, 0],
    rHip: [-22 * DEG, 0, 0],
    lKnee: 0.25,
    rKnee: 0.1,
  }),
  split_squat: standingChain({
    spine: [4 * DEG, 0, 0],
    lShoulder: [0, 0, 16 * DEG],
    rShoulder: [0, 0, -16 * DEG],
    lHip: [22 * DEG, 0, 0],
    rHip: [-18 * DEG, 0, 0],
    lKnee: 0.3,
    rKnee: 0.15,
    rootY: -0.04,
  }),
  bridge: standingChain({
    pelvis: [-12 * DEG, 0, 0],
    spine: [-8 * DEG, 0, 0],
    lShoulder: [0, 0, 18 * DEG],
    rShoulder: [0, 0, -18 * DEG],
    lHip: [45 * DEG, 0, 0],
    rHip: [45 * DEG, 0, 0],
    lKnee: 1.0,
    rKnee: 1.0,
    rootY: -0.32,
  }),
  dip: standingChain({
    spine: [4 * DEG, 0, 0],
    lShoulder: [-38 * DEG, 0, 50 * DEG],
    rShoulder: [-38 * DEG, 0, -50 * DEG],
    lElbow: 0.35,
    rElbow: 0.35,
    lHip: [12 * DEG, 0, 6 * DEG],
    rHip: [12 * DEG, 0, -6 * DEG],
    rootY: 0.18,
  }),
  muscle_up: standingChain({
    lShoulder: [-148 * DEG, 0, 16 * DEG],
    rShoulder: [-148 * DEG, 0, -16 * DEG],
    lElbow: 0.45,
    rElbow: 0.45,
    lHip: [18 * DEG, 0, 8 * DEG],
    rHip: [18 * DEG, 0, -8 * DEG],
    rootY: 0.28,
  }),
  plank: standingChain({
    pelvis: [88 * DEG, 0, 0],
    lShoulder: [-88 * DEG, 0, 6 * DEG],
    rShoulder: [-88 * DEG, 0, -6 * DEG],
    lElbow: 1.05,
    rElbow: 1.05,
    rootY: 0.38,
  }),
  knee_raise: standingChain({
    lShoulder: [-168 * DEG, 0, 10 * DEG],
    rShoulder: [-168 * DEG, 0, -10 * DEG],
    lHip: [18 * DEG, 0, 4 * DEG],
    rHip: [18 * DEG, 0, -4 * DEG],
    lKnee: 0.35,
    rKnee: 0.35,
    rootY: 0.38,
  }),
  mobility: standingChain({
    spine: [12 * DEG, 0, 0],
    chest: [8 * DEG, 8 * DEG, 0],
    head: [0, 8 * DEG, 0],
    lShoulder: [-78 * DEG, 0, 22 * DEG],
    rShoulder: [28 * DEG, 0, -32 * DEG],
    lElbow: 0.4,
    rElbow: 0.55,
    lHip: [35 * DEG, 0, 8 * DEG],
    rHip: [0, 0, -6 * DEG],
    lKnee: 0.55,
    rootY: -0.12,
  }),
};

const POSE_B: Record<AnimationState, ChainPose> = {
  idle: POSE_A.idle,
  rest: POSE_A.rest,
  push_up: standingChain({
    pelvis: [88 * DEG, 0, 0],
    spine: [6 * DEG, 0, 0],
    chest: [4 * DEG, 0, 0],
    head: [4 * DEG, 0, 0],
    lShoulder: [-48 * DEG, 0, 22 * DEG],
    rShoulder: [-48 * DEG, 0, -22 * DEG],
    lElbow: 1.45,
    rElbow: 1.45,
    rootY: 0.2,
  }),
  pike_press: standingChain({
    pelvis: [62 * DEG, 0, 0],
    spine: [22 * DEG, 0, 0],
    chest: [16 * DEG, 0, 0],
    head: [32 * DEG, 0, 0],
    lShoulder: [-55 * DEG, 0, 16 * DEG],
    rShoulder: [-55 * DEG, 0, -16 * DEG],
    lElbow: 1.25,
    rElbow: 1.25,
    lHip: [-30 * DEG, 0, 0],
    rHip: [-30 * DEG, 0, 0],
    rootY: 0.08,
  }),
  pull_up: standingChain({
    spine: [6 * DEG, 0, 0],
    chest: [4 * DEG, 0, 0],
    head: [-4 * DEG, 0, 0],
    lShoulder: [-95 * DEG, 0, 32 * DEG],
    rShoulder: [-95 * DEG, 0, -32 * DEG],
    lElbow: 1.55,
    rElbow: 1.55,
    lHip: [22 * DEG, 0, 8 * DEG],
    rHip: [22 * DEG, 0, -8 * DEG],
    rootY: 0.72,
  }),
  hang: standingChain({
    spine: [4 * DEG, 0, 0],
    lShoulder: [-118 * DEG, 0, 22 * DEG],
    rShoulder: [-118 * DEG, 0, -22 * DEG],
    lElbow: 1.1,
    rElbow: 1.1,
    rootY: 0.52,
  }),
  row: standingChain({
    pelvis: [68 * DEG, 0, 0],
    spine: [4 * DEG, 0, 0],
    lShoulder: [-108 * DEG, 0, 22 * DEG],
    rShoulder: [-108 * DEG, 0, -22 * DEG],
    lElbow: 1.35,
    rElbow: 1.35,
    rootY: 0.52,
  }),
  squat: standingChain({
    pelvis: [8 * DEG, 0, 0],
    spine: [14 * DEG, 0, 0],
    chest: [10 * DEG, 0, 0],
    lShoulder: [18 * DEG, 0, 28 * DEG],
    rShoulder: [18 * DEG, 0, -28 * DEG],
    lHip: [88 * DEG, 0, 0],
    rHip: [88 * DEG, 0, 0],
    lKnee: 1.55,
    rKnee: 1.55,
    rootY: -0.42,
  }),
  pistol_squat: standingChain({
    spine: [18 * DEG, 0, 0],
    chest: [10 * DEG, 0, 0],
    lShoulder: [22 * DEG, 0, 32 * DEG],
    rShoulder: [-45 * DEG, 0, -22 * DEG],
    lHip: [95 * DEG, 0, 0],
    rHip: [-35 * DEG, 0, 0],
    lKnee: 1.65,
    rKnee: 0.15,
    rootY: -0.48,
  }),
  split_squat: standingChain({
    spine: [10 * DEG, 0, 0],
    lShoulder: [8 * DEG, 0, 20 * DEG],
    rShoulder: [8 * DEG, 0, -20 * DEG],
    lHip: [88 * DEG, 0, 0],
    rHip: [-32 * DEG, 0, 0],
    lKnee: 1.55,
    rKnee: 0.25,
    rootY: -0.32,
  }),
  bridge: standingChain({
    pelvis: [-28 * DEG, 0, 0],
    spine: [-18 * DEG, 0, 0],
    chest: [-10 * DEG, 0, 0],
    lShoulder: [0, 0, 22 * DEG],
    rShoulder: [0, 0, -22 * DEG],
    lHip: [62 * DEG, 0, 0],
    rHip: [62 * DEG, 0, 0],
    lKnee: 1.15,
    rKnee: 1.15,
    rootY: -0.04,
  }),
  dip: standingChain({
    spine: [14 * DEG, 0, 0],
    chest: [8 * DEG, 0, 0],
    head: [4 * DEG, 0, 0],
    lShoulder: [12 * DEG, 0, 65 * DEG],
    rShoulder: [12 * DEG, 0, -65 * DEG],
    lElbow: 1.55,
    rElbow: 1.55,
    lHip: [22 * DEG, 0, 8 * DEG],
    rHip: [22 * DEG, 0, -8 * DEG],
    rootY: -0.04,
  }),
  muscle_up: standingChain({
    spine: [-6 * DEG, 0, 0],
    chest: [-4 * DEG, 0, 0],
    head: [-4 * DEG, 0, 0],
    lShoulder: [-38 * DEG, 0, 42 * DEG],
    rShoulder: [-38 * DEG, 0, -42 * DEG],
    lElbow: 0.55,
    rElbow: 0.55,
    lHip: [32 * DEG, 0, 10 * DEG],
    rHip: [32 * DEG, 0, -10 * DEG],
    rootY: 0.82,
  }),
  plank: standingChain({
    pelvis: [88 * DEG, 0, 0],
    spine: [2 * DEG, 0, 0],
    lShoulder: [-88 * DEG, 0, 6 * DEG],
    rShoulder: [-88 * DEG, 0, -6 * DEG],
    lElbow: 1.05,
    rElbow: 1.05,
    rootY: 0.36,
  }),
  knee_raise: standingChain({
    spine: [6 * DEG, 0, 0],
    lShoulder: [-168 * DEG, 0, 10 * DEG],
    rShoulder: [-168 * DEG, 0, -10 * DEG],
    lHip: [88 * DEG, 0, 6 * DEG],
    rHip: [88 * DEG, 0, -6 * DEG],
    lKnee: 1.45,
    rKnee: 1.45,
    rootY: 0.38,
  }),
  mobility: standingChain({
    pelvis: [8 * DEG, 6 * DEG, 0],
    spine: [28 * DEG, 12 * DEG, 0],
    chest: [18 * DEG, 14 * DEG, 0],
    head: [0, 18 * DEG, 0],
    lShoulder: [-105 * DEG, 0, 28 * DEG],
    rShoulder: [45 * DEG, 0, -38 * DEG],
    lElbow: 0.55,
    rElbow: 0.7,
    lHip: [62 * DEG, 0, 12 * DEG],
    rHip: [8 * DEG, 0, -8 * DEG],
    lKnee: 0.95,
    rootY: -0.22,
    rootRot: [0, 6 * DEG, 0],
  }),
};

const MUSCLE_LOCAL: Record<MuscleGroup, [number, number, number]> = {
  chest: [0, 0.16, 0.14],
  front_delts: [0.18, 0.28, 0.1],
  rear_delts: [0.18, 0.28, -0.1],
  triceps: [0.24, 0.05, -0.04],
  biceps: [0.24, 0.05, 0.08],
  lats: [0.14, 0.08, -0.1],
  upper_back: [0, 0.2, -0.14],
  core: [0, -0.02, 0.12],
  quads: [0.12, -0.85, 0.1],
  hamstrings: [0.12, -0.85, -0.1],
  glutes: [0, -0.55, -0.12],
  calves: [0.1, -1.15, -0.04],
  shoulders: [0.22, 0.3, 0],
};

const MIRROR_MUSCLES = new Set<MuscleGroup>([
  'front_delts',
  'rear_delts',
  'triceps',
  'biceps',
  'lats',
  'quads',
  'hamstrings',
  'calves',
  'shoulders',
]);

function muscleSpotsFromGroups(primary: MuscleGroup[], secondary: MuscleGroup[]): MuscleSpot[] {
  const spots: MuscleSpot[] = [];
  for (const g of primary) {
    spots.push({
      id: g,
      position: MUSCLE_LOCAL[g],
      mirror: MIRROR_MUSCLES.has(g),
      primary: true,
    });
  }
  for (const g of secondary) {
    if (primary.includes(g)) continue;
    spots.push({
      id: g,
      position: MUSCLE_LOCAL[g],
      mirror: MIRROR_MUSCLES.has(g),
      primary: false,
    });
  }
  return spots;
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

function AthleteFigure({
  animationState,
  progress,
  primaryMuscles,
  secondaryMuscles,
  tension,
  breathPhase,
  isResting,
}: {
  animationState: AnimationState;
  progress: number;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  tension: number;
  breathPhase: BreathPhase;
  isResting: boolean;
}) {
  const pose = useMemo(
    () => blendChainPose(POSE_A[animationState], POSE_B[animationState], progress),
    [animationState, progress]
  );
  const spots = useMemo(
    () => muscleSpotsFromGroups(primaryMuscles, secondaryMuscles),
    [primaryMuscles, secondaryMuscles]
  );

  return (
    <OrganicAvatar
      pose={pose}
      breathPhase={breathPhase}
      isBreathing={!isResting}
      swayAmp={isResting ? 1.25 : animationState === 'plank' || animationState === 'hang' ? 1.1 : 0.95}
      tension={tension}
      muscleSpots={spots}
      accentColor={EMERALD.accent}
    />
  );
}

export const Calisthenics3DViewport: React.FC<Calisthenics3DViewportProps> = ({
  exerciseId,
  exerciseName,
  pattern,
  tempo,
  isHold,
  isResting = false,
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

  const tension = isResting
    ? 0.18
    : phase === 'eccentric'
      ? 0.5 + progress * 0.5
      : phase === 'pause_bottom'
        ? 1
        : phase === 'concentric'
          ? 0.75 - progress * 0.2
          : phase === 'hold'
            ? 0.8
            : 0.4;

  return (
    <OrganicViewportShell
      className={className}
      topLeft={
        <span className="rounded-md bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200/90 backdrop-blur-sm">
          {label ?? (isResting ? 'Recovery' : 'Biomechanics · live')}
        </span>
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
        camera={{ position: [2.5, 1.85, 3.3], fov: 38, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <OrganicSceneChrome>
            <AthleteFigure
              animationState={animationState}
              progress={progress}
              primaryMuscles={config.primaryMuscles}
              secondaryMuscles={config.secondaryMuscles}
              tension={tension}
              breathPhase={breathPhase}
              isResting={isResting}
            />
          </OrganicSceneChrome>
        </Suspense>
      </Canvas>
    </OrganicViewportShell>
  );
};
