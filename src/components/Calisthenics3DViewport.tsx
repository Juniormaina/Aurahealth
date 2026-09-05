import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { MovementPattern } from '../content/calisthenicsProgram';
import {
  AnimationState,
  MuscleGroup,
  TempoPhase,
  motionProgress,
  phaseLabel,
  resolveExercise3DConfig,
} from '../content/calisthenicsExercises3D';

export interface Calisthenics3DViewportProps {
  exerciseId?: string;
  exerciseName?: string;
  pattern?: MovementPattern;
  tempo?: string;
  isHold?: boolean;
  isResting?: boolean;
  setIndex: number;
  targetSets: number;
  repCount: number;
  targetRepsLabel?: string;
  phase: TempoPhase;
  phaseLeft: number;
  phaseTotal: number;
  label?: string;
  className?: string;
}

interface JointPose {
  torso: [number, number, number];
  head: [number, number, number];
  leftArm: [number, number, number];
  rightArm: [number, number, number];
  leftLeg: [number, number, number];
  rightLeg: [number, number, number];
  rootY: number;
  rootRot: [number, number, number];
}

const DEG = Math.PI / 180;

/** A = top / extended, B = bottom / compressed for each animation family. */
const POSE_A: Record<AnimationState, JointPose> = {
  idle: {
    torso: [0, 0, 0],
    head: [0, 0, 0],
    leftArm: [0, 0, 14 * DEG],
    rightArm: [0, 0, -14 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: 0,
    rootRot: [0, 0, 0],
  },
  rest: {
    torso: [0, 0, 0],
    head: [0, 8 * DEG, 0],
    leftArm: [20 * DEG, 0, 35 * DEG],
    rightArm: [-15 * DEG, 0, -40 * DEG],
    leftLeg: [0, 0, 8 * DEG],
    rightLeg: [0, 0, -8 * DEG],
    rootY: 0,
    rootRot: [0, 12 * DEG, 0],
  },
  push_up: {
    torso: [90 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [-90 * DEG, 0, 12 * DEG],
    rightArm: [-90 * DEG, 0, -12 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: 0.55,
    rootRot: [0, 0, 0],
  },
  pike_press: {
    torso: [55 * DEG, 0, 0],
    head: [25 * DEG, 0, 0],
    leftArm: [-100 * DEG, 0, 10 * DEG],
    rightArm: [-100 * DEG, 0, -10 * DEG],
    leftLeg: [-40 * DEG, 0, 0],
    rightLeg: [-40 * DEG, 0, 0],
    rootY: 0.25,
    rootRot: [0, 0, 0],
  },
  pull_up: {
    torso: [0, 0, 0],
    head: [0, 0, 0],
    leftArm: [-160 * DEG, 0, 20 * DEG],
    rightArm: [-160 * DEG, 0, -20 * DEG],
    leftLeg: [10 * DEG, 0, 8 * DEG],
    rightLeg: [10 * DEG, 0, -8 * DEG],
    rootY: 0.35,
    rootRot: [0, 0, 0],
  },
  hang: {
    torso: [0, 0, 0],
    head: [0, 0, 0],
    leftArm: [-170 * DEG, 0, 15 * DEG],
    rightArm: [-170 * DEG, 0, -15 * DEG],
    leftLeg: [5 * DEG, 0, 6 * DEG],
    rightLeg: [5 * DEG, 0, -6 * DEG],
    rootY: 0.45,
    rootRot: [0, 0, 0],
  },
  row: {
    torso: [75 * DEG, 0, 0],
    head: [10 * DEG, 0, 0],
    leftArm: [-70 * DEG, 0, 15 * DEG],
    rightArm: [-70 * DEG, 0, -15 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: 0.35,
    rootRot: [0, 0, 0],
  },
  squat: {
    torso: [8 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [0, 0, 25 * DEG],
    rightArm: [0, 0, -25 * DEG],
    leftLeg: [15 * DEG, 0, 0],
    rightLeg: [15 * DEG, 0, 0],
    rootY: 0,
    rootRot: [0, 0, 0],
  },
  pistol_squat: {
    torso: [10 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [0, 0, 30 * DEG],
    rightArm: [-40 * DEG, 0, -20 * DEG],
    leftLeg: [20 * DEG, 0, 0],
    rightLeg: [-25 * DEG, 0, 0],
    rootY: 0,
    rootRot: [0, 0, 0],
  },
  split_squat: {
    torso: [5 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [0, 0, 18 * DEG],
    rightArm: [0, 0, -18 * DEG],
    leftLeg: [25 * DEG, 0, 0],
    rightLeg: [-20 * DEG, 0, 0],
    rootY: -0.05,
    rootRot: [0, 0, 0],
  },
  bridge: {
    torso: [-15 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [0, 0, 20 * DEG],
    rightArm: [0, 0, -20 * DEG],
    leftLeg: [50 * DEG, 0, 0],
    rightLeg: [50 * DEG, 0, 0],
    rootY: -0.35,
    rootRot: [0, 0, 0],
  },
  dip: {
    torso: [5 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [-40 * DEG, 0, 55 * DEG],
    rightArm: [-40 * DEG, 0, -55 * DEG],
    leftLeg: [15 * DEG, 0, 8 * DEG],
    rightLeg: [15 * DEG, 0, -8 * DEG],
    rootY: 0.2,
    rootRot: [0, 0, 0],
  },
  muscle_up: {
    torso: [0, 0, 0],
    head: [0, 0, 0],
    leftArm: [-150 * DEG, 0, 18 * DEG],
    rightArm: [-150 * DEG, 0, -18 * DEG],
    leftLeg: [20 * DEG, 0, 10 * DEG],
    rightLeg: [20 * DEG, 0, -10 * DEG],
    rootY: 0.3,
    rootRot: [0, 0, 0],
  },
  plank: {
    torso: [90 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [-90 * DEG, 0, 8 * DEG],
    rightArm: [-90 * DEG, 0, -8 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: 0.4,
    rootRot: [0, 0, 0],
  },
  knee_raise: {
    torso: [0, 0, 0],
    head: [0, 0, 0],
    leftArm: [-170 * DEG, 0, 12 * DEG],
    rightArm: [-170 * DEG, 0, -12 * DEG],
    leftLeg: [20 * DEG, 0, 5 * DEG],
    rightLeg: [20 * DEG, 0, -5 * DEG],
    rootY: 0.4,
    rootRot: [0, 0, 0],
  },
  mobility: {
    torso: [15 * DEG, 0, 0],
    head: [0, 10 * DEG, 0],
    leftArm: [-80 * DEG, 0, 25 * DEG],
    rightArm: [30 * DEG, 0, -35 * DEG],
    leftLeg: [40 * DEG, 0, 10 * DEG],
    rightLeg: [0, 0, -8 * DEG],
    rootY: -0.15,
    rootRot: [0, 0, 0],
  },
};

const POSE_B: Record<AnimationState, JointPose> = {
  idle: POSE_A.idle,
  rest: POSE_A.rest,
  push_up: {
    torso: [90 * DEG, 0, 0],
    head: [5 * DEG, 0, 0],
    leftArm: [-45 * DEG, 0, 25 * DEG],
    rightArm: [-45 * DEG, 0, -25 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: 0.22,
    rootRot: [0, 0, 0],
  },
  pike_press: {
    torso: [70 * DEG, 0, 0],
    head: [35 * DEG, 0, 0],
    leftArm: [-55 * DEG, 0, 18 * DEG],
    rightArm: [-55 * DEG, 0, -18 * DEG],
    leftLeg: [-35 * DEG, 0, 0],
    rightLeg: [-35 * DEG, 0, 0],
    rootY: 0.1,
    rootRot: [0, 0, 0],
  },
  pull_up: {
    torso: [8 * DEG, 0, 0],
    head: [-5 * DEG, 0, 0],
    leftArm: [-95 * DEG, 0, 35 * DEG],
    rightArm: [-95 * DEG, 0, -35 * DEG],
    leftLeg: [25 * DEG, 0, 10 * DEG],
    rightLeg: [25 * DEG, 0, -10 * DEG],
    rootY: 0.75,
    rootRot: [0, 0, 0],
  },
  hang: {
    torso: [5 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [-120 * DEG, 0, 25 * DEG],
    rightArm: [-120 * DEG, 0, -25 * DEG],
    leftLeg: [10 * DEG, 0, 6 * DEG],
    rightLeg: [10 * DEG, 0, -6 * DEG],
    rootY: 0.55,
    rootRot: [0, 0, 0],
  },
  row: {
    torso: [70 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [-110 * DEG, 0, 25 * DEG],
    rightArm: [-110 * DEG, 0, -25 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: 0.55,
    rootRot: [0, 0, 0],
  },
  squat: {
    torso: [18 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [20 * DEG, 0, 30 * DEG],
    rightArm: [20 * DEG, 0, -30 * DEG],
    leftLeg: [95 * DEG, 0, 0],
    rightLeg: [95 * DEG, 0, 0],
    rootY: -0.45,
    rootRot: [0, 0, 0],
  },
  pistol_squat: {
    torso: [22 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [25 * DEG, 0, 35 * DEG],
    rightArm: [-50 * DEG, 0, -25 * DEG],
    leftLeg: [105 * DEG, 0, 0],
    rightLeg: [-40 * DEG, 0, 0],
    rootY: -0.5,
    rootRot: [0, 0, 0],
  },
  split_squat: {
    torso: [12 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [10 * DEG, 0, 22 * DEG],
    rightArm: [10 * DEG, 0, -22 * DEG],
    leftLeg: [95 * DEG, 0, 0],
    rightLeg: [-35 * DEG, 0, 0],
    rootY: -0.35,
    rootRot: [0, 0, 0],
  },
  bridge: {
    torso: [-35 * DEG, 0, 0],
    head: [10 * DEG, 0, 0],
    leftArm: [0, 0, 25 * DEG],
    rightArm: [0, 0, -25 * DEG],
    leftLeg: [70 * DEG, 0, 0],
    rightLeg: [70 * DEG, 0, 0],
    rootY: -0.05,
    rootRot: [0, 0, 0],
  },
  dip: {
    torso: [18 * DEG, 0, 0],
    head: [5 * DEG, 0, 0],
    leftArm: [15 * DEG, 0, 70 * DEG],
    rightArm: [15 * DEG, 0, -70 * DEG],
    leftLeg: [25 * DEG, 0, 10 * DEG],
    rightLeg: [25 * DEG, 0, -10 * DEG],
    rootY: -0.05,
    rootRot: [0, 0, 0],
  },
  muscle_up: {
    torso: [-8 * DEG, 0, 0],
    head: [-5 * DEG, 0, 0],
    leftArm: [-40 * DEG, 0, 45 * DEG],
    rightArm: [-40 * DEG, 0, -45 * DEG],
    leftLeg: [35 * DEG, 0, 12 * DEG],
    rightLeg: [35 * DEG, 0, -12 * DEG],
    rootY: 0.85,
    rootRot: [0, 0, 0],
  },
  plank: {
    torso: [90 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [-90 * DEG, 0, 8 * DEG],
    rightArm: [-90 * DEG, 0, -8 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: 0.38,
    rootRot: [0, 0, 0],
  },
  knee_raise: {
    torso: [8 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [-170 * DEG, 0, 12 * DEG],
    rightArm: [-170 * DEG, 0, -12 * DEG],
    leftLeg: [95 * DEG, 0, 8 * DEG],
    rightLeg: [95 * DEG, 0, -8 * DEG],
    rootY: 0.4,
    rootRot: [0, 0, 0],
  },
  mobility: {
    torso: [35 * DEG, 15 * DEG, 0],
    head: [0, 20 * DEG, 0],
    leftArm: [-110 * DEG, 0, 30 * DEG],
    rightArm: [50 * DEG, 0, -40 * DEG],
    leftLeg: [70 * DEG, 0, 15 * DEG],
    rightLeg: [10 * DEG, 0, -10 * DEG],
    rootY: -0.25,
    rootRot: [0, 8 * DEG, 0],
  },
};

const MUSCLE_LOCAL: Record<MuscleGroup, [number, number, number]> = {
  chest: [0, 0.38, 0.14],
  front_delts: [0.22, 0.55, 0.1],
  rear_delts: [0.22, 0.55, -0.1],
  triceps: [0.28, 0.22, -0.04],
  biceps: [0.28, 0.22, 0.08],
  lats: [0.16, 0.28, -0.1],
  upper_back: [0, 0.42, -0.14],
  core: [0, 0.12, 0.12],
  quads: [0.14, -0.4, 0.1],
  hamstrings: [0.14, -0.4, -0.1],
  glutes: [0, -0.12, -0.12],
  calves: [0.12, -0.75, -0.04],
  shoulders: [0.26, 0.58, 0],
};

const BODY = '#64748b';
const BODY_DEEP = '#475569';
const SKIN = '#94a3b8';
const ACCENT = '#38bdf8';

function lerpTriplet(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    THREE.MathUtils.lerp(a[0], b[0], t),
    THREE.MathUtils.lerp(a[1], b[1], t),
    THREE.MathUtils.lerp(a[2], b[2], t),
  ];
}

function blendPose(a: JointPose, b: JointPose, t: number): JointPose {
  return {
    torso: lerpTriplet(a.torso, b.torso, t),
    head: lerpTriplet(a.head, b.head, t),
    leftArm: lerpTriplet(a.leftArm, b.leftArm, t),
    rightArm: lerpTriplet(a.rightArm, b.rightArm, t),
    leftLeg: lerpTriplet(a.leftLeg, b.leftLeg, t),
    rightLeg: lerpTriplet(a.rightLeg, b.rightLeg, t),
    rootY: THREE.MathUtils.lerp(a.rootY, b.rootY, t),
    rootRot: lerpTriplet(a.rootRot, b.rootRot, t),
  };
}

function applyEuler(obj: THREE.Object3D, e: [number, number, number], alpha: number) {
  obj.rotation.x = THREE.MathUtils.lerp(obj.rotation.x, e[0], alpha);
  obj.rotation.y = THREE.MathUtils.lerp(obj.rotation.y, e[1], alpha);
  obj.rotation.z = THREE.MathUtils.lerp(obj.rotation.z, e[2], alpha);
}

function Limb({ length = 0.42, radius = 0.07, color = BODY }: { length?: number; radius?: number; color?: string }) {
  return (
    <mesh castShadow position={[0, -length / 2, 0]}>
      <capsuleGeometry args={[radius, length, 6, 12]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
    </mesh>
  );
}

function MuscleHotspot({
  group,
  primary,
  secondary,
  tension,
}: {
  group: MuscleGroup;
  primary: MuscleGroup[];
  secondary: MuscleGroup[];
  tension: number;
}) {
  const matA = useRef<THREE.MeshStandardMaterial>(null);
  const matB = useRef<THREE.MeshStandardMaterial>(null);
  const isPrimary = primary.includes(group);
  const isSecondary = secondary.includes(group);
  const active = isPrimary || isSecondary;
  const base = isPrimary ? 0.55 : 0.28;
  const pos = MUSCLE_LOCAL[group];
  const mirrorX =
    group === 'front_delts' ||
    group === 'rear_delts' ||
    group === 'triceps' ||
    group === 'biceps' ||
    group === 'lats' ||
    group === 'quads' ||
    group === 'hamstrings' ||
    group === 'calves' ||
    group === 'shoulders';

  useFrame(() => {
    if (!active) return;
    const pulse = base + tension * (isPrimary ? 0.85 : 0.45);
    if (matA.current) {
      matA.current.emissiveIntensity = THREE.MathUtils.lerp(matA.current.emissiveIntensity, pulse, 0.12);
    }
    if (matB.current) {
      matB.current.emissiveIntensity = THREE.MathUtils.lerp(matB.current.emissiveIntensity, pulse, 0.12);
    }
  });

  if (!active) return null;

  const spots: Array<{ pos: [number, number, number]; ref: typeof matA }> = [
    { pos: [pos[0], pos[1], pos[2]], ref: matA },
  ];
  if (mirrorX) spots.push({ pos: [-pos[0], pos[1], pos[2]], ref: matB });

  return (
    <>
      {spots.map((s, i) => (
        <mesh key={`${group}-${i}`} position={s.pos}>
          <sphereGeometry args={[isPrimary ? 0.07 : 0.055, 12, 12]} />
          <meshStandardMaterial
            ref={s.ref}
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={base}
            transparent
            opacity={0.75}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      ))}
    </>
  );
}

function AthleteMesh({
  animationState,
  progress,
  primaryMuscles,
  secondaryMuscles,
  tension,
}: {
  animationState: AnimationState;
  progress: number;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  tension: number;
}) {
  const target = useMemo(
    () => blendPose(POSE_A[animationState], POSE_B[animationState], progress),
    [animationState, progress]
  );

  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const a = 1 - Math.exp(-6 * delta);
    if (!root.current || !torso.current || !head.current) return;
    if (!leftArm.current || !rightArm.current || !leftLeg.current || !rightLeg.current) return;

    root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, target.rootY, a);
    applyEuler(root.current, target.rootRot, a);
    applyEuler(torso.current, target.torso, a);
    applyEuler(head.current, target.head, a);
    applyEuler(leftArm.current, target.leftArm, a);
    applyEuler(rightArm.current, target.rightArm, a);
    applyEuler(leftLeg.current, target.leftLeg, a);
    applyEuler(rightLeg.current, target.rightLeg, a);
  });

  const muscles = useMemo(
    () => Array.from(new Set([...primaryMuscles, ...secondaryMuscles])),
    [primaryMuscles, secondaryMuscles]
  );

  return (
    <group ref={root}>
      <group ref={leftLeg} position={[-0.14, 0.95, 0]}>
        <Limb length={0.55} radius={0.075} />
      </group>
      <group ref={rightLeg} position={[0.14, 0.95, 0]}>
        <Limb length={0.55} radius={0.075} />
      </group>

      <group ref={torso} position={[0, 1.05, 0]}>
        <mesh castShadow position={[0, 0.35, 0]}>
          <capsuleGeometry args={[0.16, 0.45, 8, 16]} />
          <meshStandardMaterial color={BODY_DEEP} roughness={0.45} metalness={0.25} />
        </mesh>

        <group ref={leftArm} position={[-0.22, 0.55, 0]}>
          <Limb length={0.4} radius={0.055} color={BODY} />
        </group>
        <group ref={rightArm} position={[0.22, 0.55, 0]}>
          <Limb length={0.4} radius={0.055} color={BODY} />
        </group>

        <group ref={head} position={[0, 0.78, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.14, 24, 24]} />
            <meshStandardMaterial color={SKIN} roughness={0.4} metalness={0.08} />
          </mesh>
        </group>

        {muscles.map((m) => (
          <MuscleHotspot
            key={m}
            group={m}
            primary={primaryMuscles}
            secondary={secondaryMuscles}
            tension={tension}
          />
        ))}
      </group>
    </group>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <circleGeometry args={[2.4, 48]} />
      <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.05} />
    </mesh>
  );
}

function Scene({
  animationState,
  progress,
  primaryMuscles,
  secondaryMuscles,
  tension,
}: {
  animationState: AnimationState;
  progress: number;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  tension: number;
}) {
  return (
    <>
      <color attach="background" args={['#0b192c']} />
      <fog attach="fog" args={['#0b192c', 5.5, 14]} />
      <ambientLight intensity={0.5} color="#cbd5e1" />
      <directionalLight castShadow position={[3.5, 6, 2]} intensity={1.25} color="#f8fafc" shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-2.2, 2.2, -1]} intensity={0.4} color="#38bdf8" />
      <Floor />
      <AthleteMesh
        animationState={animationState}
        progress={progress}
        primaryMuscles={primaryMuscles}
        secondaryMuscles={secondaryMuscles}
        tension={tension}
      />
      <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={6} blur={2.5} far={4} color="#020617" />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={2.2}
        maxDistance={6}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.85, 0]}
      />
    </>
  );
}

export const Calisthenics3DViewport: React.FC<Calisthenics3DViewportProps> = ({
  exerciseId,
  exerciseName,
  pattern,
  tempo,
  isHold,
  isResting = false,
  setIndex,
  targetSets,
  repCount,
  targetRepsLabel,
  phase,
  phaseLeft,
  phaseTotal,
  label,
  className = '',
}) => {
  const config = useMemo(
    () =>
      resolveExercise3DConfig({
        exerciseId,
        pattern,
        name: exerciseName,
        isHold,
        tempo,
      }),
    [exerciseId, pattern, exerciseName, isHold, tempo]
  );

  const animationState: AnimationState = isResting ? 'rest' : config.animationState;
  const phaseElapsed = Math.max(0, phaseTotal - phaseLeft);
  const progress = isResting ? 0 : motionProgress(phase, phaseElapsed, phaseTotal || 1);

  // Eccentric and bottom pause carry higher tissue tension for highlight intensity
  const tension = isResting
    ? 0.15
    : phase === 'eccentric'
      ? 0.55 + progress * 0.45
      : phase === 'pause_bottom'
        ? 1
        : phase === 'concentric'
          ? 0.7 - progress * 0.25
          : phase === 'hold'
            ? 0.75
            : 0.35;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-b from-[#12263f] to-[#0b192c] ${className}`}
      style={{ minHeight: '14rem' }}
    >
      <div className="absolute inset-0 h-56 sm:h-64">
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [2.5, 1.85, 3.3], fov: 38, near: 0.1, far: 40 }}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <Scene
              animationState={animationState}
              progress={progress}
              primaryMuscles={config.primaryMuscles}
              secondaryMuscles={config.secondaryMuscles}
              tension={tension}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none relative z-10 flex h-56 sm:h-64 flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-md bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-200/90 backdrop-blur-sm">
            {label ?? (isResting ? 'Recovery' : 'Biomechanics · live')}
          </span>
          <span className="rounded-md bg-slate-950/55 px-2 py-1 text-[10px] font-medium tabular-nums text-slate-100/90 backdrop-blur-sm">
            Set {setIndex + 1}/{targetSets}
            {!isHold && !isResting ? ` · Rep ${repCount}` : ''}
            {targetRepsLabel && !isResting ? ` · ${targetRepsLabel}` : ''}
          </span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-300/80">
              {isResting ? 'Rest' : phaseLabel(phase)}
              {!isResting && phaseTotal > 0 ? ` · ${phaseLeft}s` : ''}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 max-w-[70%] truncate">
              {exerciseName ?? config.displayName}
            </p>
          </div>
          <p className="text-[10px] text-slate-500">Drag · zoom</p>
        </div>
      </div>
    </div>
  );
};
