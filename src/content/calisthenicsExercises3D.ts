/** Biomechanical 3D viewer config — maps calisthenics movements to animation, tempo, and muscles. */

import type { MovementPattern } from './calisthenicsProgram';

export type AnimationState =
  | 'push_up'
  | 'pike_press'
  | 'pull_up'
  | 'row'
  | 'squat'
  | 'pistol_squat'
  | 'split_squat'
  | 'bridge'
  | 'dip'
  | 'muscle_up'
  | 'plank'
  | 'hang'
  | 'knee_raise'
  | 'mobility'
  | 'rest'
  | 'idle';

export type TempoPhase = 'eccentric' | 'pause_bottom' | 'concentric' | 'pause_top' | 'hold' | 'rest' | 'idle';

export type MuscleGroup =
  | 'chest'
  | 'front_delts'
  | 'rear_delts'
  | 'triceps'
  | 'biceps'
  | 'lats'
  | 'upper_back'
  | 'core'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'shoulders';

export interface TempoProfile {
  /** Seconds for the lowering / lengthening phase. */
  eccentric: number;
  pauseBottom: number;
  /** Seconds for the lifting / shortening phase. */
  concentric: number;
  pauseTop: number;
  /** Isometric hold (planks, hangs) — single phase length used as a cycle tick. */
  hold?: number;
}

export interface CalisthenicsExercise3DConfig {
  id: string;
  displayName: string;
  animationState: AnimationState;
  pattern: MovementPattern | 'skill';
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  /** Default tempo when the routine string is missing or "hold". */
  defaultTempo: TempoProfile;
  isHold?: boolean;
  cue: string;
}

/** Canonical library — includes program moves plus skill progressions (dips, pistols, muscle-ups). */
export const CALISTHENICS_3D_LIBRARY: Record<string, CalisthenicsExercise3DConfig> = {
  push_up: {
    id: 'push_up',
    displayName: 'Push-Ups',
    animationState: 'push_up',
    pattern: 'horizontal_push',
    primaryMuscles: ['chest', 'triceps', 'front_delts'],
    secondaryMuscles: ['core'],
    defaultTempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Lower under control; drive up without flaring elbows.',
  },
  incline_push_up: {
    id: 'incline_push_up',
    displayName: 'Incline Push-Ups',
    animationState: 'push_up',
    pattern: 'horizontal_push',
    primaryMuscles: ['chest', 'triceps', 'front_delts'],
    secondaryMuscles: ['core'],
    defaultTempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Hands elevated; keep a rigid plank line.',
  },
  pike_push_up: {
    id: 'pike_push_up',
    displayName: 'Pike Push-Ups',
    animationState: 'pike_press',
    pattern: 'vertical_push',
    primaryMuscles: ['shoulders', 'triceps', 'front_delts'],
    secondaryMuscles: ['core', 'upper_back'],
    defaultTempo: { eccentric: 3, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Hips high; crown of head tracks toward the floor.',
  },
  handstand_hold: {
    id: 'handstand_hold',
    displayName: 'Handstand / Pike Hold',
    animationState: 'pike_press',
    pattern: 'vertical_push',
    primaryMuscles: ['shoulders', 'triceps', 'core'],
    secondaryMuscles: ['upper_back'],
    defaultTempo: { eccentric: 0, pauseBottom: 0, concentric: 0, pauseTop: 0, hold: 3 },
    isHold: true,
    cue: 'Stack wrists–shoulders–hips; quiet breath.',
  },
  pull_up: {
    id: 'pull_up',
    displayName: 'Pull-Ups',
    animationState: 'pull_up',
    pattern: 'vertical_pull',
    primaryMuscles: ['lats', 'biceps', 'upper_back'],
    secondaryMuscles: ['core', 'rear_delts'],
    defaultTempo: { eccentric: 3, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Pull chest to bar; lower to a full hang.',
  },
  lat_pulldown: {
    id: 'lat_pulldown',
    displayName: 'Band Lat Pull-Downs / Dead Hangs',
    animationState: 'hang',
    pattern: 'vertical_pull',
    primaryMuscles: ['lats', 'upper_back'],
    secondaryMuscles: ['biceps', 'shoulders'],
    defaultTempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Active shoulders; elbows drive toward the ribs.',
  },
  inverted_row: {
    id: 'inverted_row',
    displayName: 'Inverted Rows',
    animationState: 'row',
    pattern: 'horizontal_pull',
    primaryMuscles: ['upper_back', 'lats', 'biceps'],
    secondaryMuscles: ['rear_delts', 'core'],
    defaultTempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Body straight; squeeze shoulder blades at the top.',
  },
  dip: {
    id: 'dip',
    displayName: 'Dips',
    animationState: 'dip',
    pattern: 'vertical_push',
    primaryMuscles: ['triceps', 'chest', 'front_delts'],
    secondaryMuscles: ['core'],
    defaultTempo: { eccentric: 3, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Slight forward lean; lock out without shrugging.',
  },
  muscle_up: {
    id: 'muscle_up',
    displayName: 'Muscle-Ups',
    animationState: 'muscle_up',
    pattern: 'skill',
    primaryMuscles: ['lats', 'chest', 'triceps'],
    secondaryMuscles: ['biceps', 'core', 'shoulders'],
    defaultTempo: { eccentric: 3, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Explosive pull, then transition and press to support.',
  },
  air_squat: {
    id: 'air_squat',
    displayName: 'Air Squats',
    animationState: 'squat',
    pattern: 'anterior_legs',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['core', 'hamstrings', 'calves'],
    defaultTempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Sit back; knees track over mid-foot.',
  },
  pistol_squat: {
    id: 'pistol_squat',
    displayName: 'Pistol Squats',
    animationState: 'pistol_squat',
    pattern: 'anterior_legs',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['core', 'hamstrings', 'calves'],
    defaultTempo: { eccentric: 3, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Control the descent; keep the free leg extended.',
  },
  split_squat: {
    id: 'split_squat',
    displayName: 'Bulgarian Split Squats',
    animationState: 'split_squat',
    pattern: 'anterior_legs',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    defaultTempo: { eccentric: 3, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Front knee tracks forward; torso tall.',
  },
  glute_bridge: {
    id: 'glute_bridge',
    displayName: 'Glute Bridges',
    animationState: 'bridge',
    pattern: 'posterior_legs',
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['core'],
    defaultTempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Drive through heels; squeeze at the top.',
  },
  plank: {
    id: 'plank',
    displayName: 'Forearm Plank',
    animationState: 'plank',
    pattern: 'core',
    primaryMuscles: ['core'],
    secondaryMuscles: ['shoulders', 'glutes'],
    defaultTempo: { eccentric: 0, pauseBottom: 0, concentric: 0, pauseTop: 0, hold: 3 },
    isHold: true,
    cue: 'Ribs down, glutes on, steady nasal breath.',
  },
  knee_raise: {
    id: 'knee_raise',
    displayName: 'Hanging Knee Raises',
    animationState: 'knee_raise',
    pattern: 'core',
    primaryMuscles: ['core'],
    secondaryMuscles: ['lats', 'shoulders'],
    defaultTempo: { eccentric: 2, pauseBottom: 0, concentric: 1, pauseTop: 0 },
    cue: 'Control the swing; lift without yanking.',
  },
  mobility: {
    id: 'mobility',
    displayName: 'Mobility Flow',
    animationState: 'mobility',
    pattern: 'mobility',
    primaryMuscles: ['core', 'hamstrings', 'shoulders'],
    secondaryMuscles: ['glutes', 'upper_back'],
    defaultTempo: { eccentric: 2, pauseBottom: 0, concentric: 2, pauseTop: 0 },
    cue: 'Move with the breath; don’t force end range.',
  },
};

/** Map program exercise IDs → 3D library entries. */
export const EXERCISE_ID_TO_3D: Record<string, string> = {
  horiz_push_01: 'incline_push_up',
  horiz_push_02: 'push_up',
  vert_push_01: 'pike_push_up',
  vert_push_02: 'handstand_hold',
  vert_pull_01: 'lat_pulldown',
  vert_pull_02: 'pull_up',
  horiz_pull_01: 'inverted_row',
  horiz_pull_02: 'inverted_row',
  ant_legs_01: 'air_squat',
  ant_legs_02: 'split_squat',
  post_legs_01: 'glute_bridge',
  post_legs_02: 'glute_bridge',
  core_01: 'plank',
  core_02: 'knee_raise',
  mob_01: 'mobility',
  mob_02: 'mobility',
  mob_03: 'mobility',
  mob_04: 'mobility',
};

const PATTERN_FALLBACK: Record<MovementPattern, string> = {
  horizontal_push: 'push_up',
  vertical_push: 'pike_push_up',
  vertical_pull: 'pull_up',
  horizontal_pull: 'inverted_row',
  anterior_legs: 'air_squat',
  posterior_legs: 'glute_bridge',
  core: 'plank',
  mobility: 'mobility',
};

/** Parse routine tempo strings like `3-0-1-0` or `hold`. */
export function parseTempoString(tempo: string | undefined, fallback: TempoProfile): TempoProfile {
  if (!tempo || tempo === 'hold') {
    return { ...fallback, hold: fallback.hold ?? 3 };
  }
  const parts = tempo.split('-').map((p) => Number(p));
  if (parts.length < 4 || parts.some((n) => Number.isNaN(n))) return { ...fallback };
  return {
    eccentric: Math.max(0, parts[0]),
    pauseBottom: Math.max(0, parts[1]),
    concentric: Math.max(0, parts[2]),
    pauseTop: Math.max(0, parts[3]),
  };
}

export function resolveExercise3DConfig(opts: {
  exerciseId?: string;
  pattern?: MovementPattern;
  name?: string;
  isHold?: boolean;
  tempo?: string;
}): CalisthenicsExercise3DConfig & { tempo: TempoProfile } {
  const byId = opts.exerciseId ? EXERCISE_ID_TO_3D[opts.exerciseId] : undefined;
  let key = byId;

  if (!key && opts.name) {
    const n = opts.name.toLowerCase();
    if (n.includes('muscle-up') || n.includes('muscle up')) key = 'muscle_up';
    else if (n.includes('pistol')) key = 'pistol_squat';
    else if (n.includes('dip')) key = 'dip';
    else if (n.includes('pull-up') || n.includes('chin-up')) key = 'pull_up';
    else if (n.includes('push-up') || n.includes('push up')) key = 'push_up';
  }

  if (!key && opts.pattern) key = PATTERN_FALLBACK[opts.pattern];
  if (!key) key = 'push_up';

  const base = CALISTHENICS_3D_LIBRARY[key] ?? CALISTHENICS_3D_LIBRARY.push_up;
  const tempo = parseTempoString(opts.tempo, base.defaultTempo);
  if (opts.isHold || base.isHold) {
    tempo.hold = tempo.hold ?? base.defaultTempo.hold ?? 3;
  }

  return { ...base, tempo };
}

export function phaseDuration(phase: TempoPhase, tempo: TempoProfile): number {
  switch (phase) {
    case 'eccentric':
      return tempo.eccentric;
    case 'pause_bottom':
      return tempo.pauseBottom;
    case 'concentric':
      return tempo.concentric;
    case 'pause_top':
      return tempo.pauseTop;
    case 'hold':
      return tempo.hold ?? 3;
    case 'rest':
    case 'idle':
      return 0;
  }
}

export function nextWorkPhase(phase: TempoPhase, tempo: TempoProfile, isHold: boolean): TempoPhase {
  if (isHold || tempo.hold) return 'hold';
  const order: TempoPhase[] = ['eccentric', 'pause_bottom', 'concentric', 'pause_top'];
  const idx = order.indexOf(phase);
  for (let i = 1; i <= order.length; i++) {
    const candidate = order[(idx + i) % order.length];
    if (phaseDuration(candidate, tempo) > 0) return candidate;
  }
  return 'eccentric';
}

export function firstWorkPhase(tempo: TempoProfile, isHold: boolean): TempoPhase {
  if (isHold || (tempo.hold && tempo.eccentric === 0 && tempo.concentric === 0)) return 'hold';
  for (const p of ['eccentric', 'pause_bottom', 'concentric', 'pause_top'] as TempoPhase[]) {
    if (phaseDuration(p, tempo) > 0) return p;
  }
  return 'eccentric';
}

export function phaseLabel(phase: TempoPhase): string {
  switch (phase) {
    case 'eccentric':
      return 'Eccentric';
    case 'pause_bottom':
      return 'Pause · bottom';
    case 'concentric':
      return 'Concentric';
    case 'pause_top':
      return 'Pause · top';
    case 'hold':
      return 'Isometric hold';
    case 'rest':
      return 'Rest';
    default:
      return 'Ready';
  }
}

/** 0 = fully extended / top-of-rep for presses (plank line), 1 = bottom of eccentric. */
export function motionProgress(phase: TempoPhase, phaseElapsed: number, phaseTotal: number): number {
  const t = phaseTotal > 0 ? Math.min(1, Math.max(0, phaseElapsed / phaseTotal)) : 0;
  switch (phase) {
    case 'eccentric':
      return t;
    case 'pause_bottom':
      return 1;
    case 'concentric':
      return 1 - t;
    case 'pause_top':
      return 0;
    case 'hold':
      return 0.5 + Math.sin(phaseElapsed * Math.PI) * 0.02;
    case 'rest':
      return 0;
    default:
      return 0;
  }
}
