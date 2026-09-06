import * as THREE from 'three';
import type { PropBindMode } from '../../content/exercisePropAffinity';
import type { CoachPropBinding } from './coachPropInteraction';

const _parentInv = new THREE.Quaternion();
const _aim = new THREE.Quaternion();
const _worldDir = new THREE.Vector3();
const _localDir = new THREE.Vector3();
const _bendAxis = new THREE.Vector3();
const _pole = new THREE.Vector3();
const _rootPos = new THREE.Vector3();
const _midPos = new THREE.Vector3();
const _effPos = new THREE.Vector3();
const _target = new THREE.Vector3();

/**
 * Analytical two-bone IK (law of cosines).
 * Rotates root → mid → effector chain so the tip approaches targetWorld.
 */
export function solveTwoBoneIK(
  root: THREE.Bone,
  mid: THREE.Bone,
  effector: THREE.Bone,
  targetWorld: THREE.Vector3,
  poleWorld: THREE.Vector3 | null,
  blend: number
): void {
  if (blend <= 0.001) return;

  root.updateWorldMatrix(true, false);
  mid.updateWorldMatrix(true, false);
  effector.updateWorldMatrix(true, false);

  _rootPos.setFromMatrixPosition(root.matrixWorld);
  _midPos.setFromMatrixPosition(mid.matrixWorld);
  _effPos.setFromMatrixPosition(effector.matrixWorld);
  _target.copy(targetWorld);

  const upperLen = _rootPos.distanceTo(_midPos);
  const lowerLen = _midPos.distanceTo(_effPos);
  if (upperLen < 1e-5 || lowerLen < 1e-5) return;

  let dist = _rootPos.distanceTo(_target);
  const maxReach = (upperLen + lowerLen) * 0.992;
  const minReach = Math.abs(upperLen - lowerLen) * 1.008;
  dist = THREE.MathUtils.clamp(dist, minReach, maxReach);

  // Pull target onto reachable sphere
  _worldDir.subVectors(_target, _rootPos).normalize();
  _target.copy(_rootPos).addScaledVector(_worldDir, dist);

  const cosMid =
    (upperLen * upperLen + lowerLen * lowerLen - dist * dist) / (2 * upperLen * lowerLen);
  const midAngle = Math.acos(THREE.MathUtils.clamp(cosMid, -1, 1));

  const cosRoot =
    (upperLen * upperLen + dist * dist - lowerLen * lowerLen) / (2 * upperLen * dist);
  const rootAngle = Math.acos(THREE.MathUtils.clamp(cosRoot, -1, 1));

  // Pole defines bend plane
  if (poleWorld) {
    _pole.subVectors(poleWorld, _rootPos);
    _pole.addScaledVector(_worldDir, -_pole.dot(_worldDir)).normalize();
  } else {
    _pole.set(0, 0, 1);
    if (Math.abs(_worldDir.dot(_pole)) > 0.92) _pole.set(0, 1, 0);
    _bendAxis.crossVectors(_worldDir, _pole).normalize();
    _pole.crossVectors(_bendAxis, _worldDir).normalize();
  }

  _bendAxis.crossVectors(_worldDir, _pole).normalize();
  if (_bendAxis.lengthSq() < 1e-6) return;

  // Direction of upper bone
  const rootDir = _worldDir.clone().applyAxisAngle(_bendAxis, -rootAngle).normalize();
  aimBoneToward(root, rootDir, blend);

  // Elbow flex (π − interior angle), Mixamo forearm bends on local X
  const flex = Math.PI - midAngle;
  const flexQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), flex);
  const midGoal = root.quaternion.clone().multiply(flexQ);
  // Recompute mid aim toward target for stability
  mid.updateWorldMatrix(true, false);
  _midPos.setFromMatrixPosition(mid.matrixWorld);
  const midDir = _target.clone().sub(_midPos).normalize();
  aimBoneToward(mid, midDir, blend * 0.9);
  mid.quaternion.slerp(mid.quaternion.clone().multiply(flexQ), blend * 0.25);
  void midGoal;

  // Soft wrist/ankle aim
  effector.updateWorldMatrix(true, false);
  _effPos.setFromMatrixPosition(effector.matrixWorld);
  const tip = _target.clone().sub(_effPos);
  if (tip.lengthSq() > 1e-5) {
    tip.normalize();
    aimBoneToward(effector, tip, blend * 0.35);
  }
}

function aimBoneToward(bone: THREE.Bone, worldDir: THREE.Vector3, blend: number): void {
  const parent = bone.parent;
  if (!parent) return;
  parent.updateWorldMatrix(true, false);

  const parentWorldQ = new THREE.Quaternion().setFromRotationMatrix(parent.matrixWorld);
  _parentInv.copy(parentWorldQ).invert();
  _localDir.copy(worldDir).applyQuaternion(_parentInv).normalize();

  // Mixamo bones extend along +Y
  _aim.setFromUnitVectors(new THREE.Vector3(0, 1, 0), _localDir);
  bone.quaternion.slerp(_aim, THREE.MathUtils.clamp(blend, 0, 1));
}

export interface IkContactTargets {
  leftHand: THREE.Vector3 | null;
  rightHand: THREE.Vector3 | null;
  leftFoot: THREE.Vector3 | null;
  rightFoot: THREE.Vector3 | null;
  leftPole: THREE.Vector3 | null;
  rightPole: THREE.Vector3 | null;
  blend: number;
}

function rotOffset(
  origin: THREE.Vector3,
  yaw: number,
  x: number,
  y: number,
  z: number
): THREE.Vector3 {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return new THREE.Vector3(origin.x + x * c - z * s, origin.y + y, origin.z + x * s + z * c);
}

/** Prop-aware IK contact points in world space. */
export function resolveIkContacts(
  binding: CoachPropBinding | null | undefined,
  attachOrigin: THREE.Vector3,
  attachYaw: number
): IkContactTargets {
  const none: IkContactTargets = {
    leftHand: null,
    rightHand: null,
    leftFoot: null,
    rightFoot: null,
    leftPole: null,
    rightPole: null,
    blend: 0,
  };

  if (!binding || binding.mode === 'bodyweight') {
    return {
      ...none,
      leftHand: rotOffset(attachOrigin, attachYaw, -0.28, 0.04, 0.45),
      rightHand: rotOffset(attachOrigin, attachYaw, 0.28, 0.04, 0.45),
      leftFoot: rotOffset(attachOrigin, attachYaw, -0.12, 0.025, 0.04),
      rightFoot: rotOffset(attachOrigin, attachYaw, 0.12, 0.025, 0.04),
      leftPole: rotOffset(attachOrigin, attachYaw, -0.4, 0.5, 0.35),
      rightPole: rotOffset(attachOrigin, attachYaw, 0.4, 0.5, 0.35),
      blend: 0.42,
    };
  }

  const mode: PropBindMode = binding.mode;
  const o = attachOrigin;
  const y = attachYaw;

  switch (mode) {
    case 'grip_bars':
      return {
        leftHand: rotOffset(o, y, -0.28, 1.12, 0),
        rightHand: rotOffset(o, y, 0.28, 1.12, 0),
        leftFoot: rotOffset(o, y, -0.1, 0.02, 0.15),
        rightFoot: rotOffset(o, y, 0.1, 0.02, 0.15),
        leftPole: rotOffset(o, y, -0.5, 0.9, 0.4),
        rightPole: rotOffset(o, y, 0.5, 0.9, 0.4),
        blend: 0.72,
      };
    case 'hang_bar':
    case 'hang_rings':
      return {
        leftHand: rotOffset(o, y, -0.22, 2.0, 0.02),
        rightHand: rotOffset(o, y, 0.22, 2.0, 0.02),
        leftFoot: null,
        rightFoot: null,
        leftPole: rotOffset(o, y, -0.4, 1.4, 0.35),
        rightPole: rotOffset(o, y, 0.4, 1.4, 0.35),
        blend: 0.8,
      };
    case 'support_blocks':
      return {
        leftHand: rotOffset(o, y, -0.28, 0.12, 0.25),
        rightHand: rotOffset(o, y, 0.28, 0.12, 0.25),
        leftFoot: rotOffset(o, y, -0.12, 0.02, -0.05),
        rightFoot: rotOffset(o, y, 0.12, 0.02, -0.05),
        leftPole: rotOffset(o, y, -0.35, 0.6, 0.5),
        rightPole: rotOffset(o, y, 0.35, 0.6, 0.5),
        blend: 0.65,
      };
    case 'band':
      return {
        leftHand: rotOffset(o, y, -0.2, 1.15, 0.2),
        rightHand: rotOffset(o, y, 0.25, 1.05, 0.15),
        leftFoot: rotOffset(o, y, -0.12, 0.02, 0),
        rightFoot: rotOffset(o, y, 0.12, 0.02, 0),
        leftPole: rotOffset(o, y, -0.4, 0.85, 0.45),
        rightPole: rotOffset(o, y, 0.45, 0.85, 0.4),
        blend: 0.55,
      };
    case 'mat':
    case 'bolster': {
      const fy = mode === 'bolster' ? 0.1 : 0.035;
      return {
        leftHand: mode === 'mat' ? rotOffset(o, y, -0.35, 0.04, 0.55) : null,
        rightHand: mode === 'mat' ? rotOffset(o, y, 0.35, 0.04, 0.55) : null,
        leftFoot: rotOffset(o, y, -0.14, fy, 0.05),
        rightFoot: rotOffset(o, y, 0.14, fy, 0.05),
        leftPole: null,
        rightPole: null,
        blend: 0.55,
      };
    }
    case 'chair':
      return {
        leftHand: rotOffset(o, y, -0.2, 0.55, 0.1),
        rightHand: rotOffset(o, y, 0.2, 0.55, 0.1),
        leftFoot: rotOffset(o, y, -0.12, 0.02, 0.25),
        rightFoot: rotOffset(o, y, 0.12, 0.02, 0.25),
        leftPole: rotOffset(o, y, -0.35, 0.7, 0.4),
        rightPole: rotOffset(o, y, 0.35, 0.7, 0.4),
        blend: 0.7,
      };
    default:
      return none;
  }
}

export function applyLimbIk(
  bones: Map<string, THREE.Bone>,
  contacts: IkContactTargets
): void {
  const blend = contacts.blend;
  if (blend < 0.01) return;

  const lShoulder = bones.get('mixamorigLeftArm');
  const lElbow = bones.get('mixamorigLeftForeArm');
  const lHand = bones.get('mixamorigLeftHand');
  const rShoulder = bones.get('mixamorigRightArm');
  const rElbow = bones.get('mixamorigRightForeArm');
  const rHand = bones.get('mixamorigRightHand');
  const lHip = bones.get('mixamorigLeftUpLeg');
  const lKnee = bones.get('mixamorigLeftLeg');
  const lFoot = bones.get('mixamorigLeftFoot');
  const rHip = bones.get('mixamorigRightUpLeg');
  const rKnee = bones.get('mixamorigRightLeg');
  const rFoot = bones.get('mixamorigRightFoot');

  if (contacts.leftHand && lShoulder && lElbow && lHand) {
    solveTwoBoneIK(lShoulder, lElbow, lHand, contacts.leftHand, contacts.leftPole, blend);
  }
  if (contacts.rightHand && rShoulder && rElbow && rHand) {
    solveTwoBoneIK(rShoulder, rElbow, rHand, contacts.rightHand, contacts.rightPole, blend);
  }
  if (contacts.leftFoot && lHip && lKnee && lFoot) {
    solveTwoBoneIK(lHip, lKnee, lFoot, contacts.leftFoot, contacts.leftPole, blend * 0.7);
  }
  if (contacts.rightFoot && rHip && rKnee && rFoot) {
    solveTwoBoneIK(rHip, rKnee, rFoot, contacts.rightFoot, contacts.rightPole, blend * 0.7);
  }
}
