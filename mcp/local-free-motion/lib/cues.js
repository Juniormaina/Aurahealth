import { addVec3 } from './math.js';

const EMPTY = {
  heelPedal: false,
  shoulderDrop: false,
  chestToThighs: false,
  softKnees: false,
  ribsDown: false,
  longArms: false,
  heartOpen: false,
  groundFeet: false,
};

/** Mirrors src/components/organic/trainerConfig.ts parseCueMotion. */
export function parseCueMotion(cue, poseName, assetId) {
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

/** Mirrors trainerConfig.cueBoneOffsets — Mixamo euler deltas in radians. */
export function cueBoneOffsets(flags, elapsed) {
  const o = {};
  const add = (name, x, y, z) => {
    o[name] = addVec3(o[name] ?? [0, 0, 0], [x, y, z]);
  };

  if (flags.heelPedal) {
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

export function breathInflation(phase, isBreathing) {
  switch (phase) {
    case 'inhale':
      return 1;
    case 'hold_top':
      return 0.92;
    case 'exhale':
      return 0.08;
    case 'hold_bottom':
      return 0.18;
    default:
      return isBreathing ? 0.55 : 0.4;
  }
}

export function posturalSway(elapsed, amp = 1) {
  const t = elapsed;
  const a = amp;
  return {
    pelvis: [
      Math.sin(t * 0.55) * 0.008 * a,
      Math.sin(t * 0.41 + 0.7) * 0.006 * a,
      Math.sin(t * 0.63 + 1.2) * 0.007 * a,
    ],
    spine: [
      Math.sin(t * 1.05) * 0.014 * a,
      Math.sin(t * 0.72 + 0.4) * 0.01 * a,
      Math.sin(t * 0.88 + 1.1) * 0.012 * a,
    ],
    chest: [
      Math.sin(t * 0.95 + 0.3) * 0.01 * a + Math.sin(t * 6.2) * 0.0025 * a,
      Math.sin(t * 0.68) * 0.008 * a,
      Math.sin(t * 1.12 + 0.9) * 0.009 * a + Math.sin(t * 6.2 + 0.4) * 0.0018 * a,
    ],
    head: [
      Math.sin(t * 1.25 + 0.5) * 0.018 * a,
      Math.sin(t * 0.9 + 1.4) * 0.012 * a,
      Math.sin(t * 1.05 + 0.2) * 0.01 * a,
    ],
  };
}
