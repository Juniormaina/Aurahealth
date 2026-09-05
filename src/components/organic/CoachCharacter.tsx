import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Center, ContactShadows, OrbitControls, useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { AnimationState } from '../../content/calisthenicsExercises3D';
import {
  BreathPhase,
  EMERALD,
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

export type CoachMotionMode = 'calisthenics' | 'yoga';

export interface CoachCharacterProps {
  mode: CoachMotionMode;
  trainerId: TrainerId;
  animationState?: AnimationState;
  /** 0 = extended (A), 1 = bottom (B) for tempo-driven calisthenics */
  progress?: number;
  yogaAssetId?: string;
  /** On-screen instructional text — drives procedural cue overlays. */
  instructionCue?: string;
  poseName?: string;
  breathPhase?: BreathPhase;
  isBreathing?: boolean;
  isResting?: boolean;
  swayAmp?: number;
}

const _euler = new THREE.Euler();
const _quat = new THREE.Quaternion();

useGLTF.preload(TRAINER_MODELS.aura.url);
useGLTF.preload(TRAINER_MODELS.aurora.url);

function styleTrainerMaterials(root: THREE.Object3D, trainerId: TrainerId) {
  const outfit = TRAINER_MODELS[trainerId].outfit;
  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const retint = (orig: THREE.Material): THREE.Material => {
      if (!(orig as THREE.MeshStandardMaterial).isMeshStandardMaterial) return orig;
      const mat = (orig as THREE.MeshStandardMaterial).clone();
      const name = `${mesh.name} ${mat.name}`.toLowerCase();
      const isSkin = /skin|face|head|body/.test(name) && !/shirt|pant|shoe|hair|suit|vest/.test(name);
      if (isSkin) {
        mat.color.set(trainerId === 'aurora' ? '#e8b898' : '#c68642');
        mat.roughness = 0.44;
        mat.metalness = 0.04;
      } else if (/hair/.test(name)) {
        mat.color.set(trainerId === 'aurora' ? '#1c1917' : '#0b3d2e');
        mat.roughness = 0.72;
      } else if (outfit === 'yoga') {
        // Aurora: standardized yoga outfit — deep emerald set
        mat.color.set(/pant|leg|short|shoe/.test(name) ? '#022c22' : '#064e3b');
        mat.emissive.set(EMERALD.accent);
        mat.emissiveIntensity = 0.035;
        mat.roughness = 0.4;
        mat.metalness = 0.14;
      } else {
        // Aura: gym vest + shorts
        mat.color.set(/pant|leg|short|shoe/.test(name) ? '#134e4a' : '#059669');
        mat.emissive.set(EMERALD.accent);
        mat.emissiveIntensity = 0.04;
        mat.roughness = 0.38;
        mat.metalness = 0.16;
      }
      mat.needsUpdate = true;
      return mat;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(retint) : retint(mesh.material);
  });
}

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
  } = props;

  const modelUrl = TRAINER_MODELS[trainerId].url;
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);

  const model = useMemo(() => {
    const cloned = cloneSkinned(scene) as THREE.Object3D;
    styleTrainerMaterials(cloned, trainerId);
    if (trainerId === 'aurora') cloned.scale.set(0.96, 0.98, 0.96);
    else cloned.scale.set(1, 1, 1);
    return cloned;
  }, [scene, trainerId]);

  const bones = useMemo(() => collectBones(model), [model]);

  const cueFlags = useMemo(
    () => parseCueMotion(instructionCue, poseName, yogaAssetId),
    [instructionCue, poseName, yogaAssetId]
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
  const groundKey = `${trainerId}-${mode}-${animationState}-${yogaAssetId ?? ''}-${isResting}-${Math.round(progress * 12)}`;

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
    if (prev) prev.fadeOut(0.45);
    if (upcoming) {
      upcoming.reset().fadeIn(0.5).play();
      upcoming.setEffectiveWeight(0.35);
      upcoming.setEffectiveTimeScale(0.85);
      if (mode === 'yoga' || animationState === 'plank' || isResting) {
        upcoming.setLoop(THREE.LoopOnce, 1);
        upcoming.clampWhenFinished = true;
      } else {
        upcoming.setLoop(THREE.LoopRepeat, Infinity);
      }
    }
    activeClip.current = next;
  }, [actions, names, isResting, mode, yogaAssetId, animationState]);

  useFrame((state, delta) => {
    mixer?.update(delta);
    if (!group.current) return;

    const target = resolveTargetPose(props);
    const dt = Math.min(delta, 0.05);
    const sway = posturalSway(state.clock.elapsedTime, swayAmp * (isResting ? 1.25 : 1));
    const cueOffsets = cueBoneOffsets(cueFlags, state.clock.elapsedTime);

    group.current.position.set(0, 0, 0);
    slerpEuler(group.current, target.rootRot, dt, 5.2);

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
      _euler.set(eulers[0] + sx + cue[0], eulers[1] + sy + cue[1], eulers[2] + sz + cue[2], 'XYZ');
      _quat.setFromEuler(_euler);
      bone.quaternion.slerp(_quat, 1 - Math.exp(-8.2 * dt));
    }

    // Cue overlays for bones not in the base pose map (e.g. extra foot pedal on standing)
    for (const [name, cue] of Object.entries(cueOffsets)) {
      if (target.bones[name]) continue;
      const bone = bones.get(name);
      if (!bone) continue;
      _euler.set(bone.rotation.x + cue[0], bone.rotation.y + cue[1], bone.rotation.z + cue[2], 'XYZ');
      _quat.setFromEuler(_euler);
      bone.quaternion.slerp(_quat, 1 - Math.exp(-6.5 * dt));
    }

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

    if (mode === 'calisthenics' && !isResting && activeClip.current?.includes('_cycle')) {
      const action = actions?.[activeClip.current];
      if (action?.getClip()) {
        const dur = action.getClip().duration || 1;
        action.time = THREE.MathUtils.clamp(progress, 0, 1) * dur * 0.99;
        action.paused = true;
      }
    }

    // Floor collision — lowest vertices on Y=0 regardless of pose
    group.current.updateWorldMatrix(true, true);
    floorBox.setFromObject(group.current);
    if (Number.isFinite(floorBox.min.y)) {
      group.current.position.y = -floorBox.min.y;
    }
  });

  return (
    <Center bottom precise cacheKey={groundKey}>
      <group ref={group} dispose={null}>
        <primitive object={model} />
      </group>
    </Center>
  );
}

export function CoachCharacter(props: CoachCharacterProps) {
  return (
    <Suspense fallback={null}>
      <CoachCharacterInner key={props.trainerId} {...props} />
    </Suspense>
  );
}

export function StudioSceneChrome({
  children,
  cameraTarget = [0, 1, 0] as [number, number, number],
}: {
  children: React.ReactNode;
  cameraTarget?: [number, number, number];
}) {
  return (
    <>
      <color attach="background" args={[EMERALD.bgDeep]} />
      <fog attach="fog" args={[EMERALD.fog, 5, 14]} />
      <ambientLight intensity={0.42} color="#a7f3d0" />
      <directionalLight
        castShadow
        position={[3.5, 6.2, 2.8]}
        intensity={1.35}
        color="#ecfdf5"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-3, 3.5, -2]} intensity={0.45} color={EMERALD.rim} />
      <pointLight position={[0.4, 2.2, 1.8]} intensity={0.65} color={EMERALD.accent} distance={9} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[2.6, 64]} />
        <meshStandardMaterial color={EMERALD.bgMid} roughness={0.9} metalness={0.05} />
      </mesh>
      {children}
      <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={7} blur={2} far={4.5} color={EMERALD.bgDeep} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={6.5}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2}
        target={cameraTarget}
      />
    </>
  );
}
