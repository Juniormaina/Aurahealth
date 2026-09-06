import type { PropAffinity, PropBindMode, ExercisePropContext, ExercisePropSessionMeta } from '../../content/exercisePropAffinity';
import { resolvePropAffinity } from '../../content/exercisePropAffinity';
import type { BoneEulers } from './coachPoseLibrary';
import type { GearInstance } from './studioPlaygroundState';
import { canPlace, clampToFloor, newInstanceId } from './studioPlaygroundState';
import type { GearMeshKind } from '../../content/studioGearCatalog';
import { GEAR_BY_ID } from '../../content/studioGearCatalog';
import * as THREE from 'three';

const DEG = Math.PI / 180;
const B = (n: string) => `mixamorig${n}`;

export interface CoachPropBinding {
  mode: PropBindMode;
  worldX: number;
  worldZ: number;
  yawDeg: number;
  rootYBoost: number;
  boneOverlays: BoneEulers;
  activeInstanceId: string | null;
  gearId: GearMeshKind | null;
  label: string;
  requiresProp: boolean;
  usingFallback: boolean;
  exerciseKey: string;
}

export interface PropSyncResult {
  instances: GearInstance[];
  binding: CoachPropBinding;
  meta: ExercisePropSessionMeta;
}

function gripOverlays(mode: PropBindMode): BoneEulers {
  switch (mode) {
    case 'grip_bars':
      return {
        [B('LeftArm')]: [-25 * DEG, 10 * DEG, 55 * DEG],
        [B('RightArm')]: [-25 * DEG, -10 * DEG, -55 * DEG],
        [B('LeftForeArm')]: [0, 0, 35 * DEG],
        [B('RightForeArm')]: [0, 0, -35 * DEG],
        [B('LeftHand')]: [0, 0, -15 * DEG],
        [B('RightHand')]: [0, 0, 15 * DEG],
      };
    case 'hang_bar':
    case 'hang_rings':
      return {
        [B('LeftArm')]: [-160 * DEG, 5 * DEG, 20 * DEG],
        [B('RightArm')]: [-160 * DEG, -5 * DEG, -20 * DEG],
        [B('LeftForeArm')]: [0, 0, 10 * DEG],
        [B('RightForeArm')]: [0, 0, -10 * DEG],
        [B('LeftHand')]: [0, 0, -20 * DEG],
        [B('RightHand')]: [0, 0, 20 * DEG],
      };
    case 'support_blocks':
      return {
        [B('LeftArm')]: [-40 * DEG, 0, 50 * DEG],
        [B('RightArm')]: [-40 * DEG, 0, -50 * DEG],
        [B('LeftForeArm')]: [0, 0, 20 * DEG],
        [B('RightForeArm')]: [0, 0, -20 * DEG],
      };
    case 'band':
      return {
        [B('LeftArm')]: [-70 * DEG, 15 * DEG, 40 * DEG],
        [B('RightArm')]: [-70 * DEG, -15 * DEG, -40 * DEG],
        [B('LeftForeArm')]: [0, 0, 45 * DEG],
        [B('RightForeArm')]: [0, 0, -45 * DEG],
      };
    case 'bolster':
      return {
        [B('Spine')]: [-8 * DEG, 0, 0],
        [B('LeftUpLeg')]: [-15 * DEG, 0, 8 * DEG],
        [B('RightUpLeg')]: [-15 * DEG, 0, -8 * DEG],
      };
    case 'chair':
      return {
        [B('LeftUpLeg')]: [-70 * DEG, 0, 8 * DEG],
        [B('RightUpLeg')]: [-70 * DEG, 0, -8 * DEG],
        [B('LeftLeg')]: [70 * DEG, 0, 0],
        [B('RightLeg')]: [70 * DEG, 0, 0],
        [B('Spine')]: [5 * DEG, 0, 0],
        [B('LeftArm')]: [-20 * DEG, 0, 45 * DEG],
        [B('RightArm')]: [-20 * DEG, 0, -45 * DEG],
      };
    case 'mat':
      return {
        [B('LeftFoot')]: [5 * DEG, 0, 0],
        [B('RightFoot')]: [5 * DEG, 0, 0],
      };
    default:
      return {};
  }
}

function rootYForMode(mode: PropBindMode): number {
  switch (mode) {
    case 'grip_bars':
      return 0.42;
    case 'hang_bar':
    case 'hang_rings':
      return 0.55;
    case 'bolster':
      return 0.08;
    case 'support_blocks':
      return 0.04;
    case 'chair':
      return 0.48;
    case 'mat':
      return 0.02;
    default:
      return 0.01; // slight lift onto rubber tile contact
  }
}

function bodyweightBinding(exerciseKey: string, label = 'Bodyweight'): CoachPropBinding {
  return {
    mode: 'bodyweight',
    worldX: 0,
    worldZ: 0,
    yawDeg: 0,
    rootYBoost: 0,
    boneOverlays: {},
    activeInstanceId: null,
    gearId: null,
    label,
    requiresProp: false,
    usingFallback: false,
    exerciseKey,
  };
}

function rotateOffset(ox: number, oz: number, yawDeg: number): { x: number; z: number } {
  const r = yawDeg * DEG;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: ox * c - oz * s, z: ox * s + oz * c };
}

function clearActiveRole(instances: GearInstance[]): GearInstance[] {
  return instances.map((i) => {
    if (i.sessionRole !== 'active') return i;
    const { sessionRole: _sr, ...rest } = i;
    return rest;
  });
}

function findBestGear(preferred: GearMeshKind[], instances: GearInstance[]): GearInstance | null {
  for (const gearId of preferred) {
    const matches = instances.filter((i) => i.gearId === gearId);
    if (!matches.length) continue;
    // Prefer already-active, then nearest to origin
    matches.sort((a, b) => {
      const ar = a.sessionRole === 'active' ? -1 : 0;
      const br = b.sessionRole === 'active' ? -1 : 0;
      if (ar !== br) return ar - br;
      return Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z);
    });
    return matches[0];
  }
  return null;
}

function placeAtSlot(
  gearId: GearMeshKind,
  affinity: PropAffinity,
  others: GearInstance[],
  existingId?: string
): GearInstance | null {
  const slot = clampToFloor(affinity.propSlot.x, affinity.propSlot.z);
  const inst: GearInstance = {
    instanceId: existingId ?? newInstanceId(gearId),
    gearId,
    x: slot.x,
    z: slot.z,
    yawDeg: affinity.propSlot.yawDeg,
    sessionRole: 'active',
    sessionManaged: !existingId,
  };
  if (
    canPlace(inst, others, existingId, {
      allowCoachOverlap: affinity.allowCoachOverlap,
    })
  ) {
    return inst;
  }
  // Soften: force slot when AI-managed overlap is allowed
  if (affinity.allowCoachOverlap) return inst;
  return null;
}

function bindingFromGear(
  affinity: PropAffinity,
  gear: GearInstance,
  exerciseKey: string,
  usingFallback: boolean
): CoachPropBinding {
  const off = rotateOffset(affinity.coachOffset.x, affinity.coachOffset.z, gear.yawDeg);
  return {
    mode: affinity.bindMode,
    worldX: gear.x + off.x,
    worldZ: gear.z + off.z,
    yawDeg: gear.yawDeg + affinity.coachYawOffsetDeg,
    rootYBoost: affinity.coachOffset.y + rootYForMode(affinity.bindMode),
    boneOverlays: gripOverlays(affinity.bindMode),
    activeInstanceId: gear.instanceId,
    gearId: gear.gearId,
    label: `${affinity.label} · ${GEAR_BY_ID[gear.gearId].shortLabel}`,
    requiresProp: affinity.preferredGear.length > 0 && !affinity.bodyweightOk,
    usingFallback,
    exerciseKey,
  };
}

/**
 * Evaluate exercise context against playground gear: select, spawn, or fall back to bodyweight.
 * Returns updated instances + coach binding + session metadata flags.
 */
export function syncPropsForExercise(
  ctx: ExercisePropContext,
  instances: GearInstance[],
  opts: { editMode?: boolean; autoSpawn?: boolean } = {}
): PropSyncResult {
  const autoSpawn = opts.autoSpawn !== false;
  const editMode = Boolean(opts.editMode);
  const affinity = resolvePropAffinity(ctx);
  const exerciseKey = ctx.exerciseKey;

  let next = clearActiveRole(instances);

  if (!affinity.preferredGear.length || affinity.bindMode === 'bodyweight') {
    return {
      instances: next.filter((i) => !i.sessionManaged),
      binding: bodyweightBinding(exerciseKey),
      meta: {
        exerciseKey,
        affinityLabel: affinity.label,
        bindMode: 'bodyweight',
        requiresProp: false,
        preferredGear: [],
        activeGearId: null,
        activeInstanceId: null,
        usingFallback: false,
        bodyweightOk: true,
      },
    };
  }

  // Remove prior AI-managed props that are no longer preferred (keep user decor)
  next = next.filter((i) => {
    if (!i.sessionManaged) return true;
    return affinity.preferredGear.includes(i.gearId);
  });

  let gear = findBestGear(affinity.preferredGear, next);
  let usingFallback = false;

  if (gear && !editMode) {
    // Snap preferred prop to interaction slot for clean alignment
    const placed = placeAtSlot(gear.gearId, affinity, next.filter((i) => i.instanceId !== gear!.instanceId), gear.instanceId);
    if (placed) {
      next = next.map((i) => (i.instanceId === gear!.instanceId ? { ...placed, sessionManaged: gear!.sessionManaged } : i));
      gear = next.find((i) => i.instanceId === gear!.instanceId)!;
    } else {
      next = next.map((i) =>
        i.instanceId === gear!.instanceId ? { ...i, sessionRole: 'active' as const } : i
      );
    }
  } else if (gear && editMode) {
    next = next.map((i) =>
      i.instanceId === gear!.instanceId ? { ...i, sessionRole: 'active' as const } : i
    );
  } else if (autoSpawn && !editMode) {
    const spawnId = affinity.preferredGear[0];
    const placed = placeAtSlot(spawnId, affinity, next);
    if (placed) {
      next = [...next, placed];
      gear = placed;
    }
  }

  if (!gear) {
    usingFallback = true;
    if (!affinity.bodyweightOk && autoSpawn) {
      // Last resort: still bodyweight so session continues
      usingFallback = true;
    }
    return {
      instances: next.filter((i) => !i.sessionManaged || affinity.preferredGear.includes(i.gearId)),
      binding: bodyweightBinding(exerciseKey, `${affinity.label} (bodyweight fallback)`),
      meta: {
        exerciseKey,
        affinityLabel: affinity.label,
        bindMode: 'bodyweight',
        requiresProp: !affinity.bodyweightOk,
        preferredGear: affinity.preferredGear,
        activeGearId: null,
        activeInstanceId: null,
        usingFallback: true,
        bodyweightOk: affinity.bodyweightOk,
      },
    };
  }

  const binding = bindingFromGear(affinity, gear, exerciseKey, usingFallback);
  return {
    instances: next,
    binding,
    meta: {
      exerciseKey,
      affinityLabel: affinity.label,
      bindMode: binding.mode,
      requiresProp: !affinity.bodyweightOk,
      preferredGear: affinity.preferredGear,
      activeGearId: gear.gearId,
      activeInstanceId: gear.instanceId,
      usingFallback: false,
      bodyweightOk: affinity.bodyweightOk,
    },
  };
}

/** Empty / idle binding helper for hooks. */
export function idlePropBinding(exerciseKey = 'idle'): CoachPropBinding {
  return bodyweightBinding(exerciseKey);
}

/** Damp helper used by CoachCharacter. */
export function dampVec3(
  current: THREE.Vector3,
  target: THREE.Vector3,
  lambda: number,
  dt: number
): void {
  current.x = THREE.MathUtils.damp(current.x, target.x, lambda, dt);
  current.y = THREE.MathUtils.damp(current.y, target.y, lambda, dt);
  current.z = THREE.MathUtils.damp(current.z, target.z, lambda, dt);
}
