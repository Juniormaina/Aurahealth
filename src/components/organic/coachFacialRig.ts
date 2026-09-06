import * as THREE from 'three';
import type { BreathPhase } from './organicMotion';
import type { AnimationState } from '../../content/calisthenicsExercises3D';

export type CoachMotionMode = 'calisthenics' | 'yoga';

export interface FacialWeights {
  focus: number;
  exertion: number;
  calm: number;
  smile: number;
  brow: number;
  jaw: number;
}

const ZERO: FacialWeights = {
  focus: 0,
  exertion: 0,
  calm: 0,
  smile: 0,
  brow: 0,
  jaw: 0,
};

/** Resolve expression targets from session context. */
export function resolveFacialExpression(opts: {
  mode: CoachMotionMode;
  animationState?: AnimationState;
  breathPhase?: BreathPhase;
  isBreathing?: boolean;
  isResting?: boolean;
  progress?: number;
}): FacialWeights {
  if (opts.isResting) {
    return { ...ZERO, calm: 0.7, smile: 0.15, jaw: 0.05 };
  }

  if (opts.mode === 'yoga') {
    const inhale = opts.breathPhase === 'inhale' ? 0.35 : 0;
    const hold = opts.breathPhase === 'hold_top' || opts.breathPhase === 'hold_bottom' ? 0.25 : 0;
    return {
      focus: 0.25 + hold,
      exertion: 0.08,
      calm: 0.55 + (opts.isBreathing ? 0.2 : 0) + inhale * 0.15,
      smile: 0.12,
      brow: -0.08 + hold * 0.1,
      jaw: 0.04 + inhale * 0.06,
    };
  }

  const state = opts.animationState ?? 'idle';
  const hard =
    state === 'pull_up' ||
    state === 'muscle_up' ||
    state === 'dip' ||
    state === 'pike_press' ||
    state === 'pistol_squat';
  const mid = state === 'push_up' || state === 'row' || state === 'squat' || state === 'plank';
  const p = opts.progress ?? 0;
  const peak = mid || hard ? 0.35 + p * 0.45 : 0.1;

  if (state === 'idle' || state === 'mobility') {
    return { ...ZERO, calm: 0.4, focus: 0.15, smile: 0.1 };
  }

  return {
    focus: hard ? 0.75 : 0.45,
    exertion: peak * (hard ? 1 : 0.7),
    calm: 0.1,
    smile: hard ? 0 : 0.05,
    brow: hard ? 0.35 + p * 0.2 : 0.15,
    jaw: hard ? 0.2 + p * 0.25 : 0.08,
  };
}

export class FacialRigController {
  private weights: FacialWeights = { ...ZERO };
  private morphMeshes: THREE.Mesh[] = [];

  constructor(root: THREE.Object3D) {
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (mesh.morphTargetInfluences && mesh.morphTargetDictionary) {
        this.morphMeshes.push(mesh);
      }
    });
  }

  hasMorphs(): boolean {
    return this.morphMeshes.length > 0;
  }

  /** Damp toward target expression and drive bones + morphs. */
  update(
    bones: Map<string, THREE.Bone>,
    target: FacialWeights,
    dt: number,
    elapsed: number
  ): void {
    const damp = (cur: number, goal: number) => THREE.MathUtils.damp(cur, goal, 5.5, dt);
    this.weights.focus = damp(this.weights.focus, target.focus);
    this.weights.exertion = damp(this.weights.exertion, target.exertion);
    this.weights.calm = damp(this.weights.calm, target.calm);
    this.weights.smile = damp(this.weights.smile, target.smile);
    this.weights.brow = damp(this.weights.brow, target.brow);
    this.weights.jaw = damp(this.weights.jaw, target.jaw);

    const micro = Math.sin(elapsed * 1.7) * 0.012 * (0.4 + this.weights.calm);
    const breathPulse = Math.sin(elapsed * 2.2) * 0.01 * this.weights.calm;

    // Bone-based face (Mixamo: Head / Neck / optional Jaw)
    const head = bones.get('mixamorigHead');
    const neck = bones.get('mixamorigNeck');
    const jaw =
      bones.get('mixamorigJaw') ||
      bones.get('Jaw') ||
      bones.get('mixamorigHeadTop_End');

    if (neck) {
      const pitch = -this.weights.focus * 0.06 + this.weights.calm * 0.03 + breathPulse;
      const roll = this.weights.brow * 0.04;
      neck.rotation.x = THREE.MathUtils.damp(neck.rotation.x, pitch, 6, dt);
      neck.rotation.z = THREE.MathUtils.damp(neck.rotation.z, roll, 6, dt);
    }

    if (head) {
      const pitch =
        this.weights.exertion * 0.08 -
        this.weights.calm * 0.04 +
        this.weights.brow * 0.05 +
        micro;
      const yaw = Math.sin(elapsed * 0.35) * 0.02 * this.weights.focus;
      head.rotation.x = THREE.MathUtils.damp(head.rotation.x, pitch, 7, dt);
      head.rotation.y = THREE.MathUtils.damp(head.rotation.y, yaw, 5, dt);
      // Soft cheek/smile asymmetry via roll
      head.rotation.z = THREE.MathUtils.damp(head.rotation.z, this.weights.smile * 0.03, 5, dt);
    }

    if (jaw && jaw !== head) {
      jaw.rotation.x = THREE.MathUtils.damp(jaw.rotation.x, this.weights.jaw * 0.22, 7, dt);
    }

    this.applyMorphs();
  }

  private applyMorphs(): void {
    if (!this.morphMeshes.length) return;
    const w = this.weights;
    const trySet = (dict: Record<string, number>, influences: number[], keys: string[], value: number) => {
      for (const k of keys) {
        const idx = dict[k];
        if (idx !== undefined && influences[idx] !== undefined) {
          influences[idx] = THREE.MathUtils.lerp(influences[idx], value, 0.2);
        }
      }
    };

    for (const mesh of this.morphMeshes) {
      const dict = mesh.morphTargetDictionary!;
      const inf = mesh.morphTargetInfluences!;
      trySet(dict, inf, ['mouthOpen', 'jawOpen', 'MouthOpen', 'viseme_aa'], w.jaw);
      trySet(dict, inf, ['mouthSmile', 'Smile', 'mouthSmileLeft', 'mouthSmileRight'], w.smile);
      trySet(dict, inf, ['browInnerUp', 'browsUp', 'Brow_Raise'], w.brow * 0.8);
      trySet(dict, inf, ['eyeSquintLeft', 'eyeSquintRight', 'squint'], w.exertion * 0.5);
      trySet(dict, inf, ['mouthFrown', 'mouthPress'], w.exertion * 0.35);
    }
  }
}
