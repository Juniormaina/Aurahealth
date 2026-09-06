import fs from 'node:fs';
import path from 'node:path';
import { bone, toRad } from './math.js';

function pose(partial) {
  return {
    rootRot: toRad(partial.rootRot ?? [0, 0, 0]),
    rootY: partial.rootY ?? 0,
    bones: Object.fromEntries(
      Object.entries({ ...IDLE_DEG, ...(partial.bones ?? {}) }).map(([k, v]) => [k, toRad(v)])
    ),
  };
}

const IDLE_DEG = {
  [bone('Hips')]: [0, 0, 0],
  [bone('Spine')]: [0, 0, 0],
  [bone('Spine1')]: [0, 0, 0],
  [bone('Spine2')]: [0, 0, 0],
  [bone('Neck')]: [0, 0, 0],
  [bone('Head')]: [0, 0, 0],
  [bone('LeftShoulder')]: [0, 0, 0],
  [bone('RightShoulder')]: [0, 0, 0],
  [bone('LeftArm')]: [0, 0, 70],
  [bone('RightArm')]: [0, 0, -70],
  [bone('LeftForeArm')]: [0, 0, 0],
  [bone('RightForeArm')]: [0, 0, 0],
  [bone('LeftHand')]: [0, 0, 0],
  [bone('RightHand')]: [0, 0, 0],
  [bone('LeftUpLeg')]: [0, 0, 0],
  [bone('RightUpLeg')]: [0, 0, 0],
  [bone('LeftLeg')]: [0, 0, 0],
  [bone('RightLeg')]: [0, 0, 0],
  [bone('LeftFoot')]: [0, 0, 0],
  [bone('RightFoot')]: [0, 0, 0],
};

export const IDLE_POSE = pose({});
export const REST_POSE = pose({
  rootRot: [0, 12, 0],
  bones: {
    [bone('LeftArm')]: [15, 0, 75],
    [bone('RightArm')]: [-10, 0, -80],
    [bone('LeftForeArm')]: [0, 0, 25],
    [bone('RightForeArm')]: [0, 0, -35],
    [bone('Head')]: [0, 8, 0],
  },
});

export const CALI_A = {
  idle: IDLE_POSE,
  rest: REST_POSE,
  push_up: pose({
    rootRot: [90, 0, 0],
    rootY: 0.15,
    bones: {
      [bone('Spine')]: [5, 0, 0],
      [bone('LeftArm')]: [0, 0, 80],
      [bone('RightArm')]: [0, 0, -80],
      [bone('LeftForeArm')]: [0, 0, 10],
      [bone('RightForeArm')]: [0, 0, -10],
      [bone('Head')]: [-5, 0, 0],
    },
  }),
  pike_press: pose({
    rootRot: [55, 0, 0],
    rootY: 0.05,
    bones: {
      [bone('Spine')]: [20, 0, 0],
      [bone('Spine1')]: [10, 0, 0],
      [bone('LeftArm')]: [-20, 0, 70],
      [bone('RightArm')]: [-20, 0, -70],
      [bone('LeftForeArm')]: [0, 0, 15],
      [bone('RightForeArm')]: [0, 0, -15],
      [bone('LeftUpLeg')]: [-25, 0, 0],
      [bone('RightUpLeg')]: [-25, 0, 0],
      [bone('Head')]: [25, 0, 0],
    },
  }),
  pull_up: pose({
    rootY: 0.2,
    bones: {
      [bone('LeftArm')]: [-160, 20, 40],
      [bone('RightArm')]: [-160, -20, -40],
      [bone('LeftForeArm')]: [-20, 0, 0],
      [bone('RightForeArm')]: [-20, 0, 0],
      [bone('LeftUpLeg')]: [8, 0, 5],
      [bone('RightUpLeg')]: [8, 0, -5],
    },
  }),
  hang: pose({
    rootY: 0.25,
    bones: {
      [bone('LeftArm')]: [-170, 10, 30],
      [bone('RightArm')]: [-170, -10, -30],
    },
  }),
  row: pose({
    rootRot: [70, 0, 0],
    rootY: 0.1,
    bones: {
      [bone('LeftArm')]: [-40, 0, 70],
      [bone('RightArm')]: [-40, 0, -70],
      [bone('LeftForeArm')]: [-30, 0, 0],
      [bone('RightForeArm')]: [-30, 0, 0],
    },
  }),
  squat: pose({
    bones: {
      [bone('Spine')]: [8, 0, 0],
      [bone('LeftArm')]: [0, 0, 75],
      [bone('RightArm')]: [0, 0, -75],
      [bone('LeftUpLeg')]: [20, 0, 0],
      [bone('RightUpLeg')]: [20, 0, 0],
      [bone('LeftLeg')]: [15, 0, 0],
      [bone('RightLeg')]: [15, 0, 0],
    },
  }),
  pistol_squat: pose({
    bones: {
      [bone('Spine')]: [10, 0, 0],
      [bone('LeftArm')]: [0, 0, 80],
      [bone('RightArm')]: [-30, 0, -60],
      [bone('LeftUpLeg')]: [25, 0, 0],
      [bone('RightUpLeg')]: [-20, 0, 0],
      [bone('LeftLeg')]: [20, 0, 0],
      [bone('RightLeg')]: [10, 0, 0],
    },
  }),
  split_squat: pose({
    rootY: -0.05,
    bones: {
      [bone('LeftUpLeg')]: [30, 0, 0],
      [bone('RightUpLeg')]: [-25, 0, 0],
      [bone('LeftLeg')]: [25, 0, 0],
      [bone('RightLeg')]: [15, 0, 0],
    },
  }),
  bridge: pose({
    rootRot: [-15, 0, 0],
    rootY: -0.35,
    bones: {
      [bone('Spine')]: [-20, 0, 0],
      [bone('LeftUpLeg')]: [55, 0, 0],
      [bone('RightUpLeg')]: [55, 0, 0],
      [bone('LeftLeg')]: [70, 0, 0],
      [bone('RightLeg')]: [70, 0, 0],
    },
  }),
  dip: pose({
    rootY: 0.1,
    bones: {
      [bone('LeftArm')]: [-30, 0, 95],
      [bone('RightArm')]: [-30, 0, -95],
      [bone('LeftForeArm')]: [-40, 0, 0],
      [bone('RightForeArm')]: [-40, 0, 0],
      [bone('LeftUpLeg')]: [15, 0, 8],
      [bone('RightUpLeg')]: [15, 0, -8],
    },
  }),
  muscle_up: pose({
    rootY: 0.15,
    bones: {
      [bone('LeftArm')]: [-150, 15, 35],
      [bone('RightArm')]: [-150, -15, -35],
      [bone('LeftForeArm')]: [-50, 0, 0],
      [bone('RightForeArm')]: [-50, 0, 0],
    },
  }),
  plank: pose({
    rootRot: [90, 0, 0],
    rootY: 0.05,
    bones: {
      [bone('LeftArm')]: [0, 0, 75],
      [bone('RightArm')]: [0, 0, -75],
      [bone('LeftForeArm')]: [-85, 0, 0],
      [bone('RightForeArm')]: [-85, 0, 0],
    },
  }),
  knee_raise: pose({
    rootY: 0.2,
    bones: {
      [bone('LeftArm')]: [-170, 0, 25],
      [bone('RightArm')]: [-170, 0, -25],
      [bone('LeftUpLeg')]: [25, 0, 0],
      [bone('RightUpLeg')]: [25, 0, 0],
      [bone('LeftLeg')]: [40, 0, 0],
      [bone('RightLeg')]: [40, 0, 0],
    },
  }),
  mobility: pose({
    rootY: -0.05,
    bones: {
      [bone('Spine')]: [12, 10, 0],
      [bone('LeftArm')]: [-70, 0, 60],
      [bone('RightArm')]: [30, 0, -70],
      [bone('LeftUpLeg')]: [40, 0, 10],
      [bone('RightUpLeg')]: [5, 0, -8],
      [bone('LeftLeg')]: [50, 0, 0],
    },
  }),
};

export const CALI_B = {
  idle: IDLE_POSE,
  rest: REST_POSE,
  push_up: pose({
    rootRot: [90, 0, 0],
    rootY: -0.05,
    bones: {
      [bone('Spine')]: [8, 0, 0],
      [bone('LeftArm')]: [15, 0, 95],
      [bone('RightArm')]: [15, 0, -95],
      [bone('LeftForeArm')]: [-95, 0, 0],
      [bone('RightForeArm')]: [-95, 0, 0],
      [bone('Head')]: [5, 0, 0],
    },
  }),
  pike_press: pose({
    rootRot: [65, 0, 0],
    bones: {
      [bone('Spine')]: [28, 0, 0],
      [bone('LeftArm')]: [10, 0, 80],
      [bone('RightArm')]: [10, 0, -80],
      [bone('LeftForeArm')]: [-90, 0, 0],
      [bone('RightForeArm')]: [-90, 0, 0],
      [bone('Head')]: [35, 0, 0],
    },
  }),
  pull_up: pose({
    rootY: 0.55,
    bones: {
      [bone('Spine')]: [8, 0, 0],
      [bone('LeftArm')]: [-90, 35, 55],
      [bone('RightArm')]: [-90, -35, -55],
      [bone('LeftForeArm')]: [-120, 0, 0],
      [bone('RightForeArm')]: [-120, 0, 0],
      [bone('LeftUpLeg')]: [25, 0, 8],
      [bone('RightUpLeg')]: [25, 0, -8],
    },
  }),
  hang: pose({
    rootY: 0.35,
    bones: {
      [bone('LeftArm')]: [-120, 20, 45],
      [bone('RightArm')]: [-120, -20, -45],
      [bone('LeftForeArm')]: [-80, 0, 0],
      [bone('RightForeArm')]: [-80, 0, 0],
    },
  }),
  row: pose({
    rootRot: [65, 0, 0],
    rootY: 0.25,
    bones: {
      [bone('LeftArm')]: [-90, 0, 75],
      [bone('RightArm')]: [-90, 0, -75],
      [bone('LeftForeArm')]: [-100, 0, 0],
      [bone('RightForeArm')]: [-100, 0, 0],
    },
  }),
  squat: pose({
    rootY: -0.35,
    bones: {
      [bone('Spine')]: [18, 0, 0],
      [bone('LeftArm')]: [20, 0, 80],
      [bone('RightArm')]: [20, 0, -80],
      [bone('LeftUpLeg')]: [95, 0, 0],
      [bone('RightUpLeg')]: [95, 0, 0],
      [bone('LeftLeg')]: [100, 0, 0],
      [bone('RightLeg')]: [100, 0, 0],
    },
  }),
  pistol_squat: pose({
    rootY: -0.4,
    bones: {
      [bone('Spine')]: [22, 0, 0],
      [bone('LeftArm')]: [25, 0, 85],
      [bone('RightArm')]: [-40, 0, -55],
      [bone('LeftUpLeg')]: [105, 0, 0],
      [bone('RightUpLeg')]: [-35, 0, 0],
      [bone('LeftLeg')]: [115, 0, 0],
      [bone('RightLeg')]: [15, 0, 0],
    },
  }),
  split_squat: pose({
    rootY: -0.28,
    bones: {
      [bone('LeftUpLeg')]: [95, 0, 0],
      [bone('RightUpLeg')]: [-35, 0, 0],
      [bone('LeftLeg')]: [105, 0, 0],
      [bone('RightLeg')]: [25, 0, 0],
    },
  }),
  bridge: pose({
    rootRot: [-35, 0, 0],
    rootY: -0.05,
    bones: {
      [bone('Spine')]: [-35, 0, 0],
      [bone('LeftUpLeg')]: [70, 0, 0],
      [bone('RightUpLeg')]: [70, 0, 0],
      [bone('LeftLeg')]: [75, 0, 0],
      [bone('RightLeg')]: [75, 0, 0],
    },
  }),
  dip: pose({
    rootY: -0.15,
    bones: {
      [bone('Spine')]: [12, 0, 0],
      [bone('LeftArm')]: [20, 0, 105],
      [bone('RightArm')]: [20, 0, -105],
      [bone('LeftForeArm')]: [-110, 0, 0],
      [bone('RightForeArm')]: [-110, 0, 0],
    },
  }),
  muscle_up: pose({
    rootY: 0.7,
    bones: {
      [bone('Spine')]: [-8, 0, 0],
      [bone('LeftArm')]: [-35, 25, 70],
      [bone('RightArm')]: [-35, -25, -70],
      [bone('LeftForeArm')]: [-40, 0, 0],
      [bone('RightForeArm')]: [-40, 0, 0],
    },
  }),
  plank: CALI_A.plank,
  knee_raise: pose({
    rootY: 0.2,
    bones: {
      [bone('LeftArm')]: [-170, 0, 25],
      [bone('RightArm')]: [-170, 0, -25],
      [bone('LeftUpLeg')]: [95, 0, 5],
      [bone('RightUpLeg')]: [95, 0, -5],
      [bone('LeftLeg')]: [90, 0, 0],
      [bone('RightLeg')]: [90, 0, 0],
    },
  }),
  mobility: pose({
    rootY: -0.15,
    bones: {
      [bone('Spine')]: [28, 18, 0],
      [bone('Spine1')]: [10, 8, 0],
      [bone('LeftArm')]: [-100, 0, 70],
      [bone('RightArm')]: [50, 0, -80],
      [bone('LeftUpLeg')]: [70, 0, 15],
      [bone('LeftLeg')]: [80, 0, 0],
    },
  }),
};

export const YOGA = {
  standing: IDLE_POSE,
  breath: IDLE_POSE,
  chair: pose({
    rootY: -0.15,
    bones: {
      [bone('Spine')]: [8, 0, 0],
      [bone('LeftArm')]: [-150, 0, 40],
      [bone('RightArm')]: [-150, 0, -40],
      [bone('LeftUpLeg')]: [55, 0, 0],
      [bone('RightUpLeg')]: [55, 0, 0],
      [bone('LeftLeg')]: [90, 0, 0],
      [bone('RightLeg')]: [90, 0, 0],
    },
  }),
  fold: pose({
    bones: {
      [bone('Spine')]: [45, 0, 0],
      [bone('Spine1')]: [40, 0, 0],
      [bone('Spine2')]: [30, 0, 0],
      [bone('Head')]: [20, 0, 0],
      [bone('LeftArm')]: [20, 0, 50],
      [bone('RightArm')]: [20, 0, -50],
    },
  }),
  half_fold: pose({
    bones: {
      [bone('Spine')]: [30, 0, 0],
      [bone('Spine1')]: [25, 0, 0],
      [bone('LeftArm')]: [-90, 0, 40],
      [bone('RightArm')]: [-90, 0, -40],
    },
  }),
  warrior: pose({
    rootRot: [0, -15, 0],
    rootY: -0.08,
    bones: {
      [bone('LeftArm')]: [-170, 0, 25],
      [bone('RightArm')]: [-170, 0, -25],
      [bone('LeftUpLeg')]: [70, 0, 0],
      [bone('RightUpLeg')]: [-15, 0, 0],
      [bone('LeftLeg')]: [90, 0, 0],
      [bone('Head')]: [0, 10, 0],
    },
  }),
  triangle: pose({
    bones: {
      [bone('Spine')]: [0, 0, 35],
      [bone('Spine1')]: [0, 0, 25],
      [bone('LeftArm')]: [0, 0, 100],
      [bone('RightArm')]: [0, 0, -100],
      [bone('LeftUpLeg')]: [0, 0, 20],
      [bone('RightUpLeg')]: [0, 0, -20],
      [bone('Head')]: [0, 0, -15],
    },
  }),
  tree: pose({
    bones: {
      [bone('LeftArm')]: [-160, 0, 35],
      [bone('RightArm')]: [-160, 0, -35],
      [bone('LeftForeArm')]: [-40, 0, 0],
      [bone('RightForeArm')]: [-40, 0, 0],
      [bone('RightUpLeg')]: [45, 0, 55],
      [bone('RightLeg')]: [100, 0, 0],
    },
  }),
  down_dog: pose({
    rootRot: [58, 0, 0],
    bones: {
      [bone('Hips')]: [8, 0, 0],
      [bone('Spine')]: [18, 0, 0],
      [bone('Spine1')]: [12, 0, 0],
      [bone('Spine2')]: [8, 0, 0],
      [bone('Neck')]: [15, 0, 0],
      [bone('Head')]: [20, 0, 0],
      [bone('LeftShoulder')]: [12, 0, 10],
      [bone('RightShoulder')]: [12, 0, -10],
      [bone('LeftArm')]: [-40, 15, 55],
      [bone('RightArm')]: [-40, -15, -55],
      [bone('LeftForeArm')]: [-8, 0, 0],
      [bone('RightForeArm')]: [-8, 0, 0],
      [bone('LeftUpLeg')]: [-35, 0, 4],
      [bone('RightUpLeg')]: [-35, 0, -4],
      [bone('LeftLeg')]: [8, 0, 0],
      [bone('RightLeg')]: [8, 0, 0],
      [bone('LeftFoot')]: [25, 0, 0],
      [bone('RightFoot')]: [25, 0, 0],
    },
  }),
  plank: CALI_A.plank,
  chaturanga: CALI_B.push_up,
  up_dog: pose({
    rootRot: [-20, 0, 0],
    rootY: -0.15,
    bones: {
      [bone('Spine')]: [-25, 0, 0],
      [bone('Spine1')]: [-15, 0, 0],
      [bone('LeftArm')]: [-60, 0, 50],
      [bone('RightArm')]: [-60, 0, -50],
      [bone('LeftForeArm')]: [-30, 0, 0],
      [bone('RightForeArm')]: [-30, 0, 0],
      [bone('Head')]: [-12, 0, 0],
    },
  }),
  cobra: pose({
    rootY: -0.35,
    bones: {
      [bone('Spine')]: [-30, 0, 0],
      [bone('Spine1')]: [-20, 0, 0],
      [bone('LeftArm')]: [-35, 0, 60],
      [bone('RightArm')]: [-35, 0, -60],
      [bone('LeftForeArm')]: [-70, 0, 0],
      [bone('RightForeArm')]: [-70, 0, 0],
    },
  }),
  child: pose({
    rootY: -0.4,
    bones: {
      [bone('Spine')]: [40, 0, 0],
      [bone('Spine1')]: [30, 0, 0],
      [bone('Head')]: [35, 0, 0],
      [bone('LeftArm')]: [40, 0, 70],
      [bone('RightArm')]: [40, 0, -70],
      [bone('LeftUpLeg')]: [110, 0, 12],
      [bone('RightUpLeg')]: [110, 0, -12],
      [bone('LeftLeg')]: [120, 0, 0],
      [bone('RightLeg')]: [120, 0, 0],
    },
  }),
  seated_fold: pose({
    rootY: -0.5,
    bones: {
      [bone('Spine')]: [45, 0, 0],
      [bone('Spine1')]: [30, 0, 0],
      [bone('LeftUpLeg')]: [85, 0, 0],
      [bone('RightUpLeg')]: [85, 0, 0],
      [bone('LeftLeg')]: [10, 0, 0],
      [bone('RightLeg')]: [10, 0, 0],
    },
  }),
  butterfly: pose({
    rootY: -0.5,
    bones: {
      [bone('Spine')]: [12, 0, 0],
      [bone('LeftUpLeg')]: [70, 0, 50],
      [bone('RightUpLeg')]: [70, 0, -50],
      [bone('LeftLeg')]: [100, 0, 0],
      [bone('RightLeg')]: [100, 0, 0],
    },
  }),
  twist: pose({
    rootY: -0.5,
    bones: {
      [bone('Spine')]: [8, 35, 0],
      [bone('Spine1')]: [5, 25, 0],
      [bone('Head')]: [0, 20, 0],
      [bone('LeftUpLeg')]: [85, 0, 8],
      [bone('RightUpLeg')]: [85, 0, -8],
    },
  }),
  lunge: pose({
    rootY: -0.15,
    bones: {
      [bone('LeftArm')]: [-160, 0, 30],
      [bone('RightArm')]: [-160, 0, -30],
      [bone('LeftUpLeg')]: [75, 0, 0],
      [bone('RightUpLeg')]: [-15, 0, 0],
      [bone('LeftLeg')]: [95, 0, 0],
    },
  }),
  legs_up: pose({
    rootRot: [-90, 0, 0],
    rootY: -0.65,
    bones: {
      [bone('LeftArm')]: [0, 0, 80],
      [bone('RightArm')]: [0, 0, -80],
      [bone('LeftUpLeg')]: [-90, 0, 5],
      [bone('RightUpLeg')]: [-90, 0, -5],
    },
  }),
  savasana: pose({
    rootRot: [-90, 0, 0],
    rootY: -0.7,
    bones: {
      [bone('LeftArm')]: [0, 0, 90],
      [bone('RightArm')]: [0, 0, -90],
      [bone('LeftUpLeg')]: [0, 0, 10],
      [bone('RightUpLeg')]: [0, 0, -10],
    },
  }),
};

const CALI_ALIASES = [
  ['push_up', /push[_\s-]?up|incline push/],
  ['pike_press', /pike|handstand/],
  ['pull_up', /pull[_\s-]?up/],
  ['hang', /hang|lat[_\s-]?pull|dead hang/],
  ['row', /row/],
  ['squat', /(?<!pistol\s)(?<!split\s)squat|air squat/],
  ['pistol_squat', /pistol/],
  ['split_squat', /split squat|bulgarian/],
  ['bridge', /bridge|glute/],
  ['dip', /(?<!chat)dip/],
  ['muscle_up', /muscle[_\s-]?up/],
  ['plank', /plank|phalakasana/],
  ['knee_raise', /knee raise/],
  ['mobility', /mobility/],
  ['rest', /rest/],
];

const YOGA_ALIASES = [
  ['down_dog', /down[_\s-]?dog|adho mukha|downward/],
  ['up_dog', /up[_\s-]?dog|urdhva mukha/],
  ['chaturanga', /chaturanga/],
  ['cobra', /cobra|bhujanga/],
  ['chair', /chair|utkatasana/],
  ['fold', /uttanasana|forward fold|standing fold/],
  ['half_fold', /ardha uttanasana|half fold/],
  ['warrior', /warrior|virabhadrasana/],
  ['triangle', /triangle|trikonasana/],
  ['tree', /tree|vrksasana|vrkshasana/],
  ['child', /child|balasana/],
  ['seated_fold', /seated fold|paschimottanasana/],
  ['butterfly', /butterfly|baddha konasana/],
  ['twist', /twist|matsyendra/],
  ['lunge', /lunge|anjaneyasana/],
  ['legs_up', /legs? up|viparita/],
  ['savasana', /savasana|corpse/],
  ['breath', /breath|pranayama|box breath|nadi|dirgha/],
  ['standing', /mountain|tadasana|standing/],
];

export function familyFromYogaAsset(id) {
  const s = String(id || '').toLowerCase();
  if (s.includes('breath')) return 'breath';
  if (s.includes('uttanasana') && s.includes('ardha')) return 'half_fold';
  if (s.includes('uttanasana')) return 'fold';
  if (s.includes('utkatasana')) return 'chair';
  if (s.includes('warrior')) return 'warrior';
  if (s.includes('trikonasana')) return 'triangle';
  if (s.includes('tree')) return 'tree';
  if (s.includes('down_dog')) return 'down_dog';
  if (s.includes('plank')) return 'plank';
  if (s.includes('chaturanga')) return 'chaturanga';
  if (s.includes('up_dog')) return 'up_dog';
  if (s.includes('cobra')) return 'cobra';
  if (s.includes('child')) return 'child';
  if (s.includes('seated_fold')) return 'seated_fold';
  if (s.includes('butterfly')) return 'butterfly';
  if (s.includes('twist')) return 'twist';
  if (s.includes('lunge')) return 'lunge';
  if (s.includes('legs_up')) return 'legs_up';
  if (s.includes('savasana')) return 'savasana';
  return 'standing';
}

function matchFirst(text, pairs) {
  for (const [id, re] of pairs) {
    if (re.test(text)) return id;
  }
  return null;
}

function pack(mode, id) {
  return {
    mode,
    id,
    poseName: id.replace(/_/g, ' '),
    assetId: mode === 'yoga' ? `yoga_${id}` : id,
  };
}

export function resolveMotionPrompt(prompt, hint) {
  const text = `${prompt ?? ''} ${hint ?? ''}`.toLowerCase();
  const yogaHit = matchFirst(text, YOGA_ALIASES);
  const caliHit = matchFirst(text, CALI_ALIASES);
  const wantsYoga = /yoga|asana|sanskrit|pranayama|breath|vinyasa/.test(text);
  const wantsCali = /calisthen|rep|tempo|eccentric|workout|gym/.test(text);

  if (wantsCali && caliHit) return pack('calisthenics', caliHit);
  if (wantsYoga && yogaHit) return pack('yoga', yogaHit);
  if (caliHit && !yogaHit) return pack('calisthenics', caliHit);
  if (yogaHit) return pack('yoga', yogaHit);
  return pack('calisthenics', 'idle');
}

export function posesForResolved(resolved) {
  if (resolved.mode === 'yoga') {
    const p = YOGA[resolved.id] ?? IDLE_POSE;
    return { poseA: p, poseB: p };
  }
  return {
    poseA: CALI_A[resolved.id] ?? IDLE_POSE,
    poseB: CALI_B[resolved.id] ?? CALI_A[resolved.id] ?? IDLE_POSE,
  };
}

export function workspaceRoot() {
  return process.env.WORKSPACE_ROOT || process.cwd();
}

export function scanWorkspaceCatalog(root = workspaceRoot()) {
  const files = [
    ['yoga', path.join(root, 'src', 'content', 'yogaFlows.ts')],
    ['calisthenics', path.join(root, 'src', 'content', 'calisthenicsExercises3D.ts')],
  ];
  const entries = [];
  for (const [kind, file] of files) {
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    const poseIds = [...src.matchAll(/pose_id:\s*'([^']+)'/g)].map((m) => m[1]);
    const assets = [...src.matchAll(/animation_asset_id:\s*'([^']+)'/g)].map((m) => m[1]);
    const states = [...src.matchAll(/animationState:\s*'([^']+)'/g)].map((m) => m[1]);
    const names = [...src.matchAll(/displayName:\s*'([^']+)'/g)].map((m) => m[1]);
    entries.push({
      kind,
      file,
      poseIds: [...new Set(poseIds)],
      animationAssetIds: [...new Set(assets)],
      animationStates: [...new Set(states)],
      displayNames: [...new Set(names)],
    });
  }
  return {
    root,
    scanned: entries,
    localYogaFamilies: Object.keys(YOGA),
    localCaliStates: Object.keys(CALI_A),
  };
}
