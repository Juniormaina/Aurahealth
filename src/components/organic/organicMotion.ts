import * as THREE from 'three';

export type Vec3 = [number, number, number];

/** Hierarchical skeletal target — joints react as an interdependent chain. */
export interface ChainPose {
  rootY: number;
  rootRot: Vec3;
  /** Sacrum / hip bowl */
  pelvis: Vec3;
  /** Lumbar mid-spine */
  spine: Vec3;
  /** Thoracic / ribcage */
  chest: Vec3;
  head: Vec3;
  lShoulder: Vec3;
  /** Forearm flexion (radians, positive = bend) */
  lElbow: number;
  rShoulder: Vec3;
  rElbow: number;
  lHip: Vec3;
  lKnee: number;
  rHip: Vec3;
  rKnee: number;
}

export type BreathPhase = 'inhale' | 'hold_top' | 'exhale' | 'hold_bottom' | 'idle';

export const EMERALD = {
  bgDeep: '#022c22',
  bgMid: '#064e3b',
  accent: '#34d399',
  limb: '#10b981',
  torso: '#059669',
  skin: '#a7f3d0',
  rim: '#6ee7b7',
  fog: '#022c22',
} as const;

export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [
    THREE.MathUtils.lerp(a[0], b[0], t),
    THREE.MathUtils.lerp(a[1], b[1], t),
    THREE.MathUtils.lerp(a[2], b[2], t),
  ];
}

export function blendChainPose(a: ChainPose, b: ChainPose, t: number): ChainPose {
  const ease = t * t * (3 - 2 * t); // smoothstep — no linear snap
  return {
    rootY: THREE.MathUtils.lerp(a.rootY, b.rootY, ease),
    rootRot: lerpVec3(a.rootRot, b.rootRot, ease),
    pelvis: lerpVec3(a.pelvis, b.pelvis, ease),
    spine: lerpVec3(a.spine, b.spine, ease),
    chest: lerpVec3(a.chest, b.chest, ease),
    head: lerpVec3(a.head, b.head, ease),
    lShoulder: lerpVec3(a.lShoulder, b.lShoulder, ease),
    lElbow: THREE.MathUtils.lerp(a.lElbow, b.lElbow, ease),
    rShoulder: lerpVec3(a.rShoulder, b.rShoulder, ease),
    rElbow: THREE.MathUtils.lerp(a.rElbow, b.rElbow, ease),
    lHip: lerpVec3(a.lHip, b.lHip, ease),
    lKnee: THREE.MathUtils.lerp(a.lKnee, b.lKnee, ease),
    rHip: lerpVec3(a.rHip, b.rHip, ease),
    rKnee: THREE.MathUtils.lerp(a.rKnee, b.rKnee, ease),
  };
}

/** Critically-ish damped spring for scalars (root Y, breath, elbow bend). */
export class SpringScalar {
  value: number;
  velocity = 0;

  constructor(initial = 0) {
    this.value = initial;
  }

  step(target: number, dt: number, stiffness = 22, damping = 9): number {
    const safeDt = Math.min(dt, 0.05);
    const force = -stiffness * (this.value - target) - damping * this.velocity;
    this.velocity += force * safeDt;
    this.value += this.velocity * safeDt;
    return this.value;
  }
}

const _euler = new THREE.Euler();
const _quatTarget = new THREE.Quaternion();

/** Quaternion slerp toward Euler target — inertial limb travel. */
export function slerpEuler(
  object: THREE.Object3D,
  target: Vec3,
  dt: number,
  lambda = 7.5,
  sway: Vec3 = [0, 0, 0]
): void {
  _euler.set(target[0] + sway[0], target[1] + sway[1], target[2] + sway[2], 'XYZ');
  _quatTarget.setFromEuler(_euler);
  object.quaternion.slerp(_quatTarget, 1 - Math.exp(-lambda * Math.min(dt, 0.05)));
}

export function breathInflation(phase: BreathPhase, isBreathing: boolean): number {
  switch (phase) {
    case 'inhale':
      return 1;
    case 'hold_top':
      return 0.92;
    case 'exhale':
      return 0.08;
    case 'hold_bottom':
      return 0.18;
    case 'idle':
    default:
      return isBreathing ? 0.55 : 0.4;
  }
}

/** Multi-axis postural drift + heartbeat micro-vibration. */
export function posturalSway(elapsed: number, amp = 1): { spine: Vec3; chest: Vec3; head: Vec3; pelvis: Vec3 } {
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

export const ZERO: Vec3 = [0, 0, 0];

export function standingChain(partial?: Partial<ChainPose>): ChainPose {
  return {
    rootY: 0,
    rootRot: ZERO,
    pelvis: ZERO,
    spine: ZERO,
    chest: ZERO,
    head: ZERO,
    lShoulder: [0, 0, 0.18],
    lElbow: 0.12,
    rShoulder: [0, 0, -0.18],
    rElbow: 0.12,
    lHip: ZERO,
    lKnee: 0.05,
    rHip: ZERO,
    rKnee: 0.05,
    ...partial,
  };
}
