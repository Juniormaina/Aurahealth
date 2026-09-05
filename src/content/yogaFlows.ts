/** Yoga & breathwork flows for Aura Health Train — athlete recovery / mobility. */

export type YogaDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type AsanaType =
  | 'Posture / Reset'
  | 'Strength / Mobility'
  | 'Stretch'
  | 'Mobility / Spine Extension'
  | 'Strength / Stability'
  | 'Strength / Opening'
  | 'Lateral Stretch'
  | 'Balance'
  | 'Active Recovery / Inversion'
  | 'Core Stabilization'
  | 'Strength / Transition'
  | 'Spinal Extension'
  | 'Gentle Backbend'
  | 'Rest / Decompression'
  | 'Posterior Chain Stretch'
  | 'Hip Opener'
  | 'Rotation / Mobility'
  | 'Hip Flexor Stretch'
  | 'Restorative / Circulation'
  | 'Integration / Final Rest'
  | 'Breathwork';

export interface BreathPattern {
  inhale: number;
  hold_top: number;
  exhale: number;
  hold_bottom: number;
}

export interface AsanaDef {
  pose_id: string;
  pose_name: string;
  sanskrit?: string;
  type: AsanaType;
  default_duration_seconds: number;
  cue: string;
  animation_asset_id: string;
  bilateral?: boolean;
}

export interface YogaFlowStep {
  sequence_order: number;
  pose_name: string;
  pose_id: string;
  animation_asset_id: string;
  duration_seconds: number;
  breath_pattern: BreathPattern;
  audio_cue: string;
  side?: 'left' | 'right' | 'center';
}

export interface YogaFlow {
  session_id: string;
  flow_name: string;
  target_duration_minutes: number;
  focus_areas: string[];
  difficulty_tier: YogaDifficulty;
  recommended_after?: Array<'push' | 'pull' | 'legs_core' | 'upper_power' | 'core_iso' | 'any'>;
  steps: YogaFlowStep[];
}

const NASAL: BreathPattern = { inhale: 4, hold_top: 0, exhale: 4, hold_bottom: 0 };
const BOX: BreathPattern = { inhale: 4, hold_top: 4, exhale: 4, hold_bottom: 4 };
const LONG_EXHALE: BreathPattern = { inhale: 4, hold_top: 0, exhale: 6, hold_bottom: 0 };
const DIRGHA: BreathPattern = { inhale: 5, hold_top: 1, exhale: 5, hold_bottom: 0 };

export const PRANAYAMA = {
  box: {
    id: 'box_breathing',
    name: 'Box Breathing (Sama Vritti)',
    pattern: BOX,
    cue: 'Inhale 4 · hold 4 · exhale 4 · hold 4. Steady nasal breath for nervous system reset.',
  },
  nadi_shodhana: {
    id: 'nadi_shodhana',
    name: 'Nadi Shodhana (Alternate Nostril)',
    pattern: NASAL,
    cue: 'Alternate nostrils with equal inhale and exhale. Soften the jaw; eyes closed.',
  },
  dirgha: {
    id: 'dirgha',
    name: 'Dirgha Pranayama (Three-Part Breath)',
    pattern: DIRGHA,
    cue: 'Fill belly, ribs, then chest on the inhale; smooth continuous exhale.',
  },
} as const;

export const ASANA_LIBRARY: Record<string, AsanaDef> = {
  tadasana: {
    pose_id: 'tadasana',
    pose_name: 'Mountain Pose',
    sanskrit: 'Tadasana',
    type: 'Posture / Reset',
    default_duration_seconds: 30,
    cue: 'Ground through all four corners of the feet; lengthen the spine; steady nasal breathing.',
    animation_asset_id: 'yoga_tadasana',
  },
  utkatasana: {
    pose_id: 'utkatasana',
    pose_name: 'Chair Pose',
    sanskrit: 'Utkatasana',
    type: 'Strength / Mobility',
    default_duration_seconds: 45,
    cue: 'Sink hips back, engage core, lift arms overhead while keeping shoulders relaxed.',
    animation_asset_id: 'yoga_utkatasana',
  },
  uttanasana: {
    pose_id: 'uttanasana',
    pose_name: 'Standing Forward Fold',
    sanskrit: 'Uttanasana',
    type: 'Stretch',
    default_duration_seconds: 45,
    cue: 'Micro-bend knees if hamstrings are tight; let the crown of the head drop toward the floor.',
    animation_asset_id: 'yoga_uttanasana',
  },
  ardha_uttanasana: {
    pose_id: 'ardha_uttanasana',
    pose_name: 'Half Forward Fold',
    sanskrit: 'Ardha Uttanasana',
    type: 'Mobility / Spine Extension',
    default_duration_seconds: 30,
    cue: 'Flat back, gaze down, elongate the cervical spine.',
    animation_asset_id: 'yoga_ardha_uttanasana',
  },
  virabhadrasana_i: {
    pose_id: 'virabhadrasana_i',
    pose_name: 'Warrior I',
    sanskrit: 'Virabhadrasana I',
    type: 'Strength / Stability',
    default_duration_seconds: 45,
    cue: 'Square hips forward, front knee stacked over ankle, back heel grounded at ~45°.',
    animation_asset_id: 'yoga_warrior_i',
    bilateral: true,
  },
  virabhadrasana_ii: {
    pose_id: 'virabhadrasana_ii',
    pose_name: 'Warrior II',
    sanskrit: 'Virabhadrasana II',
    type: 'Strength / Opening',
    default_duration_seconds: 45,
    cue: 'Open hips to the side edge of the mat; gaze over the front middle finger.',
    animation_asset_id: 'yoga_warrior_ii',
    bilateral: true,
  },
  trikonasana: {
    pose_id: 'trikonasana',
    pose_name: 'Triangle Pose',
    sanskrit: 'Trikonasana',
    type: 'Lateral Stretch',
    default_duration_seconds: 45,
    cue: 'Extend torso sideways over the front leg; stack top shoulder over bottom.',
    animation_asset_id: 'yoga_trikonasana',
    bilateral: true,
  },
  vrksasana: {
    pose_id: 'vrksasana',
    pose_name: 'Tree Pose',
    sanskrit: 'Vṛkṣāsana',
    type: 'Balance',
    default_duration_seconds: 45,
    cue: 'Sole on inner calf or thigh (avoid the knee); fix gaze on a still point.',
    animation_asset_id: 'yoga_tree',
    bilateral: true,
  },
  adho_mukha: {
    pose_id: 'adho_mukha',
    pose_name: 'Downward-Facing Dog',
    sanskrit: 'Adho Mukha Svanasana',
    type: 'Active Recovery / Inversion',
    default_duration_seconds: 60,
    cue: 'Press chest toward thighs, pedal heels gently, shoulders away from ears.',
    animation_asset_id: 'yoga_down_dog',
  },
  phalakasana: {
    pose_id: 'phalakasana',
    pose_name: 'Plank Pose',
    sanskrit: 'Phalakasana',
    type: 'Core Stabilization',
    default_duration_seconds: 45,
    cue: 'Push the floor away; engage glutes and quads; crown-to-heels line.',
    animation_asset_id: 'yoga_plank',
  },
  chaturanga: {
    pose_id: 'chaturanga',
    pose_name: 'Four-Limbed Staff Pose',
    sanskrit: 'Chaturanga Dandasana',
    type: 'Strength / Transition',
    default_duration_seconds: 15,
    cue: 'Lower elbows alongside ribs to ~90°; keep the core rock-solid.',
    animation_asset_id: 'yoga_chaturanga',
  },
  urdhva_mukha: {
    pose_id: 'urdhva_mukha',
    pose_name: 'Upward-Facing Dog',
    sanskrit: 'Urdhva Mukha Svanasana',
    type: 'Spinal Extension',
    default_duration_seconds: 30,
    cue: 'Lift thighs and hips; press through palms; broaden collarbones.',
    animation_asset_id: 'yoga_up_dog',
  },
  bhujangasana: {
    pose_id: 'bhujangasana',
    pose_name: 'Cobra Pose',
    sanskrit: 'Bhujangasana',
    type: 'Gentle Backbend',
    default_duration_seconds: 30,
    cue: 'Pubic bone anchored; lift chest with upper-back strength.',
    animation_asset_id: 'yoga_cobra',
  },
  balasana: {
    pose_id: 'balasana',
    pose_name: "Child's Pose",
    sanskrit: 'Balasana',
    type: 'Rest / Decompression',
    default_duration_seconds: 60,
    cue: 'Hips toward heels, forehead soft on the mat, arms long forward.',
    animation_asset_id: 'yoga_child',
  },
  paschimottanasana: {
    pose_id: 'paschimottanasana',
    pose_name: 'Seated Forward Bend',
    sanskrit: 'Paschimottanasana',
    type: 'Posterior Chain Stretch',
    default_duration_seconds: 60,
    cue: 'Hinge from the hips rather than rounding the low back.',
    animation_asset_id: 'yoga_seated_fold',
  },
  baddha_konasana: {
    pose_id: 'baddha_konasana',
    pose_name: 'Bound Angle / Butterfly',
    sanskrit: 'Baddha Konasana',
    type: 'Hip Opener',
    default_duration_seconds: 60,
    cue: 'Soles together, knees soft outward; gentle fold if comfortable.',
    animation_asset_id: 'yoga_butterfly',
  },
  ardha_matsyendrasana: {
    pose_id: 'ardha_matsyendrasana',
    pose_name: 'Seated Spinal Twist',
    sanskrit: 'Ardha Matsyendrasana',
    type: 'Rotation / Mobility',
    default_duration_seconds: 45,
    cue: 'Tall spine on inhale; twist from the mid-back on exhale.',
    animation_asset_id: 'yoga_twist',
    bilateral: true,
  },
  anjaneyasana: {
    pose_id: 'anjaneyasana',
    pose_name: 'Low Lunge',
    sanskrit: 'Anjaneyasana',
    type: 'Hip Flexor Stretch',
    default_duration_seconds: 45,
    cue: 'Back knee down; sink hips forward; lift chest and arms.',
    animation_asset_id: 'yoga_lunge',
    bilateral: true,
  },
  viparita_karani: {
    pose_id: 'viparita_karani',
    pose_name: 'Legs-Up-The-Wall',
    sanskrit: 'Viparita Karani',
    type: 'Restorative / Circulation',
    default_duration_seconds: 120,
    cue: 'Legs vertical against a wall or support; surrender body weight.',
    animation_asset_id: 'yoga_legs_up',
  },
  savasana: {
    pose_id: 'savasana',
    pose_name: 'Corpse Pose',
    sanskrit: 'Śavāsana',
    type: 'Integration / Final Rest',
    default_duration_seconds: 180,
    cue: 'Total muscular release; natural breath; quiet mental focus.',
    animation_asset_id: 'yoga_savasana',
  },
  box_breath: {
    pose_id: 'box_breath',
    pose_name: 'Box Breathing',
    type: 'Breathwork',
    default_duration_seconds: 60,
    cue: PRANAYAMA.box.cue,
    animation_asset_id: 'yoga_breath_box',
  },
  dirgha_breath: {
    pose_id: 'dirgha_breath',
    pose_name: 'Three-Part Breath',
    type: 'Breathwork',
    default_duration_seconds: 60,
    cue: PRANAYAMA.dirgha.cue,
    animation_asset_id: 'yoga_breath_dirgha',
  },
  nadi_shodhana: {
    pose_id: 'nadi_shodhana',
    pose_name: 'Alternate Nostril Breathing',
    type: 'Breathwork',
    default_duration_seconds: 90,
    cue: PRANAYAMA.nadi_shodhana.cue,
    animation_asset_id: 'yoga_breath_nadi',
  },
};

function step(
  order: number,
  poseId: keyof typeof ASANA_LIBRARY,
  overrides: Partial<YogaFlowStep> & { breath?: BreathPattern } = {}
): YogaFlowStep {
  const asana = ASANA_LIBRARY[poseId];
  const { breath, ...rest } = overrides;
  return {
    sequence_order: order,
    pose_id: asana.pose_id,
    pose_name: asana.sanskrit ? `${asana.pose_name} (${asana.sanskrit})` : asana.pose_name,
    animation_asset_id: asana.animation_asset_id,
    duration_seconds: overrides.duration_seconds ?? asana.default_duration_seconds,
    breath_pattern: breath ?? NASAL,
    audio_cue: overrides.audio_cue ?? asana.cue,
    side: overrides.side ?? 'center',
    ...rest,
  };
}

/** Curated athlete recovery / mobility flows. */
export const YOGA_FLOWS: YogaFlow[] = [
  {
    session_id: 'yoga_post_push_wind_down',
    flow_name: 'Post-Push Wind Down',
    target_duration_minutes: 10,
    focus_areas: ['thoracic spine', 'shoulder decompression', 'parasympathetic reset'],
    difficulty_tier: 'Beginner',
    recommended_after: ['push', 'upper_power'],
    steps: [
      step(1, 'tadasana', { duration_seconds: 30, breath: DIRGHA, audio_cue: 'Arrive standing. Soften the ribs; three-part nasal breath.' }),
      step(2, 'uttanasana', { duration_seconds: 45, breath: LONG_EXHALE }),
      step(3, 'ardha_uttanasana', { duration_seconds: 30 }),
      step(4, 'adho_mukha', { duration_seconds: 60, breath: LONG_EXHALE }),
      step(5, 'balasana', { duration_seconds: 60 }),
      step(6, 'bhujangasana', { duration_seconds: 30 }),
      step(7, 'balasana', { duration_seconds: 45 }),
      step(8, 'ardha_matsyendrasana', { side: 'right', duration_seconds: 40 }),
      step(9, 'ardha_matsyendrasana', { side: 'left', duration_seconds: 40 }),
      step(10, 'box_breath', { duration_seconds: 60, breath: BOX }),
      step(11, 'savasana', { duration_seconds: 90, breath: LONG_EXHALE }),
    ],
  },
  {
    session_id: 'yoga_post_pull_recovery',
    flow_name: 'Post-Pull Recovery Flow',
    target_duration_minutes: 12,
    focus_areas: ['lat length', 'thoracic rotation', 'grip & neck release'],
    difficulty_tier: 'Beginner',
    recommended_after: ['pull'],
    steps: [
      step(1, 'dirgha_breath', { duration_seconds: 60, breath: DIRGHA }),
      step(2, 'tadasana', { duration_seconds: 30 }),
      step(3, 'uttanasana', { duration_seconds: 40 }),
      step(4, 'adho_mukha', { duration_seconds: 50 }),
      step(5, 'anjaneyasana', { side: 'right', duration_seconds: 40 }),
      step(6, 'anjaneyasana', { side: 'left', duration_seconds: 40 }),
      step(7, 'balasana', { duration_seconds: 50 }),
      step(8, 'ardha_matsyendrasana', { side: 'right', duration_seconds: 45 }),
      step(9, 'ardha_matsyendrasana', { side: 'left', duration_seconds: 45 }),
      step(10, 'paschimottanasana', { duration_seconds: 50, breath: LONG_EXHALE }),
      step(11, 'viparita_karani', { duration_seconds: 90 }),
      step(12, 'savasana', { duration_seconds: 60 }),
    ],
  },
  {
    session_id: 'yoga_morning_mobility',
    flow_name: 'Morning Mobility Ritual',
    target_duration_minutes: 10,
    focus_areas: ['hip openers', 'spine wake-up', 'balance'],
    difficulty_tier: 'Beginner',
    recommended_after: ['any'],
    steps: [
      step(1, 'dirgha_breath', { duration_seconds: 45, breath: DIRGHA }),
      step(2, 'tadasana', { duration_seconds: 25 }),
      step(3, 'utkatasana', { duration_seconds: 35 }),
      step(4, 'uttanasana', { duration_seconds: 35 }),
      step(5, 'ardha_uttanasana', { duration_seconds: 25 }),
      step(6, 'adho_mukha', { duration_seconds: 45 }),
      step(7, 'anjaneyasana', { side: 'right', duration_seconds: 35 }),
      step(8, 'anjaneyasana', { side: 'left', duration_seconds: 35 }),
      step(9, 'vrksasana', { side: 'right', duration_seconds: 30 }),
      step(10, 'vrksasana', { side: 'left', duration_seconds: 30 }),
      step(11, 'tadasana', { duration_seconds: 30, audio_cue: 'Close with steady Mountain Pose. Ready for the day.' }),
    ],
  },
  {
    session_id: 'yoga_legs_hip_openers',
    flow_name: 'Legs & Hip Opener Reset',
    target_duration_minutes: 12,
    focus_areas: ['hip flexors', 'adductors', 'posterior chain'],
    difficulty_tier: 'Intermediate',
    recommended_after: ['legs_core'],
    steps: [
      step(1, 'tadasana', { duration_seconds: 25 }),
      step(2, 'utkatasana', { duration_seconds: 40 }),
      step(3, 'anjaneyasana', { side: 'right', duration_seconds: 45 }),
      step(4, 'anjaneyasana', { side: 'left', duration_seconds: 45 }),
      step(5, 'trikonasana', { side: 'right', duration_seconds: 40 }),
      step(6, 'trikonasana', { side: 'left', duration_seconds: 40 }),
      step(7, 'baddha_konasana', { duration_seconds: 60, breath: LONG_EXHALE }),
      step(8, 'paschimottanasana', { duration_seconds: 55 }),
      step(9, 'ardha_matsyendrasana', { side: 'right', duration_seconds: 40 }),
      step(10, 'ardha_matsyendrasana', { side: 'left', duration_seconds: 40 }),
      step(11, 'viparita_karani', { duration_seconds: 90 }),
      step(12, 'savasana', { duration_seconds: 75 }),
    ],
  },
  {
    session_id: 'yoga_evening_parasympathetic',
    flow_name: 'Evening Parasympathetic Reset',
    target_duration_minutes: 15,
    focus_areas: ['parasympathetic reset', 'hip openers', 'sleep prep'],
    difficulty_tier: 'Beginner',
    recommended_after: ['any'],
    steps: [
      step(1, 'nadi_shodhana', { duration_seconds: 90, breath: NASAL }),
      step(2, 'balasana', { duration_seconds: 60, breath: LONG_EXHALE }),
      step(3, 'baddha_konasana', { duration_seconds: 60 }),
      step(4, 'paschimottanasana', { duration_seconds: 60 }),
      step(5, 'ardha_matsyendrasana', { side: 'right', duration_seconds: 40 }),
      step(6, 'ardha_matsyendrasana', { side: 'left', duration_seconds: 40 }),
      step(7, 'viparita_karani', { duration_seconds: 120, breath: LONG_EXHALE }),
      step(8, 'box_breath', { duration_seconds: 60, breath: BOX }),
      step(9, 'savasana', { duration_seconds: 180, breath: LONG_EXHALE }),
    ],
  },
  {
    session_id: 'yoga_athlete_core_reset',
    flow_name: 'Athlete Core & Spine Reset',
    target_duration_minutes: 10,
    focus_areas: ['core stability', 'spinal extension', 'active recovery'],
    difficulty_tier: 'Intermediate',
    recommended_after: ['core_iso', 'upper_power'],
    steps: [
      step(1, 'tadasana', { duration_seconds: 25 }),
      step(2, 'adho_mukha', { duration_seconds: 45 }),
      step(3, 'phalakasana', { duration_seconds: 35 }),
      step(4, 'chaturanga', { duration_seconds: 15 }),
      step(5, 'urdhva_mukha', { duration_seconds: 25 }),
      step(6, 'adho_mukha', { duration_seconds: 40 }),
      step(7, 'bhujangasana', { duration_seconds: 30 }),
      step(8, 'balasana', { duration_seconds: 50 }),
      step(9, 'box_breath', { duration_seconds: 45, breath: BOX }),
      step(10, 'savasana', { duration_seconds: 60 }),
    ],
  },
];

export function getYogaFlow(sessionId: string): YogaFlow | undefined {
  return YOGA_FLOWS.find((f) => f.session_id === sessionId);
}

export function getAsana(poseId: string): AsanaDef | undefined {
  return ASANA_LIBRARY[poseId];
}

export function flowTotalSeconds(flow: YogaFlow): number {
  return flow.steps.reduce((sum, s) => sum + s.duration_seconds, 0);
}
