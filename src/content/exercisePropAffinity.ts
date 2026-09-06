import type { AnimationState } from './calisthenicsExercises3D';
import type { GearMeshKind } from './studioGearCatalog';

export type YogaAsanaFamilyKey =
  | 'standing'
  | 'fold'
  | 'half_fold'
  | 'breath'
  | 'chair'
  | 'warrior'
  | 'triangle'
  | 'tree'
  | 'down_dog'
  | 'plank'
  | 'chaturanga'
  | 'up_dog'
  | 'cobra'
  | 'child'
  | 'seated_fold'
  | 'butterfly'
  | 'twist'
  | 'lunge'
  | 'legs_up'
  | 'savasana';

export type PropBindMode =
  | 'bodyweight'
  | 'mat'
  | 'support_blocks'
  | 'grip_bars'
  | 'hang_bar'
  | 'hang_rings'
  | 'band'
  | 'bolster'
  | 'chair';

export interface PropAffinity {
  preferredGear: GearMeshKind[];
  bindMode: PropBindMode;
  bodyweightOk: boolean;
  allowCoachOverlap: boolean;
  propSlot: { x: number; z: number; yawDeg: number };
  coachOffset: { x: number; y: number; z: number };
  coachYawOffsetDeg: number;
  label: string;
}

function yogaFamilyFromAsset(id: string): YogaAsanaFamilyKey {
  if (id.includes('breath')) return 'breath';
  if (id.includes('uttanasana') && id.includes('ardha')) return 'half_fold';
  if (id.includes('uttanasana')) return 'fold';
  if (id.includes('utkatasana')) return 'chair';
  if (id.includes('warrior')) return 'warrior';
  if (id.includes('trikonasana')) return 'triangle';
  if (id.includes('tree')) return 'tree';
  if (id.includes('down_dog')) return 'down_dog';
  if (id.includes('plank')) return 'plank';
  if (id.includes('chaturanga')) return 'chaturanga';
  if (id.includes('up_dog')) return 'up_dog';
  if (id.includes('cobra')) return 'cobra';
  if (id.includes('child')) return 'child';
  if (id.includes('seated_fold')) return 'seated_fold';
  if (id.includes('butterfly')) return 'butterfly';
  if (id.includes('twist')) return 'twist';
  if (id.includes('lunge')) return 'lunge';
  if (id.includes('legs_up')) return 'legs_up';
  if (id.includes('savasana')) return 'savasana';
  return 'standing';
}

const BW: PropAffinity = {
  preferredGear: [],
  bindMode: 'bodyweight',
  bodyweightOk: true,
  allowCoachOverlap: false,
  propSlot: { x: 0, z: 0, yawDeg: 0 },
  coachOffset: { x: 0, y: 0, z: 0 },
  coachYawOffsetDeg: 0,
  label: 'Bodyweight',
};

const MAT: PropAffinity = {
  preferredGear: ['yoga_mat'],
  bindMode: 'mat',
  bodyweightOk: true,
  allowCoachOverlap: true,
  propSlot: { x: 0, z: 0.1, yawDeg: 0 },
  coachOffset: { x: 0, y: 0.02, z: 0 },
  coachYawOffsetDeg: 0,
  label: 'Yoga mat',
};

const BLOCKS: PropAffinity = {
  preferredGear: ['cork_block', 'yoga_mat'],
  bindMode: 'support_blocks',
  bodyweightOk: true,
  allowCoachOverlap: true,
  propSlot: { x: 0.32, z: 0.35, yawDeg: 0 },
  coachOffset: { x: -0.28, y: 0.05, z: -0.05 },
  coachYawOffsetDeg: 0,
  label: 'Cork block support',
};

const BARS: PropAffinity = {
  preferredGear: ['parallel_bars'],
  bindMode: 'grip_bars',
  bodyweightOk: false,
  allowCoachOverlap: true,
  propSlot: { x: 0, z: -0.15, yawDeg: 0 },
  coachOffset: { x: 0, y: 0.35, z: 0 },
  coachYawOffsetDeg: 0,
  label: 'Parallel bars',
};

const PULLUP: PropAffinity = {
  preferredGear: ['pull_up_station', 'gymnastics_rings'],
  bindMode: 'hang_bar',
  bodyweightOk: false,
  allowCoachOverlap: true,
  propSlot: { x: 0, z: -0.2, yawDeg: 0 },
  coachOffset: { x: 0, y: 0.15, z: 0.05 },
  coachYawOffsetDeg: 0,
  label: 'Pull-up station',
};

const RINGS: PropAffinity = {
  preferredGear: ['gymnastics_rings', 'pull_up_station'],
  bindMode: 'hang_rings',
  bodyweightOk: false,
  allowCoachOverlap: true,
  propSlot: { x: 0, z: -0.15, yawDeg: 0 },
  coachOffset: { x: 0, y: 0.1, z: 0.05 },
  coachYawOffsetDeg: 0,
  label: 'Gymnastics rings',
};

const BAND: PropAffinity = {
  preferredGear: ['resistance_band'],
  bindMode: 'band',
  bodyweightOk: true,
  allowCoachOverlap: true,
  propSlot: { x: 0.4, z: 0.2, yawDeg: 45 },
  coachOffset: { x: -0.25, y: 0, z: -0.05 },
  coachYawOffsetDeg: -20,
  label: 'Resistance band',
};

const BOLSTER: PropAffinity = {
  preferredGear: ['bolster', 'yoga_mat'],
  bindMode: 'bolster',
  bodyweightOk: true,
  allowCoachOverlap: true,
  propSlot: { x: 0, z: 0.15, yawDeg: 90 },
  coachOffset: { x: 0, y: 0.12, z: 0 },
  coachYawOffsetDeg: 0,
  label: 'Bolster',
};

const STRAP: PropAffinity = {
  preferredGear: ['cotton_strap', 'yoga_mat'],
  bindMode: 'mat',
  bodyweightOk: true,
  allowCoachOverlap: true,
  propSlot: { x: 0.35, z: 0.25, yawDeg: 0 },
  coachOffset: { x: -0.2, y: 0, z: 0 },
  coachYawOffsetDeg: 15,
  label: 'Strap assist',
};

const CHAIR: PropAffinity = {
  preferredGear: ['gym_chair'],
  bindMode: 'chair',
  bodyweightOk: false,
  allowCoachOverlap: true,
  propSlot: { x: -0.9, z: 0.2, yawDeg: 20 },
  coachOffset: { x: 0, y: 0.15, z: 0.05 },
  coachYawOffsetDeg: 0,
  label: 'Gym chair',
};

const PARALLETTES: PropAffinity = {
  preferredGear: ['parallettes', 'parallel_bars'],
  bindMode: 'grip_bars',
  bodyweightOk: true,
  allowCoachOverlap: true,
  propSlot: { x: -1.1, z: 0.8, yawDeg: 0 },
  coachOffset: { x: 0, y: 0.2, z: 0 },
  coachYawOffsetDeg: 0,
  label: 'Parallettes',
};

/** Calisthenics animation → prop affinity */
export const CALI_PROP_AFFINITY: Record<AnimationState, PropAffinity> = {
  idle: BW,
  rest: BW,
  push_up: { ...MAT, preferredGear: ['yoga_mat'], label: 'Floor push-up mat' },
  pike_press: MAT,
  pull_up: PULLUP,
  row: RINGS,
  squat: BW,
  pistol_squat: BW,
  split_squat: BW,
  bridge: MAT,
  dip: BARS,
  muscle_up: PULLUP,
  plank: MAT,
  hang: PULLUP,
  knee_raise: PULLUP,
  mobility: { ...MAT, preferredGear: ['yoga_mat', 'cork_block'], label: 'Mobility mat' },
};

/** Per-exercise library overrides (more specific than animationState). */
export const CALI_EXERCISE_PROP_OVERRIDE: Partial<Record<string, PropAffinity>> = {
  lat_pulldown: BAND,
  dip: BARS,
  inverted_row: RINGS,
  incline_push_up: CHAIR,
  push_up: { ...MAT, preferredGear: ['yoga_mat'], label: 'Rubber floor / mat push-up' },
  handstand_hold: PARALLETTES,
  air_squat: CHAIR,
  pistol_squat: BW,
  split_squat: BW,
  pike_push_up: PARALLETTES,
};

export const YOGA_PROP_AFFINITY: Record<YogaAsanaFamilyKey, PropAffinity> = {
  standing: BW,
  breath: MAT,
  chair: CHAIR,
  fold: STRAP,
  half_fold: STRAP,
  warrior: MAT,
  triangle: BLOCKS,
  tree: BW,
  down_dog: MAT,
  plank: MAT,
  chaturanga: MAT,
  up_dog: MAT,
  cobra: MAT,
  child: { ...BOLSTER, preferredGear: ['bolster', 'yoga_mat'] },
  seated_fold: STRAP,
  butterfly: MAT,
  twist: BLOCKS,
  lunge: BLOCKS,
  legs_up: BOLSTER,
  savasana: { ...BOLSTER, preferredGear: ['yoga_mat', 'bolster'], bindMode: 'mat', label: 'Savasana mat' },
};

export interface ExercisePropContext {
  mode: 'calisthenics' | 'yoga';
  /** Stable key — exercise id or yoga asset id */
  exerciseKey: string;
  animationState?: AnimationState;
  /** Calisthenics library id (push_up, dip, …) */
  libraryId?: string;
  yogaAssetId?: string;
  isResting?: boolean;
}

export function resolvePropAffinity(ctx: ExercisePropContext): PropAffinity {
  if (ctx.isResting) return BW;

  if (ctx.mode === 'yoga') {
    const fam = yogaFamilyFromAsset(ctx.yogaAssetId ?? ctx.exerciseKey);
    return YOGA_PROP_AFFINITY[fam] ?? BW;
  }

  if (ctx.libraryId && CALI_EXERCISE_PROP_OVERRIDE[ctx.libraryId]) {
    return CALI_EXERCISE_PROP_OVERRIDE[ctx.libraryId]!;
  }
  const state = ctx.animationState ?? 'idle';
  return CALI_PROP_AFFINITY[state] ?? BW;
}

export function exerciseRequiresProp(affinity: PropAffinity): boolean {
  return affinity.preferredGear.length > 0 && !affinity.bodyweightOk;
}

/** Session flags exposed when the active exercise module changes. */
export interface ExercisePropSessionMeta {
  exerciseKey: string;
  affinityLabel: string;
  bindMode: PropBindMode;
  requiresProp: boolean;
  preferredGear: GearMeshKind[];
  activeGearId: GearMeshKind | null;
  activeInstanceId: string | null;
  usingFallback: boolean;
  bodyweightOk: boolean;
}
