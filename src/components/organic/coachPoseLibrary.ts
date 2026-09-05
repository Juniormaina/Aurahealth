import * as THREE from 'three';
import type { AnimationState } from '../../content/calisthenicsExercises3D';

export type BoneEulers = Record<string, [number, number, number]>;

export interface RigPose {
  /** Whole-character tilt (e.g. horizontal for plank/push-up). */
  rootRot: [number, number, number];
  rootY: number;
  bones: BoneEulers;
}

const DEG = Math.PI / 180;
const B = (n: string) => `mixamorig${n}`;

/** Standing athletic ready — mild arm hang from Mixamo bind. */
export const IDLE_POSE: RigPose = {
  rootRot: [0, 0, 0],
  rootY: 0,
  bones: {
    [B('Hips')]: [0, 0, 0],
    [B('Spine')]: [0, 0, 0],
    [B('Spine1')]: [0, 0, 0],
    [B('Spine2')]: [0, 0, 0],
    [B('Neck')]: [0, 0, 0],
    [B('Head')]: [0, 0, 0],
    [B('LeftShoulder')]: [0, 0, 0],
    [B('RightShoulder')]: [0, 0, 0],
    [B('LeftArm')]: [0, 0, 70 * DEG],
    [B('RightArm')]: [0, 0, -70 * DEG],
    [B('LeftForeArm')]: [0, 0, 0],
    [B('RightForeArm')]: [0, 0, 0],
    [B('LeftHand')]: [0, 0, 0],
    [B('RightHand')]: [0, 0, 0],
    [B('LeftUpLeg')]: [0, 0, 0],
    [B('RightUpLeg')]: [0, 0, 0],
    [B('LeftLeg')]: [0, 0, 0],
    [B('RightLeg')]: [0, 0, 0],
    [B('LeftFoot')]: [0, 0, 0],
    [B('RightFoot')]: [0, 0, 0],
  },
};

export const REST_POSE: RigPose = {
  rootRot: [0, 12 * DEG, 0],
  rootY: 0,
  bones: {
    ...IDLE_POSE.bones,
    [B('LeftArm')]: [15 * DEG, 0, 75 * DEG],
    [B('RightArm')]: [-10 * DEG, 0, -80 * DEG],
    [B('LeftForeArm')]: [0, 0, 25 * DEG],
    [B('RightForeArm')]: [0, 0, -35 * DEG],
    [B('Head')]: [0, 8 * DEG, 0],
  },
};

function pose(partial: Partial<RigPose> & { bones: BoneEulers }): RigPose {
  return {
    rootRot: partial.rootRot ?? [0, 0, 0],
    rootY: partial.rootY ?? 0,
    bones: { ...IDLE_POSE.bones, ...partial.bones },
  };
}

/** A = extended / top of rep, B = compressed / bottom. */
export const CALI_POSE_A: Record<AnimationState, RigPose> = {
  idle: IDLE_POSE,
  rest: REST_POSE,
  push_up: pose({
    rootRot: [90 * DEG, 0, 0],
    rootY: 0.15,
    bones: {
      [B('Spine')]: [5 * DEG, 0, 0],
      [B('LeftArm')]: [0, 0, 80 * DEG],
      [B('RightArm')]: [0, 0, -80 * DEG],
      [B('LeftForeArm')]: [0, 0, 10 * DEG],
      [B('RightForeArm')]: [0, 0, -10 * DEG],
      [B('LeftUpLeg')]: [0, 0, 0],
      [B('RightUpLeg')]: [0, 0, 0],
      [B('Head')]: [-5 * DEG, 0, 0],
    },
  }),
  pike_press: pose({
    rootRot: [55 * DEG, 0, 0],
    rootY: 0.05,
    bones: {
      [B('Spine')]: [20 * DEG, 0, 0],
      [B('Spine1')]: [10 * DEG, 0, 0],
      [B('LeftArm')]: [-20 * DEG, 0, 70 * DEG],
      [B('RightArm')]: [-20 * DEG, 0, -70 * DEG],
      [B('LeftForeArm')]: [0, 0, 15 * DEG],
      [B('RightForeArm')]: [0, 0, -15 * DEG],
      [B('LeftUpLeg')]: [-25 * DEG, 0, 0],
      [B('RightUpLeg')]: [-25 * DEG, 0, 0],
      [B('Head')]: [25 * DEG, 0, 0],
    },
  }),
  pull_up: pose({
    rootY: 0.2,
    bones: {
      [B('LeftArm')]: [-160 * DEG, 20 * DEG, 40 * DEG],
      [B('RightArm')]: [-160 * DEG, -20 * DEG, -40 * DEG],
      [B('LeftForeArm')]: [-20 * DEG, 0, 0],
      [B('RightForeArm')]: [-20 * DEG, 0, 0],
      [B('LeftUpLeg')]: [8 * DEG, 0, 5 * DEG],
      [B('RightUpLeg')]: [8 * DEG, 0, -5 * DEG],
    },
  }),
  hang: pose({
    rootY: 0.25,
    bones: {
      [B('LeftArm')]: [-170 * DEG, 10 * DEG, 30 * DEG],
      [B('RightArm')]: [-170 * DEG, -10 * DEG, -30 * DEG],
      [B('LeftForeArm')]: [0, 0, 0],
      [B('RightForeArm')]: [0, 0, 0],
    },
  }),
  row: pose({
    rootRot: [70 * DEG, 0, 0],
    rootY: 0.1,
    bones: {
      [B('LeftArm')]: [-40 * DEG, 0, 70 * DEG],
      [B('RightArm')]: [-40 * DEG, 0, -70 * DEG],
      [B('LeftForeArm')]: [-30 * DEG, 0, 0],
      [B('RightForeArm')]: [-30 * DEG, 0, 0],
    },
  }),
  squat: pose({
    bones: {
      [B('Spine')]: [8 * DEG, 0, 0],
      [B('LeftArm')]: [0, 0, 75 * DEG],
      [B('RightArm')]: [0, 0, -75 * DEG],
      [B('LeftUpLeg')]: [20 * DEG, 0, 0],
      [B('RightUpLeg')]: [20 * DEG, 0, 0],
      [B('LeftLeg')]: [15 * DEG, 0, 0],
      [B('RightLeg')]: [15 * DEG, 0, 0],
    },
  }),
  pistol_squat: pose({
    bones: {
      [B('Spine')]: [10 * DEG, 0, 0],
      [B('LeftArm')]: [0, 0, 80 * DEG],
      [B('RightArm')]: [-30 * DEG, 0, -60 * DEG],
      [B('LeftUpLeg')]: [25 * DEG, 0, 0],
      [B('RightUpLeg')]: [-20 * DEG, 0, 0],
      [B('LeftLeg')]: [20 * DEG, 0, 0],
      [B('RightLeg')]: [10 * DEG, 0, 0],
    },
  }),
  split_squat: pose({
    rootY: -0.05,
    bones: {
      [B('LeftUpLeg')]: [30 * DEG, 0, 0],
      [B('RightUpLeg')]: [-25 * DEG, 0, 0],
      [B('LeftLeg')]: [25 * DEG, 0, 0],
      [B('RightLeg')]: [15 * DEG, 0, 0],
    },
  }),
  bridge: pose({
    rootRot: [-15 * DEG, 0, 0],
    rootY: -0.35,
    bones: {
      [B('Spine')]: [-20 * DEG, 0, 0],
      [B('LeftUpLeg')]: [55 * DEG, 0, 0],
      [B('RightUpLeg')]: [55 * DEG, 0, 0],
      [B('LeftLeg')]: [70 * DEG, 0, 0],
      [B('RightLeg')]: [70 * DEG, 0, 0],
    },
  }),
  dip: pose({
    rootY: 0.1,
    bones: {
      [B('LeftArm')]: [-30 * DEG, 0, 95 * DEG],
      [B('RightArm')]: [-30 * DEG, 0, -95 * DEG],
      [B('LeftForeArm')]: [-40 * DEG, 0, 0],
      [B('RightForeArm')]: [-40 * DEG, 0, 0],
      [B('LeftUpLeg')]: [15 * DEG, 0, 8 * DEG],
      [B('RightUpLeg')]: [15 * DEG, 0, -8 * DEG],
    },
  }),
  muscle_up: pose({
    rootY: 0.15,
    bones: {
      [B('LeftArm')]: [-150 * DEG, 15 * DEG, 35 * DEG],
      [B('RightArm')]: [-150 * DEG, -15 * DEG, -35 * DEG],
      [B('LeftForeArm')]: [-50 * DEG, 0, 0],
      [B('RightForeArm')]: [-50 * DEG, 0, 0],
    },
  }),
  plank: pose({
    rootRot: [90 * DEG, 0, 0],
    rootY: 0.05,
    bones: {
      [B('LeftArm')]: [0, 0, 75 * DEG],
      [B('RightArm')]: [0, 0, -75 * DEG],
      [B('LeftForeArm')]: [-85 * DEG, 0, 0],
      [B('RightForeArm')]: [-85 * DEG, 0, 0],
    },
  }),
  knee_raise: pose({
    rootY: 0.2,
    bones: {
      [B('LeftArm')]: [-170 * DEG, 0, 25 * DEG],
      [B('RightArm')]: [-170 * DEG, 0, -25 * DEG],
      [B('LeftUpLeg')]: [25 * DEG, 0, 0],
      [B('RightUpLeg')]: [25 * DEG, 0, 0],
      [B('LeftLeg')]: [40 * DEG, 0, 0],
      [B('RightLeg')]: [40 * DEG, 0, 0],
    },
  }),
  mobility: pose({
    rootY: -0.05,
    bones: {
      [B('Spine')]: [12 * DEG, 10 * DEG, 0],
      [B('LeftArm')]: [-70 * DEG, 0, 60 * DEG],
      [B('RightArm')]: [30 * DEG, 0, -70 * DEG],
      [B('LeftUpLeg')]: [40 * DEG, 0, 10 * DEG],
      [B('RightUpLeg')]: [5 * DEG, 0, -8 * DEG],
      [B('LeftLeg')]: [50 * DEG, 0, 0],
    },
  }),
};

export const CALI_POSE_B: Record<AnimationState, RigPose> = {
  idle: IDLE_POSE,
  rest: REST_POSE,
  push_up: pose({
    rootRot: [90 * DEG, 0, 0],
    rootY: -0.05,
    bones: {
      [B('Spine')]: [8 * DEG, 0, 0],
      [B('LeftArm')]: [15 * DEG, 0, 95 * DEG],
      [B('RightArm')]: [15 * DEG, 0, -95 * DEG],
      [B('LeftForeArm')]: [-95 * DEG, 0, 0],
      [B('RightForeArm')]: [-95 * DEG, 0, 0],
      [B('Head')]: [5 * DEG, 0, 0],
    },
  }),
  pike_press: pose({
    rootRot: [65 * DEG, 0, 0],
    rootY: 0,
    bones: {
      [B('Spine')]: [28 * DEG, 0, 0],
      [B('LeftArm')]: [10 * DEG, 0, 80 * DEG],
      [B('RightArm')]: [10 * DEG, 0, -80 * DEG],
      [B('LeftForeArm')]: [-90 * DEG, 0, 0],
      [B('RightForeArm')]: [-90 * DEG, 0, 0],
      [B('Head')]: [35 * DEG, 0, 0],
    },
  }),
  pull_up: pose({
    rootY: 0.55,
    bones: {
      [B('Spine')]: [8 * DEG, 0, 0],
      [B('LeftArm')]: [-90 * DEG, 35 * DEG, 55 * DEG],
      [B('RightArm')]: [-90 * DEG, -35 * DEG, -55 * DEG],
      [B('LeftForeArm')]: [-120 * DEG, 0, 0],
      [B('RightForeArm')]: [-120 * DEG, 0, 0],
      [B('LeftUpLeg')]: [25 * DEG, 0, 8 * DEG],
      [B('RightUpLeg')]: [25 * DEG, 0, -8 * DEG],
    },
  }),
  hang: pose({
    rootY: 0.35,
    bones: {
      [B('LeftArm')]: [-120 * DEG, 20 * DEG, 45 * DEG],
      [B('RightArm')]: [-120 * DEG, -20 * DEG, -45 * DEG],
      [B('LeftForeArm')]: [-80 * DEG, 0, 0],
      [B('RightForeArm')]: [-80 * DEG, 0, 0],
    },
  }),
  row: pose({
    rootRot: [65 * DEG, 0, 0],
    rootY: 0.25,
    bones: {
      [B('LeftArm')]: [-90 * DEG, 0, 75 * DEG],
      [B('RightArm')]: [-90 * DEG, 0, -75 * DEG],
      [B('LeftForeArm')]: [-100 * DEG, 0, 0],
      [B('RightForeArm')]: [-100 * DEG, 0, 0],
    },
  }),
  squat: pose({
    rootY: -0.35,
    bones: {
      [B('Spine')]: [18 * DEG, 0, 0],
      [B('LeftArm')]: [20 * DEG, 0, 80 * DEG],
      [B('RightArm')]: [20 * DEG, 0, -80 * DEG],
      [B('LeftUpLeg')]: [95 * DEG, 0, 0],
      [B('RightUpLeg')]: [95 * DEG, 0, 0],
      [B('LeftLeg')]: [100 * DEG, 0, 0],
      [B('RightLeg')]: [100 * DEG, 0, 0],
    },
  }),
  pistol_squat: pose({
    rootY: -0.4,
    bones: {
      [B('Spine')]: [22 * DEG, 0, 0],
      [B('LeftArm')]: [25 * DEG, 0, 85 * DEG],
      [B('RightArm')]: [-40 * DEG, 0, -55 * DEG],
      [B('LeftUpLeg')]: [105 * DEG, 0, 0],
      [B('RightUpLeg')]: [-35 * DEG, 0, 0],
      [B('LeftLeg')]: [115 * DEG, 0, 0],
      [B('RightLeg')]: [15 * DEG, 0, 0],
    },
  }),
  split_squat: pose({
    rootY: -0.28,
    bones: {
      [B('LeftUpLeg')]: [95 * DEG, 0, 0],
      [B('RightUpLeg')]: [-35 * DEG, 0, 0],
      [B('LeftLeg')]: [105 * DEG, 0, 0],
      [B('RightLeg')]: [25 * DEG, 0, 0],
    },
  }),
  bridge: pose({
    rootRot: [-35 * DEG, 0, 0],
    rootY: -0.05,
    bones: {
      [B('Spine')]: [-35 * DEG, 0, 0],
      [B('LeftUpLeg')]: [70 * DEG, 0, 0],
      [B('RightUpLeg')]: [70 * DEG, 0, 0],
      [B('LeftLeg')]: [75 * DEG, 0, 0],
      [B('RightLeg')]: [75 * DEG, 0, 0],
    },
  }),
  dip: pose({
    rootY: -0.15,
    bones: {
      [B('Spine')]: [12 * DEG, 0, 0],
      [B('LeftArm')]: [20 * DEG, 0, 105 * DEG],
      [B('RightArm')]: [20 * DEG, 0, -105 * DEG],
      [B('LeftForeArm')]: [-110 * DEG, 0, 0],
      [B('RightForeArm')]: [-110 * DEG, 0, 0],
    },
  }),
  muscle_up: pose({
    rootY: 0.7,
    bones: {
      [B('Spine')]: [-8 * DEG, 0, 0],
      [B('LeftArm')]: [-35 * DEG, 25 * DEG, 70 * DEG],
      [B('RightArm')]: [-35 * DEG, -25 * DEG, -70 * DEG],
      [B('LeftForeArm')]: [-40 * DEG, 0, 0],
      [B('RightForeArm')]: [-40 * DEG, 0, 0],
    },
  }),
  plank: pose({
    rootRot: [90 * DEG, 0, 0],
    rootY: 0.02,
    bones: {
      [B('LeftArm')]: [0, 0, 75 * DEG],
      [B('RightArm')]: [0, 0, -75 * DEG],
      [B('LeftForeArm')]: [-85 * DEG, 0, 0],
      [B('RightForeArm')]: [-85 * DEG, 0, 0],
    },
  }),
  knee_raise: pose({
    rootY: 0.2,
    bones: {
      [B('LeftArm')]: [-170 * DEG, 0, 25 * DEG],
      [B('RightArm')]: [-170 * DEG, 0, -25 * DEG],
      [B('LeftUpLeg')]: [95 * DEG, 0, 5 * DEG],
      [B('RightUpLeg')]: [95 * DEG, 0, -5 * DEG],
      [B('LeftLeg')]: [90 * DEG, 0, 0],
      [B('RightLeg')]: [90 * DEG, 0, 0],
    },
  }),
  mobility: pose({
    rootY: -0.15,
    bones: {
      [B('Spine')]: [28 * DEG, 18 * DEG, 0],
      [B('Spine1')]: [10 * DEG, 8 * DEG, 0],
      [B('LeftArm')]: [-100 * DEG, 0, 70 * DEG],
      [B('RightArm')]: [50 * DEG, 0, -80 * DEG],
      [B('LeftUpLeg')]: [70 * DEG, 0, 15 * DEG],
      [B('LeftLeg')]: [80 * DEG, 0, 0],
    },
  }),
};

export type YogaAsanaFamily =
  | 'standing'
  | 'fold'
  | 'half_fold'
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
  | 'savasana'
  | 'breath';

export const YOGA_POSES: Record<YogaAsanaFamily, RigPose> = {
  standing: IDLE_POSE,
  breath: IDLE_POSE,
  chair: pose({
    rootY: -0.15,
    bones: {
      [B('Spine')]: [8 * DEG, 0, 0],
      [B('LeftArm')]: [-150 * DEG, 0, 40 * DEG],
      [B('RightArm')]: [-150 * DEG, 0, -40 * DEG],
      [B('LeftUpLeg')]: [55 * DEG, 0, 0],
      [B('RightUpLeg')]: [55 * DEG, 0, 0],
      [B('LeftLeg')]: [90 * DEG, 0, 0],
      [B('RightLeg')]: [90 * DEG, 0, 0],
    },
  }),
  fold: pose({
    bones: {
      [B('Spine')]: [45 * DEG, 0, 0],
      [B('Spine1')]: [40 * DEG, 0, 0],
      [B('Spine2')]: [30 * DEG, 0, 0],
      [B('Head')]: [20 * DEG, 0, 0],
      [B('LeftArm')]: [20 * DEG, 0, 50 * DEG],
      [B('RightArm')]: [20 * DEG, 0, -50 * DEG],
    },
  }),
  half_fold: pose({
    bones: {
      [B('Spine')]: [30 * DEG, 0, 0],
      [B('Spine1')]: [25 * DEG, 0, 0],
      [B('LeftArm')]: [-90 * DEG, 0, 40 * DEG],
      [B('RightArm')]: [-90 * DEG, 0, -40 * DEG],
    },
  }),
  warrior: pose({
    rootRot: [0, -15 * DEG, 0],
    rootY: -0.08,
    bones: {
      [B('LeftArm')]: [-170 * DEG, 0, 25 * DEG],
      [B('RightArm')]: [-170 * DEG, 0, -25 * DEG],
      [B('LeftUpLeg')]: [70 * DEG, 0, 0],
      [B('RightUpLeg')]: [-15 * DEG, 0, 0],
      [B('LeftLeg')]: [90 * DEG, 0, 0],
      [B('Head')]: [0, 10 * DEG, 0],
    },
  }),
  triangle: pose({
    bones: {
      [B('Spine')]: [0, 0, 35 * DEG],
      [B('Spine1')]: [0, 0, 25 * DEG],
      [B('LeftArm')]: [0, 0, 100 * DEG],
      [B('RightArm')]: [0, 0, -100 * DEG],
      [B('LeftUpLeg')]: [0, 0, 20 * DEG],
      [B('RightUpLeg')]: [0, 0, -20 * DEG],
      [B('Head')]: [0, 0, -15 * DEG],
    },
  }),
  tree: pose({
    bones: {
      [B('LeftArm')]: [-160 * DEG, 0, 35 * DEG],
      [B('RightArm')]: [-160 * DEG, 0, -35 * DEG],
      [B('LeftForeArm')]: [-40 * DEG, 0, 0],
      [B('RightForeArm')]: [-40 * DEG, 0, 0],
      [B('RightUpLeg')]: [45 * DEG, 0, 55 * DEG],
      [B('RightLeg')]: [100 * DEG, 0, 0],
    },
  }),
  down_dog: pose({
    rootRot: [58 * DEG, 0, 0],
    rootY: 0,
    bones: {
      // Inverted V: hips high, long spine, arms reaching, heels reaching back
      [B('Hips')]: [8 * DEG, 0, 0],
      [B('Spine')]: [18 * DEG, 0, 0],
      [B('Spine1')]: [12 * DEG, 0, 0],
      [B('Spine2')]: [8 * DEG, 0, 0],
      [B('Neck')]: [15 * DEG, 0, 0],
      [B('Head')]: [20 * DEG, 0, 0],
      // Shoulders externally rotated / away from ears
      [B('LeftShoulder')]: [12 * DEG, 0, 10 * DEG],
      [B('RightShoulder')]: [12 * DEG, 0, -10 * DEG],
      [B('LeftArm')]: [-40 * DEG, 15 * DEG, 55 * DEG],
      [B('RightArm')]: [-40 * DEG, -15 * DEG, -55 * DEG],
      [B('LeftForeArm')]: [-8 * DEG, 0, 0],
      [B('RightForeArm')]: [-8 * DEG, 0, 0],
      [B('LeftHand')]: [0, 0, 0],
      [B('RightHand')]: [0, 0, 0],
      [B('LeftUpLeg')]: [-35 * DEG, 0, 4 * DEG],
      [B('RightUpLeg')]: [-35 * DEG, 0, -4 * DEG],
      [B('LeftLeg')]: [8 * DEG, 0, 0],
      [B('RightLeg')]: [8 * DEG, 0, 0],
      // Heels reaching toward mat (pedal overlay animates further)
      [B('LeftFoot')]: [25 * DEG, 0, 0],
      [B('RightFoot')]: [25 * DEG, 0, 0],
    },
  }),
  plank: CALI_POSE_A.plank,
  chaturanga: CALI_POSE_B.push_up,
  up_dog: pose({
    rootRot: [-20 * DEG, 0, 0],
    rootY: -0.15,
    bones: {
      [B('Spine')]: [-25 * DEG, 0, 0],
      [B('Spine1')]: [-15 * DEG, 0, 0],
      [B('LeftArm')]: [-60 * DEG, 0, 50 * DEG],
      [B('RightArm')]: [-60 * DEG, 0, -50 * DEG],
      [B('LeftForeArm')]: [-30 * DEG, 0, 0],
      [B('RightForeArm')]: [-30 * DEG, 0, 0],
      [B('Head')]: [-12 * DEG, 0, 0],
    },
  }),
  cobra: pose({
    rootY: -0.35,
    bones: {
      [B('Spine')]: [-30 * DEG, 0, 0],
      [B('Spine1')]: [-20 * DEG, 0, 0],
      [B('LeftArm')]: [-35 * DEG, 0, 60 * DEG],
      [B('RightArm')]: [-35 * DEG, 0, -60 * DEG],
      [B('LeftForeArm')]: [-70 * DEG, 0, 0],
      [B('RightForeArm')]: [-70 * DEG, 0, 0],
    },
  }),
  child: pose({
    rootY: -0.4,
    bones: {
      [B('Spine')]: [40 * DEG, 0, 0],
      [B('Spine1')]: [30 * DEG, 0, 0],
      [B('Head')]: [35 * DEG, 0, 0],
      [B('LeftArm')]: [40 * DEG, 0, 70 * DEG],
      [B('RightArm')]: [40 * DEG, 0, -70 * DEG],
      [B('LeftUpLeg')]: [110 * DEG, 0, 12 * DEG],
      [B('RightUpLeg')]: [110 * DEG, 0, -12 * DEG],
      [B('LeftLeg')]: [120 * DEG, 0, 0],
      [B('RightLeg')]: [120 * DEG, 0, 0],
    },
  }),
  seated_fold: pose({
    rootY: -0.5,
    bones: {
      [B('Spine')]: [45 * DEG, 0, 0],
      [B('Spine1')]: [30 * DEG, 0, 0],
      [B('LeftUpLeg')]: [85 * DEG, 0, 0],
      [B('RightUpLeg')]: [85 * DEG, 0, 0],
      [B('LeftLeg')]: [10 * DEG, 0, 0],
      [B('RightLeg')]: [10 * DEG, 0, 0],
    },
  }),
  butterfly: pose({
    rootY: -0.5,
    bones: {
      [B('Spine')]: [12 * DEG, 0, 0],
      [B('LeftUpLeg')]: [70 * DEG, 0, 50 * DEG],
      [B('RightUpLeg')]: [70 * DEG, 0, -50 * DEG],
      [B('LeftLeg')]: [100 * DEG, 0, 0],
      [B('RightLeg')]: [100 * DEG, 0, 0],
    },
  }),
  twist: pose({
    rootY: -0.5,
    bones: {
      [B('Spine')]: [8 * DEG, 35 * DEG, 0],
      [B('Spine1')]: [5 * DEG, 25 * DEG, 0],
      [B('Head')]: [0, 20 * DEG, 0],
      [B('LeftUpLeg')]: [85 * DEG, 0, 8 * DEG],
      [B('RightUpLeg')]: [85 * DEG, 0, -8 * DEG],
    },
  }),
  lunge: pose({
    rootY: -0.15,
    bones: {
      [B('LeftArm')]: [-160 * DEG, 0, 30 * DEG],
      [B('RightArm')]: [-160 * DEG, 0, -30 * DEG],
      [B('LeftUpLeg')]: [75 * DEG, 0, 0],
      [B('RightUpLeg')]: [-15 * DEG, 0, 0],
      [B('LeftLeg')]: [95 * DEG, 0, 0],
    },
  }),
  legs_up: pose({
    rootRot: [-90 * DEG, 0, 0],
    rootY: -0.65,
    bones: {
      [B('LeftArm')]: [0, 0, 80 * DEG],
      [B('RightArm')]: [0, 0, -80 * DEG],
      [B('LeftUpLeg')]: [-90 * DEG, 0, 5 * DEG],
      [B('RightUpLeg')]: [-90 * DEG, 0, -5 * DEG],
    },
  }),
  savasana: pose({
    rootRot: [-90 * DEG, 0, 0],
    rootY: -0.7,
    bones: {
      [B('LeftArm')]: [0, 0, 90 * DEG],
      [B('RightArm')]: [0, 0, -90 * DEG],
      [B('LeftUpLeg')]: [0, 0, 10 * DEG],
      [B('RightUpLeg')]: [0, 0, -10 * DEG],
    },
  }),
};

export function familyFromYogaAsset(id: string): YogaAsanaFamily {
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

export function blendRigPose(a: RigPose, b: RigPose, t: number): RigPose {
  const ease = t * t * (3 - 2 * t);
  const bones: BoneEulers = {};
  const keys = new Set([...Object.keys(a.bones), ...Object.keys(b.bones)]);
  for (const k of keys) {
    const ae = a.bones[k] ?? [0, 0, 0];
    const be = b.bones[k] ?? [0, 0, 0];
    bones[k] = [
      THREE.MathUtils.lerp(ae[0], be[0], ease),
      THREE.MathUtils.lerp(ae[1], be[1], ease),
      THREE.MathUtils.lerp(ae[2], be[2], ease),
    ];
  }
  return {
    rootY: THREE.MathUtils.lerp(a.rootY, b.rootY, ease),
    rootRot: [
      THREE.MathUtils.lerp(a.rootRot[0], b.rootRot[0], ease),
      THREE.MathUtils.lerp(a.rootRot[1], b.rootRot[1], ease),
      THREE.MathUtils.lerp(a.rootRot[2], b.rootRot[2], ease),
    ],
    bones,
  };
}

/** Build a short skeletal clip between two poses for AnimationMixer crossfades. */
export function buildPoseClip(name: string, from: RigPose, to: RigPose, duration = 1): THREE.AnimationClip {
  const tracks: THREE.KeyframeTrack[] = [];
  const boneNames = new Set([...Object.keys(from.bones), ...Object.keys(to.bones)]);
  const e0 = new THREE.Euler();
  const e1 = new THREE.Euler();
  const q0 = new THREE.Quaternion();
  const q1 = new THREE.Quaternion();

  for (const bone of boneNames) {
    const a = from.bones[bone] ?? [0, 0, 0];
    const b = to.bones[bone] ?? [0, 0, 0];
    e0.set(a[0], a[1], a[2], 'XYZ');
    e1.set(b[0], b[1], b[2], 'XYZ');
    q0.setFromEuler(e0);
    q1.setFromEuler(e1);
    tracks.push(
      new THREE.QuaternionKeyframeTrack(
        `${bone}.quaternion`,
        [0, duration],
        [q0.x, q0.y, q0.z, q0.w, q1.x, q1.y, q1.z, q1.w]
      )
    );
  }

  tracks.push(
    // Keep clip root on the floor — vertical grounding is handled by <Center bottom> + BB snap
    new THREE.NumberKeyframeTrack('.position[y]', [0, duration], [0, 0])
  );

  return new THREE.AnimationClip(name, duration, tracks);
}
