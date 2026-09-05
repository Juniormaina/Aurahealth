/** Procedural overlays that mirror on-screen biomechanical text cues. */

export type TrainerId = 'aura' | 'aurora';

export const TRAINER_MODELS: Record<
  TrainerId,
  { id: TrainerId; label: string; url: string; outfit: 'gym' | 'yoga' }
> = {
  aura: {
    id: 'aura',
    label: 'Aura',
    url: '/models/male_trainer.glb',
    outfit: 'gym',
  },
  aurora: {
    id: 'aurora',
    label: 'Aurora',
    url: '/models/female_trainer.glb',
    outfit: 'yoga',
  },
};

const STORAGE_KEY = 'aura.trainerId';

export function loadTrainerId(): TrainerId {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'aura' || v === 'aurora') return v;
    // Migrate legacy male/female keys
    if (v === 'male') return 'aura';
    if (v === 'female') return 'aurora';
  } catch {
    /* ignore */
  }
  return 'aurora';
}

export function saveTrainerId(id: TrainerId) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export interface CueMotionFlags {
  /** Pedal heels alternately (Down Dog / calf lengthening). */
  heelPedal: boolean;
  /** Depress shoulders away from ears. */
  shoulderDrop: boolean;
  /** Fold chest toward thighs (posterior chain). */
  chestToThighs: boolean;
  /** Soft knee bend / micro-bend. */
  softKnees: boolean;
  /** Ribs down / core brace. */
  ribsDown: boolean;
  /** Reach arms long overhead or forward. */
  longArms: boolean;
  /** Open through the heart / gentle backbend. */
  heartOpen: boolean;
  /** Ground through all four corners of the feet. */
  groundFeet: boolean;
}

const EMPTY: CueMotionFlags = {
  heelPedal: false,
  shoulderDrop: false,
  chestToThighs: false,
  softKnees: false,
  ribsDown: false,
  longArms: false,
  heartOpen: false,
  groundFeet: false,
};

/** Map instructional copy → procedural animation flags. */
export function parseCueMotion(cue?: string, poseName?: string, assetId?: string): CueMotionFlags {
  const text = `${cue ?? ''} ${poseName ?? ''} ${assetId ?? ''}`.toLowerCase();
  if (!text.trim()) return { ...EMPTY };

  return {
    heelPedal: /pedal|heel|downward|down.?dog|calf/.test(text),
    shoulderDrop: /shoulder|away from ear|broad|scapula|down.?dog|plank|push/.test(text),
    chestToThighs: /chest toward thigh|fold|uttanasana|down.?dog|press chest/.test(text),
    softKnees: /soft(en)? kne|micro.?bend|pedal|chair|utkatasana/.test(text),
    ribsDown: /rib|core|plank|mountain|tadasana|brace|hollow/.test(text),
    longArms: /reach|overhead|warrior|arms? (long|high)|extend/.test(text),
    heartOpen: /heart|cobra|up.?dog|open chest|backbend/.test(text),
    groundFeet: /ground|four corners|mountain|tadasana|feet/.test(text),
  };
}

/** Time-varying additive euler offsets (radians) keyed by Mixamo bone. */
export function cueBoneOffsets(
  flags: CueMotionFlags,
  elapsed: number
): Record<string, [number, number, number]> {
  const o: Record<string, [number, number, number]> = {};
  const add = (bone: string, x: number, y: number, z: number) => {
    const cur = o[bone] ?? [0, 0, 0];
    o[bone] = [cur[0] + x, cur[1] + y, cur[2] + z];
  };

  if (flags.heelPedal) {
    // Alternating ankle dorsiflexion — visible heel pedaling
    const L = Math.sin(elapsed * 2.4) * 0.22;
    const R = Math.sin(elapsed * 2.4 + Math.PI) * 0.22;
    add('mixamorigLeftFoot', L, 0, 0);
    add('mixamorigRightFoot', R, 0, 0);
    add('mixamorigLeftLeg', L * 0.15, 0, 0);
    add('mixamorigRightLeg', R * 0.15, 0, 0);
  }

  if (flags.shoulderDrop) {
    const pulse = 0.12 + Math.sin(elapsed * 1.1) * 0.03;
    add('mixamorigLeftShoulder', pulse, 0, 0.08);
    add('mixamorigRightShoulder', pulse, 0, -0.08);
    add('mixamorigLeftArm', 0.06, 0, 0);
    add('mixamorigRightArm', 0.06, 0, 0);
  }

  if (flags.chestToThighs) {
    add('mixamorigSpine', 0.12, 0, 0);
    add('mixamorigSpine1', 0.1, 0, 0);
    add('mixamorigSpine2', 0.08, 0, 0);
  }

  if (flags.softKnees) {
    const soft = 0.18 + Math.sin(elapsed * 1.6) * 0.04;
    add('mixamorigLeftLeg', soft, 0, 0);
    add('mixamorigRightLeg', soft, 0, 0);
  }

  if (flags.ribsDown) {
    add('mixamorigSpine1', 0.04, 0, 0);
    add('mixamorigSpine2', -0.03, 0, 0);
  }

  if (flags.longArms) {
    add('mixamorigLeftArm', -0.08, 0, 0.04);
    add('mixamorigRightArm', -0.08, 0, -0.04);
  }

  if (flags.heartOpen) {
    add('mixamorigSpine', -0.1, 0, 0);
    add('mixamorigSpine1', -0.08, 0, 0);
    add('mixamorigNeck', -0.05, 0, 0);
  }

  if (flags.groundFeet) {
    add('mixamorigLeftFoot', 0.04, 0, 0);
    add('mixamorigRightFoot', 0.04, 0, 0);
  }

  return o;
}
