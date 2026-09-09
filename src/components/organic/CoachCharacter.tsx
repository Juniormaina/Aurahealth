import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Center,
  ContactShadows,
  Environment,
  OrbitControls,
  useAnimations,
  useGLTF,
} from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { AnimationState } from '../../content/calisthenicsExercises3D';
import {
  BreathPhase,
  SpringScalar,
  breathInflation,
  posturalSway,
  slerpEuler,
} from './organicMotion';
import {
  CALI_POSE_A,
  CALI_POSE_B,
  IDLE_POSE,
  REST_POSE,
  RigPose,
  YogaAsanaFamily,
  YOGA_POSES,
  blendRigPose,
  buildPoseClip,
  familyFromYogaAsset,
} from './coachPoseLibrary';
import {
  TrainerId,
  TRAINER_MODELS,
  cueBoneOffsets,
  parseCueMotion,
} from './trainerConfig';
import type { CoachPropBinding } from './coachPropInteraction';
import { dampVec3 } from './coachPropInteraction';
import { applyHumanoidMaterials, applyMuscleDefinition } from './coachAvatarMaterials';
import { applyPhysiqueProfile, applyTrainerWardrobe } from './coachWardrobe';
import {
  FacialRigController,
  resolveFacialExpression,
  type CoachMotionMode,
} from './coachFacialRig';
import { applyLimbIk, resolveIkContacts } from './coachLimbIK';

export type { CoachMotionMode };

export interface CoachCharacterProps {
  mode: CoachMotionMode;
  trainerId: TrainerId;
  animationState?: AnimationState;
  /** 0 = extended (A), 1 = bottom (B) for tempo-driven calisthenics */
  progress?: number;
  yogaAssetId?: string;
  instructionCue?: string;
  poseName?: string;
  breathPhase?: BreathPhase;
  isBreathing?: boolean;
  isResting?: boolean;
  swayAmp?: number;
  propBinding?: CoachPropBinding | null;
}

const _euler = new THREE.Euler();
const _quat = new THREE.Quaternion();

useGLTF.preload(TRAINER_MODELS.aura.url);
useGLTF.preload(TRAINER_MODELS.aurora.url);

function collectBones(root: THREE.Object3D): Map<string, THREE.Bone> {
  const map = new Map<string, THREE.Bone>();
  root.traverse((o) => {
    if ((o as THREE.Bone).isBone) map.set(o.name, o as THREE.Bone);
  });
  return map;
}

function resolveTargetPose(props: CoachCharacterProps): RigPose {
  if (props.isResting) return REST_POSE;
  if (props.mode === 'yoga') {
    const family: YogaAsanaFamily = familyFromYogaAsset(props.yogaAssetId ?? '');
    return YOGA_POSES[family] ?? IDLE_POSE;
  }
  const state = props.animationState ?? 'idle';
  return blendRigPose(CALI_POSE_A[state], CALI_POSE_B[state], props.progress ?? 0);
}

function CoachCharacterInner(props: CoachCharacterProps) {
  const {
    mode,
    trainerId,
    animationState = 'idle',
    progress = 0,
    yogaAssetId,
    instructionCue,
    poseName,
    breathPhase = 'idle',
    isBreathing = false,
    isResting = false,
    swayAmp = 1,
    propBinding = null,
  } = props;

  const modelUrl = TRAINER_MODELS[trainerId].url;
  const group = useRef<THREE.Group>(null);
  const attachRef = useRef<THREE.Group>(null);
  const attachPos = useRef(new THREE.Vector3(0, 0, 0));
  const attachTarget = useRef(new THREE.Vector3(0, 0, 0));
  const attachYaw = useRef(0);
  const { scene, animations } = useGLTF(modelUrl);

  const model = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Object3D;
    applyHumanoidMaterials(cloned, trainerId);
    const boneMap = collectBones(cloned);
    applyPhysiqueProfile(cloned, boneMap, trainerId);
    applyTrainerWardrobe(cloned, boneMap, trainerId);
    return cloned;
  }, [scene, trainerId]);

  const bones = useMemo(() => collectBones(model), [model]);
  const facial = useMemo(() => new FacialRigController(model), [model]);

  const cueFlags = useMemo(
    () => parseCueMotion(instructionCue, poseName, yogaAssetId),
    [instructionCue, poseName, yogaAssetId]
  );

  const facialTarget = useMemo(
    () =>
      resolveFacialExpression({
        mode,
        animationState,
        breathPhase,
        isBreathing,
        isResting,
        progress,
      }),
    [mode, animationState, breathPhase, isBreathing, isResting, progress]
  );

  const proceduralClips = useMemo(() => {
    const clips: THREE.AnimationClip[] = [];
    (Object.keys(CALI_POSE_A) as AnimationState[]).forEach((key) => {
      clips.push(buildPoseClip(`cali_${key}_cycle`, CALI_POSE_A[key], CALI_POSE_B[key], 1));
    });
    (Object.keys(YOGA_POSES) as YogaAsanaFamily[]).forEach((key) => {
      clips.push(buildPoseClip(`yoga_${key}`, IDLE_POSE, YOGA_POSES[key], 1.1));
    });
    return clips;
  }, []);

  const allClips = useMemo(() => [...animations, ...proceduralClips], [animations, proceduralClips]);
  const { actions, mixer, names } = useAnimations(allClips, group);
  const breath = useMemo(() => new SpringScalar(0.4), []);
  const activeClip = useRef<string | null>(null);
  const floorBox = useMemo(() => new THREE.Box3(), []);
  const groundKey = `${trainerId}-${mode}-${animationState}-${yogaAssetId ?? ''}-${isResting}-${Math.round(progress * 12)}-${propBinding?.mode ?? 'bw'}-${propBinding?.gearId ?? ''}`;

  useEffect(() => {
    if (!actions) return;
    let next: string | null = null;
    if (isResting || animationState === 'rest') {
      next = names.includes('idle') ? 'idle' : null;
    } else if (mode === 'yoga') {
      const fam = familyFromYogaAsset(yogaAssetId ?? '');
      const clipName = `yoga_${fam}`;
      next = actions[clipName] ? clipName : names.includes('idle') ? 'idle' : null;
    } else if (animationState === 'idle') {
      next = names.includes('idle') ? 'idle' : null;
    } else {
      const cycle = `cali_${animationState}_cycle`;
      next = actions[cycle] ? cycle : names.includes('idle') ? 'idle' : null;
    }

    if (next === activeClip.current) return;
    const prev = activeClip.current ? actions[activeClip.current] : null;
    const upcoming = next ? actions[next] : null;
    if (prev) prev.fadeOut(0.4);
    if (upcoming) {
      upcoming.reset().fadeIn(0.45).play();
      // Higher weight so skinned mesh deformation reads as organic, not stick-pose
      upcoming.setEffectiveWeight(0.55);
      upcoming.setEffectiveTimeScale(0.9);
      if (mode === 'yoga' || animationState === 'plank' || isResting) {
        upcoming.setLoop(THREE.LoopOnce, 1);
        upcoming.clampWhenFinished = true;
      } else {
        upcoming.setLoop(THREE.LoopRepeat, Infinity);
      }
    }
    activeClip.current = next;
  }, [actions, names, isResting, mode, yogaAssetId, animationState, propBinding?.mode]);

  useFrame((state, delta) => {
    mixer?.update(delta);
    if (!group.current) return;

    const target = resolveTargetPose(props);
    const dt = Math.min(delta, 0.05);
    const sway = posturalSway(state.clock.elapsedTime, swayAmp * (isResting ? 1.25 : 1));
    const cueOffsets = cueBoneOffsets(cueFlags, state.clock.elapsedTime);
    const propBones = propBinding?.boneOverlays ?? {};

    const tx = propBinding?.worldX ?? 0;
    const tz = propBinding?.worldZ ?? 0;
    const tyaw = ((propBinding?.yawDeg ?? 0) * Math.PI) / 180;
    attachTarget.current.set(tx, 0, tz);
    dampVec3(attachPos.current, attachTarget.current, 6.5, dt);
    attachYaw.current = THREE.MathUtils.damp(attachYaw.current, tyaw, 6.5, dt);
    if (attachRef.current) {
      attachRef.current.position.copy(attachPos.current);
      attachRef.current.rotation.y = attachYaw.current;
    }

    group.current.position.set(0, propBinding?.rootYBoost ?? 0, 0);
    slerpEuler(group.current, target.rootRot, dt, 5.2);

    // Drive skinned skeleton from pose library
    for (const [name, eulers] of Object.entries(target.bones)) {
      const bone = bones.get(name);
      if (!bone) continue;
      let sx = 0;
      let sy = 0;
      let sz = 0;
      if (name.includes('Spine') || name.includes('Hips')) {
        [sx, sy, sz] = sway.spine;
      } else if (name.includes('Neck') || name.includes('Head')) {
        [sx, sy, sz] = sway.head;
      }
      const cue = cueOffsets[name] ?? [0, 0, 0];
      const prop = propBones[name] ?? [0, 0, 0];
      _euler.set(
        eulers[0] + sx + cue[0] + prop[0],
        eulers[1] + sy + cue[1] + prop[1],
        eulers[2] + sz + cue[2] + prop[2],
        'XYZ'
      );
      _quat.setFromEuler(_euler);
      bone.quaternion.slerp(_quat, 1 - Math.exp(-8.2 * dt));
    }

    for (const [name, cue] of Object.entries(cueOffsets)) {
      if (target.bones[name] || propBones[name]) continue;
      const bone = bones.get(name);
      if (!bone) continue;
      _euler.set(bone.rotation.x + cue[0], bone.rotation.y + cue[1], bone.rotation.z + cue[2], 'XYZ');
      _quat.setFromEuler(_euler);
      bone.quaternion.slerp(_quat, 1 - Math.exp(-6.5 * dt));
    }

    for (const [name, prop] of Object.entries(propBones)) {
      if (target.bones[name]) continue;
      const bone = bones.get(name);
      if (!bone) continue;
      _euler.set(bone.rotation.x + prop[0], bone.rotation.y + prop[1], bone.rotation.z + prop[2], 'XYZ');
      _quat.setFromEuler(_euler);
      bone.quaternion.slerp(_quat, 1 - Math.exp(-7 * dt));
    }

    // Prop contact IK — curve limbs toward bars / blocks / mat
    group.current.updateWorldMatrix(true, true);
    const contacts = resolveIkContacts(propBinding, attachPos.current, attachYaw.current);
    applyLimbIk(bones, contacts);

    // Facial micro-expressions (bone + morph targets when present)
    facial.update(bones, facialTarget, dt, state.clock.elapsedTime);

    const b = breath.step(breathInflation(breathPhase, isBreathing), dt, 9, 6);
    const sx = 1 + b * 0.06;
    const sy = 1 + b * 0.03;
    const sz = 1 + b * 0.05;
    for (const key of ['mixamorigSpine1', 'mixamorigSpine2'] as const) {
      const bone = bones.get(key);
      if (!bone) continue;
      bone.scale.x = THREE.MathUtils.damp(bone.scale.x, sx, 5, dt);
      bone.scale.y = THREE.MathUtils.damp(bone.scale.y, sy, 5, dt);
      bone.scale.z = THREE.MathUtils.damp(bone.scale.z, sz, 5, dt);
    }

    const exertion =
      isResting || mode === 'yoga'
        ? facialTarget.exertion * 0.4
        : Math.min(1, facialTarget.exertion + progress * 0.35);
    applyMuscleDefinition(bones, exertion, dt, trainerId);

    if (mode === 'calisthenics' && !isResting && activeClip.current?.includes('_cycle')) {
      const action = actions?.[activeClip.current];
      if (action?.getClip()) {
        const dur = action.getClip().duration || 1;
        action.time = THREE.MathUtils.clamp(progress, 0, 1) * dur * 0.99;
        action.paused = true;
      }
    }

    group.current.updateWorldMatrix(true, true);
    floorBox.setFromObject(group.current);
    if (Number.isFinite(floorBox.min.y)) {
      const boost = propBinding?.rootYBoost ?? 0;
      group.current.position.y = -floorBox.min.y + boost * 0.15;
    }
  });

  return (
    <group ref={attachRef}>
      <Center bottom precise cacheKey={groundKey}>
        <group ref={group} dispose={null}>
          <primitive object={model} />
        </group>
      </Center>
    </group>
  );
}

export function CoachCharacter(props: CoachCharacterProps) {
  return (
    <Suspense key={props.trainerId} fallback={null}>
      <CoachCharacterInner {...props} />
    </Suspense>
  );
}

export function StudioSceneChrome({
  children,
  cameraTarget = [0, 1.1, 0] as [number, number, number],
  omitFloor = false,
  floorRadius = 2.6,
  orbitEnabled = true,
}: {
  children: React.ReactNode;
  cameraTarget?: [number, number, number];
  omitFloor?: boolean;
  floorRadius?: number;
  orbitEnabled?: boolean;
}) {
  return (
    <>
      <color attach="background" args={['#1a1d22']} />
      <fog attach="fog" args={['#1f242b', 10, 28]} />
      <Environment preset="warehouse" environmentIntensity={0.4} />
      <ambientLight intensity={0.22} color="#c8d0da" />
      {/* Cool-white key — industrial LED wash */}
      <directionalLight
        castShadow
        position={[2.5, 5.8, 3.2]}
        intensity={1.15}
        color="#e8f0ff"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00015}
        shadow-normalBias={0.025}
        shadow-camera-far={24}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight position={[-4, 3.5, -2]} intensity={0.35} color="#94a3b8" />
      <directionalLight position={[0, 2.5, 5]} intensity={0.25} color="#cbd5e1" />
      {/* Window fill — soft daylight from ribbon glazing */}
      <directionalLight position={[6, 3.2, 0]} intensity={0.45} color="#b8c9b5" />
      {!omitFloor && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <circleGeometry args={[floorRadius, 64]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.92} metalness={0.05} />
        </mesh>
      )}
      {children}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.65} scale={14} blur={2.4} far={6} color="#0a0a0a" />
      <OrbitControls
        makeDefault
        enabled={orbitEnabled}
        enablePan={false}
        enableZoom
        enableDamping
        dampingFactor={0.05}
        minDistance={2.2}
        maxDistance={9}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={cameraTarget}
      />
    </>
  );
}
