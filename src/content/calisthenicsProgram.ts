/** 90-day calisthenics program — from docs/90_day_calisthenics_app_guide.pdf */

export type MovementPattern =
  | 'horizontal_push'
  | 'vertical_push'
  | 'vertical_pull'
  | 'horizontal_pull'
  | 'anterior_legs'
  | 'posterior_legs'
  | 'core'
  | 'mobility';

export type DifficultyTier = 'beginner' | 'intermediate';

export type WorkoutKind = 'push' | 'pull' | 'legs_core' | 'rest' | 'upper_power' | 'core_iso' | 'flexibility';

export interface ExerciseDef {
  exerciseId: string;
  name: string;
  pattern: MovementPattern;
  tier: DifficultyTier;
  alternativeExerciseId?: string;
  formCue: string;
  /** Hold-based movement (plank, hang) uses seconds instead of reps. */
  isHold?: boolean;
}

export interface RoutineExercise {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: string;
  tempo: string;
  alternativeExerciseId?: string;
  formCue: string;
  isHold?: boolean;
  pattern: MovementPattern;
}

export interface DayRoutine {
  programId: string;
  version: string;
  programDay: number;
  block: 1 | 2 | 3;
  week: number;
  day: number;
  microcycleSlot: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  kind: WorkoutKind;
  routineName: string;
  recommendedRestSeconds: number;
  focus: string;
  trackingFocus: string;
  exercises: RoutineExercise[];
}

export const CALISTHENICS_PROGRAM_ID = 'calisthenics_90_day_core';
export const CALISTHENICS_VERSION = '1.0.0';
export const CALISTHENICS_TOTAL_DAYS = 90;

export const BLOCK_META: Record<
  1 | 2 | 3,
  { title: string; days: string; focus: string; tracking: string }
> = {
  1: {
    title: 'Foundational Volume',
    days: '1–30',
    focus: 'Condition connective tissue, lock in form, build endurance with higher reps.',
    tracking: 'Total repetitions & baseline capacity',
  },
  2: {
    title: 'Strength Progression',
    days: '31–60',
    focus: 'Eccentric loading, harder levers, and lower-rep strength work.',
    tracking: 'Time under tension & RPE',
  },
  3: {
    title: 'Power & Mastery',
    days: '61–90',
    focus: 'Explosive work, unilateral variants, and skill prep (e.g. handstand).',
    tracking: 'Peak power & recovery speed',
  },
};

const EXERCISES: Record<string, ExerciseDef> = {
  horiz_push_01: {
    exerciseId: 'horiz_push_01',
    name: 'Incline Push-ups (hands elevated)',
    pattern: 'horizontal_push',
    tier: 'beginner',
    alternativeExerciseId: 'horiz_push_02',
    formCue: 'Hands on a sturdy chair or bench. Body in a straight line; lower chest toward the edge.',
  },
  horiz_push_02: {
    exerciseId: 'horiz_push_02',
    name: 'Standard Floor Push-ups',
    pattern: 'horizontal_push',
    tier: 'intermediate',
    alternativeExerciseId: 'horiz_push_01',
    formCue: 'Hands under shoulders, elbows ~45°. Keep ribs down and glutes lightly engaged.',
  },
  vert_push_01: {
    exerciseId: 'vert_push_01',
    name: 'Pike Push-ups (feet on ground)',
    pattern: 'vertical_push',
    tier: 'beginner',
    alternativeExerciseId: 'vert_push_02',
    formCue: 'Hips high, head looking between hands. Bend elbows to bring crown of head toward floor.',
  },
  vert_push_02: {
    exerciseId: 'vert_push_02',
    name: 'Elevated Pike / Wall Handstand Hold',
    pattern: 'vertical_push',
    tier: 'intermediate',
    alternativeExerciseId: 'vert_push_01',
    formCue: 'Feet elevated or kick up to wall. Stack wrists–shoulders–hips; breathe calmly.',
    isHold: true,
  },
  vert_pull_01: {
    exerciseId: 'vert_pull_01',
    name: 'Band Lat Pull-downs / Dead Hangs',
    pattern: 'vertical_pull',
    tier: 'beginner',
    alternativeExerciseId: 'vert_pull_02',
    formCue: 'Pull elbows to ribs with a band, or hang with active shoulders (not shrugged).',
  },
  vert_pull_02: {
    exerciseId: 'vert_pull_02',
    name: 'Pronated Pull-ups / Chin-ups',
    pattern: 'vertical_pull',
    tier: 'intermediate',
    alternativeExerciseId: 'vert_pull_01',
    formCue: 'Start from a dead hang; pull chest toward the bar without kipping.',
  },
  horiz_pull_01: {
    exerciseId: 'horiz_pull_01',
    name: 'Inverted Rows (under table/desk)',
    pattern: 'horizontal_pull',
    tier: 'beginner',
    alternativeExerciseId: 'horiz_pull_02',
    formCue: 'Body straight under a sturdy edge. Pull chest up; squeeze shoulder blades.',
  },
  horiz_pull_02: {
    exerciseId: 'horiz_pull_02',
    name: 'Feet-Elevated Inverted Rows',
    pattern: 'horizontal_pull',
    tier: 'intermediate',
    alternativeExerciseId: 'horiz_pull_01',
    formCue: 'Elevate feet to increase load. Keep hips locked; pause briefly at the top.',
  },
  ant_legs_01: {
    exerciseId: 'ant_legs_01',
    name: 'Air Squats to a chair',
    pattern: 'anterior_legs',
    tier: 'beginner',
    alternativeExerciseId: 'ant_legs_02',
    formCue: 'Sit back to a chair lightly, then stand. Knees track over mid-foot.',
  },
  ant_legs_02: {
    exerciseId: 'ant_legs_02',
    name: 'Bulgarian Split Squats',
    pattern: 'anterior_legs',
    tier: 'intermediate',
    alternativeExerciseId: 'ant_legs_01',
    formCue: 'Rear foot elevated. Front knee tracks forward; torso tall.',
  },
  post_legs_01: {
    exerciseId: 'post_legs_01',
    name: 'Glute Bridges (both feet)',
    pattern: 'posterior_legs',
    tier: 'beginner',
    alternativeExerciseId: 'post_legs_02',
    formCue: 'Drive through heels, squeeze glutes at the top without overarching the low back.',
  },
  post_legs_02: {
    exerciseId: 'post_legs_02',
    name: 'Single-Leg Glute Bridge',
    pattern: 'posterior_legs',
    tier: 'intermediate',
    alternativeExerciseId: 'post_legs_01',
    formCue: 'One foot planted; other leg extended. Hips level at the top.',
  },
  core_01: {
    exerciseId: 'core_01',
    name: 'Forearm Plank',
    pattern: 'core',
    tier: 'beginner',
    alternativeExerciseId: 'core_02',
    formCue: 'Elbows under shoulders, ribs down, glutes on. Hold steady breathing.',
    isHold: true,
  },
  core_02: {
    exerciseId: 'core_02',
    name: 'Hanging Knee Raises / L-Sit Progressions',
    pattern: 'core',
    tier: 'intermediate',
    alternativeExerciseId: 'core_01',
    formCue: 'Control the swing. Lift knees or tuck toward an L-sit without yanking.',
  },
  mob_01: {
    exerciseId: 'mob_01',
    name: 'World’s Greatest Stretch',
    pattern: 'mobility',
    tier: 'beginner',
    alternativeExerciseId: 'mob_02',
    formCue: 'Lunge, hand inside front foot, rotate open. Smooth and controlled.',
  },
  mob_02: {
    exerciseId: 'mob_02',
    name: 'Deep Squat + Thoracic Openers',
    pattern: 'mobility',
    tier: 'intermediate',
    alternativeExerciseId: 'mob_01',
    formCue: 'Hold a deep squat; open one arm to the sky each breath cycle.',
  },
  mob_03: {
    exerciseId: 'mob_03',
    name: 'Cat–Cow + Hip Flexor Stretch',
    pattern: 'mobility',
    tier: 'beginner',
    alternativeExerciseId: 'mob_04',
    formCue: 'Move with the breath. Soften shoulders; don’t force end range.',
  },
  mob_04: {
    exerciseId: 'mob_04',
    name: 'Pike Fold + Shoulder Dislocates (band)',
    pattern: 'mobility',
    tier: 'intermediate',
    alternativeExerciseId: 'mob_03',
    formCue: 'Hinge at hips for the fold; keep ribs stacked on band passes.',
  },
};

const MICROCYCLE: Record<
  1 | 2 | 3 | 4 | 5 | 6 | 7,
  { kind: WorkoutKind; name: (block: 1 | 2 | 3) => string; focus: string; patterns: MovementPattern[] }
> = {
  1: {
    kind: 'push',
    name: (b) => (b === 1 ? 'Foundational Push Day' : b === 2 ? 'Strength Push Day' : 'Power Push Day'),
    focus: 'Chest, anterior delts, and triceps',
    patterns: ['horizontal_push', 'vertical_push', 'core'],
  },
  2: {
    kind: 'pull',
    name: (b) => (b === 1 ? 'Foundational Pull Day' : b === 2 ? 'Strength Pull Day' : 'Power Pull Day'),
    focus: 'Lats, rhomboids, biceps, and rear delts',
    patterns: ['vertical_pull', 'horizontal_pull', 'core'],
  },
  3: {
    kind: 'legs_core',
    name: (b) => (b === 1 ? 'Legs & Core Foundations' : b === 2 ? 'Unilateral Legs & Core' : 'Athletic Legs & Core'),
    focus: 'Quads, hamstrings, glutes, and abs',
    patterns: ['anterior_legs', 'posterior_legs', 'core'],
  },
  4: {
    kind: 'rest',
    name: () => 'Full System Passive Rest',
    focus: 'Recover — walk lightly, hydrate, sleep well',
    patterns: [],
  },
  5: {
    kind: 'upper_power',
    name: (b) => (b === 1 ? 'Upper Body Density' : b === 2 ? 'Upper Body Strength Density' : 'Upper Body Power'),
    focus: 'Compound upper work with longer rest windows',
    patterns: ['horizontal_push', 'vertical_pull', 'horizontal_pull', 'vertical_push'],
  },
  6: {
    kind: 'core_iso',
    name: () => 'Active Core & Isometrics',
    focus: 'Core isolation and isometric holds',
    patterns: ['core', 'posterior_legs'],
  },
  7: {
    kind: 'flexibility',
    name: () => 'Flexibility / Active Recovery',
    focus: 'Full-body dynamic stretching',
    patterns: ['mobility', 'mobility'],
  },
};

function pickExercise(pattern: MovementPattern, tier: DifficultyTier, mobilityIndex = 0): ExerciseDef {
  if (pattern === 'mobility') {
    const pair = mobilityIndex % 2 === 0 ? ['mob_01', 'mob_02'] : ['mob_03', 'mob_04'];
    const id = tier === 'beginner' ? pair[0] : pair[1];
    return EXERCISES[id]!;
  }
  const match = Object.values(EXERCISES).find((e) => e.pattern === pattern && e.tier === tier);
  if (match) return match;
  return Object.values(EXERCISES).find((e) => e.pattern === pattern)!;
}

function targetReps(kind: WorkoutKind, block: 1 | 2 | 3, isHold?: boolean): string {
  if (kind === 'flexibility') return isHold ? '30–45s' : '8–10/side';
  if (isHold) {
    if (block === 1) return '20–40s';
    if (block === 2) return '30–50s';
    return '40–60s';
  }
  if (kind === 'upper_power' || kind === 'core_iso') {
    if (block === 1) return '10–12';
    if (block === 2) return '8–10';
    return '6–8';
  }
  if (block === 1) return '12–15';
  if (block === 2) return '8–12';
  return '6–10';
}

function targetSets(kind: WorkoutKind, block: 1 | 2 | 3): number {
  if (kind === 'flexibility') return 2;
  if (kind === 'core_iso') return block === 3 ? 4 : 3;
  if (kind === 'upper_power') return 4;
  return block === 1 ? 4 : 3;
}

function restSeconds(kind: WorkoutKind): number {
  if (kind === 'rest') return 0;
  if (kind === 'upper_power') return 90;
  if (kind === 'flexibility') return 30;
  return 60;
}

export function getExerciseById(id: string): ExerciseDef | undefined {
  return EXERCISES[id];
}

export function swapExerciseTier(exerciseId: string, direction: 'easier' | 'harder'): ExerciseDef | null {
  const current = EXERCISES[exerciseId];
  if (!current?.alternativeExerciseId) return null;
  const alt = EXERCISES[current.alternativeExerciseId];
  if (!alt) return null;
  if (direction === 'easier' && current.tier === 'beginner') return null;
  if (direction === 'harder' && current.tier === 'intermediate') return null;
  if (direction === 'easier' && alt.tier !== 'beginner') return null;
  if (direction === 'harder' && alt.tier !== 'intermediate') return null;
  return alt;
}

/** Build the routine for calendar program day 1–90. */
export function getDayRoutine(programDay: number, tier: DifficultyTier = 'beginner'): DayRoutine {
  const day = Math.min(CALISTHENICS_TOTAL_DAYS, Math.max(1, Math.floor(programDay)));
  const block = Math.min(3, Math.ceil(day / 30)) as 1 | 2 | 3;
  const week = Math.ceil(day / 7);
  const microcycleSlot = (((day - 1) % 7) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const slot = MICROCYCLE[microcycleSlot];
  const meta = BLOCK_META[block];

  if (slot.kind === 'rest') {
    return {
      programId: CALISTHENICS_PROGRAM_ID,
      version: CALISTHENICS_VERSION,
      programDay: day,
      block,
      week,
      day: microcycleSlot,
      microcycleSlot,
      kind: 'rest',
      routineName: slot.name(block),
      recommendedRestSeconds: 0,
      focus: slot.focus,
      trackingFocus: meta.tracking,
      exercises: [],
    };
  }

  let mobilityIndex = 0;
  const exercises: RoutineExercise[] = slot.patterns.map((pattern) => {
    const def = pickExercise(pattern, tier, mobilityIndex);
    if (pattern === 'mobility') mobilityIndex += 1;
    return {
      exerciseId: def.exerciseId,
      name: def.name,
      targetSets: targetSets(slot.kind, block),
      targetReps: targetReps(slot.kind, block, def.isHold),
      tempo: def.isHold ? 'hold' : block >= 2 ? '3-0-1-0' : '2-0-1-0',
      alternativeExerciseId: def.alternativeExerciseId,
      formCue: def.formCue,
      isHold: def.isHold,
      pattern: def.pattern,
    };
  });

  return {
    programId: CALISTHENICS_PROGRAM_ID,
    version: CALISTHENICS_VERSION,
    programDay: day,
    block,
    week,
    day: microcycleSlot,
    microcycleSlot,
    kind: slot.kind,
    routineName: slot.name(block),
    recommendedRestSeconds: restSeconds(slot.kind),
    focus: slot.focus,
    trackingFocus: meta.tracking,
    exercises,
  };
}

export function weekPreview(programDay: number, tier: DifficultyTier): DayRoutine[] {
  const start = programDay - ((programDay - 1) % 7);
  return Array.from({ length: 7 }, (_, i) => getDayRoutine(start + i, tier));
}
