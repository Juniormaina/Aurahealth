import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

type BreathPhase = 'inhale' | 'hold_top' | 'exhale' | 'hold_bottom' | 'idle';

export interface Yoga3DViewportProps {
  animationAssetId: string;
  poseName?: string;
  breathPhase?: BreathPhase;
  isBreathing?: boolean;
  label?: string;
  className?: string;
}

type PoseFamily =
  | 'standing'
  | 'fold'
  | 'half_fold'
  | 'chair'
  | 'warrior'
  | 'triangle'
  | 'tree'
  | 'down_dog'
  | 'plank'
  | 'chaturanga'
  | 'up_dog'
  | 'cobra'
  | 'child'
  | 'seated_fold'
  | 'butterfly'
  | 'twist'
  | 'lunge'
  | 'legs_up'
  | 'savasana'
  | 'breath';

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

function familyFromAsset(id: string): PoseFamily {
  if (id.includes('breath')) return 'breath';
  if (id.includes('uttanasana') && id.includes('ardha')) return 'half_fold';
  if (id.includes('uttanasana')) return 'fold';
  if (id.includes('utkatasana')) return 'chair';
  if (id.includes('warrior')) return 'warrior';
  if (id.includes('trikonasana')) return 'triangle';
  if (id.includes('tree')) return 'tree';
  if (id.includes('down_dog')) return 'down_dog';
  if (id.includes('plank')) return 'plank';
  if (id.includes('chaturanga')) return 'chaturanga';
  if (id.includes('up_dog')) return 'up_dog';
  if (id.includes('cobra')) return 'cobra';
  if (id.includes('child')) return 'child';
  if (id.includes('seated_fold')) return 'seated_fold';
  if (id.includes('butterfly')) return 'butterfly';
  if (id.includes('twist')) return 'twist';
  if (id.includes('lunge')) return 'lunge';
  if (id.includes('legs_up')) return 'legs_up';
  if (id.includes('savasana')) return 'savasana';
  return 'standing';
}

const DEG = Math.PI / 180;

const POSES: Record<PoseFamily, JointPose> = {
  standing: {
    torso: [0, 0, 0],
    head: [0, 0, 0],
    leftArm: [0, 0, 12 * DEG],
    rightArm: [0, 0, -12 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: 0,
    rootRot: [0, 0, 0],
  },
  chair: {
    torso: [8 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [-140 * DEG, 0, 20 * DEG],
    rightArm: [-140 * DEG, 0, -20 * DEG],
    leftLeg: [55 * DEG, 0, 0],
    rightLeg: [55 * DEG, 0, 0],
    rootY: -0.15,
    rootRot: [0, 0, 0],
  },
  fold: {
    torso: [95 * DEG, 0, 0],
    head: [20 * DEG, 0, 0],
    leftArm: [20 * DEG, 0, 15 * DEG],
    rightArm: [20 * DEG, 0, -15 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: -0.05,
    rootRot: [0, 0, 0],
  },
  half_fold: {
    torso: [55 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [-90 * DEG, 0, 0],
    rightArm: [-90 * DEG, 0, 0],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: 0,
    rootRot: [0, 0, 0],
  },
  warrior: {
    torso: [0, 15 * DEG, 0],
    head: [0, 10 * DEG, 0],
    leftArm: [-170 * DEG, 0, 10 * DEG],
    rightArm: [-170 * DEG, 0, -10 * DEG],
    leftLeg: [70 * DEG, 0, 0],
    rightLeg: [-20 * DEG, 0, 0],
    rootY: -0.08,
    rootRot: [0, -20 * DEG, 0],
  },
  triangle: {
    torso: [0, 0, 55 * DEG],
    head: [0, 0, -20 * DEG],
    leftArm: [0, 0, 90 * DEG],
    rightArm: [0, 0, -90 * DEG],
    leftLeg: [0, 0, 25 * DEG],
    rightLeg: [0, 0, -25 * DEG],
    rootY: 0,
    rootRot: [0, 0, 0],
  },
  tree: {
    torso: [0, 0, 0],
    head: [0, 0, 0],
    leftArm: [-160 * DEG, 0, 25 * DEG],
    rightArm: [-160 * DEG, 0, -25 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [55 * DEG, 0, 70 * DEG],
    rootY: 0,
    rootRot: [0, 0, 0],
  },
  down_dog: {
    torso: [70 * DEG, 0, 0],
    head: [30 * DEG, 0, 0],
    leftArm: [-50 * DEG, 0, 15 * DEG],
    rightArm: [-50 * DEG, 0, -15 * DEG],
    leftLeg: [-35 * DEG, 0, 0],
    rightLeg: [-35 * DEG, 0, 0],
    rootY: 0.2,
    rootRot: [0, 0, 0],
  },
  plank: {
    torso: [90 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [-90 * DEG, 0, 10 * DEG],
    rightArm: [-90 * DEG, 0, -10 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: 0.55,
    rootRot: [0, 0, 0],
  },
  chaturanga: {
    torso: [90 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [-45 * DEG, 0, 20 * DEG],
    rightArm: [-45 * DEG, 0, -20 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: 0.25,
    rootRot: [0, 0, 0],
  },
  up_dog: {
    torso: [-25 * DEG, 0, 0],
    head: [-15 * DEG, 0, 0],
    leftArm: [-70 * DEG, 0, 15 * DEG],
    rightArm: [-70 * DEG, 0, -15 * DEG],
    leftLeg: [10 * DEG, 0, 0],
    rightLeg: [10 * DEG, 0, 0],
    rootY: -0.2,
    rootRot: [0, 0, 0],
  },
  cobra: {
    torso: [-35 * DEG, 0, 0],
    head: [-10 * DEG, 0, 0],
    leftArm: [-40 * DEG, 0, 25 * DEG],
    rightArm: [-40 * DEG, 0, -25 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: -0.35,
    rootRot: [0, 0, 0],
  },
  child: {
    torso: [55 * DEG, 0, 0],
    head: [40 * DEG, 0, 0],
    leftArm: [40 * DEG, 0, 40 * DEG],
    rightArm: [40 * DEG, 0, -40 * DEG],
    leftLeg: [120 * DEG, 0, 15 * DEG],
    rightLeg: [120 * DEG, 0, -15 * DEG],
    rootY: -0.45,
    rootRot: [0, 0, 0],
  },
  seated_fold: {
    torso: [70 * DEG, 0, 0],
    head: [25 * DEG, 0, 0],
    leftArm: [30 * DEG, 0, 10 * DEG],
    rightArm: [30 * DEG, 0, -10 * DEG],
    leftLeg: [90 * DEG, 0, 0],
    rightLeg: [90 * DEG, 0, 0],
    rootY: -0.55,
    rootRot: [0, 0, 0],
  },
  butterfly: {
    torso: [15 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [20 * DEG, 0, 30 * DEG],
    rightArm: [20 * DEG, 0, -30 * DEG],
    leftLeg: [70 * DEG, 0, 55 * DEG],
    rightLeg: [70 * DEG, 0, -55 * DEG],
    rootY: -0.55,
    rootRot: [0, 0, 0],
  },
  twist: {
    torso: [10 * DEG, 45 * DEG, 0],
    head: [0, 25 * DEG, 0],
    leftArm: [-40 * DEG, 30 * DEG, 20 * DEG],
    rightArm: [-40 * DEG, -30 * DEG, -20 * DEG],
    leftLeg: [90 * DEG, 0, 10 * DEG],
    rightLeg: [90 * DEG, 0, -10 * DEG],
    rootY: -0.55,
    rootRot: [0, 0, 0],
  },
  lunge: {
    torso: [5 * DEG, 0, 0],
    head: [0, 0, 0],
    leftArm: [-160 * DEG, 0, 15 * DEG],
    rightArm: [-160 * DEG, 0, -15 * DEG],
    leftLeg: [80 * DEG, 0, 0],
    rightLeg: [-15 * DEG, 0, 0],
    rootY: -0.2,
    rootRot: [0, 0, 0],
  },
  legs_up: {
    torso: [0, 0, 0],
    head: [0, 0, 0],
    leftArm: [0, 0, 25 * DEG],
    rightArm: [0, 0, -25 * DEG],
    leftLeg: [-95 * DEG, 0, 8 * DEG],
    rightLeg: [-95 * DEG, 0, -8 * DEG],
    rootY: -0.7,
    rootRot: [-90 * DEG, 0, 0],
  },
  savasana: {
    torso: [0, 0, 0],
    head: [0, 0, 0],
    leftArm: [0, 0, 35 * DEG],
    rightArm: [0, 0, -35 * DEG],
    leftLeg: [0, 0, 12 * DEG],
    rightLeg: [0, 0, -12 * DEG],
    rootY: -0.75,
    rootRot: [-90 * DEG, 0, 0],
  },
  breath: {
    torso: [0, 0, 0],
    head: [0, 0, 0],
    leftArm: [0, 0, 18 * DEG],
    rightArm: [0, 0, -18 * DEG],
    leftLeg: [0, 0, 0],
    rightLeg: [0, 0, 0],
    rootY: 0,
    rootRot: [0, 0, 0],
  },
};

const EMERALD = '#34d399';
const EMERALD_DEEP = '#059669';
const SKIN = '#a7f3d0';

function lerpEuler(current: THREE.Euler, target: [number, number, number], alpha: number) {
  current.x = THREE.MathUtils.lerp(current.x, target[0], alpha);
  current.y = THREE.MathUtils.lerp(current.y, target[1], alpha);
  current.z = THREE.MathUtils.lerp(current.z, target[2], alpha);
}

function Limb({
  length = 0.42,
  radius = 0.07,
  color = EMERALD,
}: {
  length?: number;
  radius?: number;
  color?: string;
}) {
  return (
    <mesh castShadow position={[0, -length / 2, 0]}>
      <capsuleGeometry args={[radius, length, 6, 12]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.15} />
    </mesh>
  );
}

function AsanaFigure({
  animationAssetId,
  breathPhase = 'idle',
  isBreathing = false,
}: {
  animationAssetId: string;
  breathPhase?: BreathPhase;
  isBreathing?: boolean;
}) {
  const family = useMemo(() => familyFromAsset(animationAssetId), [animationAssetId]);
  const target = POSES[family];

  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const spin = useRef(0);

  useFrame((_, delta) => {
    const a = 1 - Math.exp(-4.2 * delta);
    if (!root.current || !torso.current || !head.current) return;
    if (!leftArm.current || !rightArm.current || !leftLeg.current || !rightLeg.current) return;

    root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, target.rootY, a);
    spin.current += delta * 0.18;
    const rootTarget: [number, number, number] = [
      target.rootRot[0],
      target.rootRot[1] + Math.sin(spin.current) * 0.1,
      target.rootRot[2],
    ];
    lerpEuler(root.current.rotation, rootTarget, a);
    lerpEuler(torso.current.rotation, target.torso, a);
    lerpEuler(head.current.rotation, target.head, a);
    lerpEuler(leftArm.current.rotation, target.leftArm, a);
    lerpEuler(rightArm.current.rotation, target.rightArm, a);
    lerpEuler(leftLeg.current.rotation, target.leftLeg, a);
    lerpEuler(rightLeg.current.rotation, target.rightLeg, a);

    const breathScale =
      breathPhase === 'inhale'
        ? 1.04
        : breathPhase === 'exhale'
          ? 0.97
          : breathPhase === 'hold_top'
            ? 1.05
            : isBreathing
              ? 1.02
              : 1;
    const pulse = 1 + Math.sin(performance.now() * 0.002) * (isBreathing ? 0.012 : 0.008);
    torso.current.scale.setScalar(THREE.MathUtils.lerp(torso.current.scale.x, breathScale * pulse, a));
  });

  return (
    <group ref={root} position={[0, 0, 0]}>
      <group ref={leftLeg} position={[-0.14, 0.95, 0]}>
        <Limb length={0.55} radius={0.075} />
      </group>
      <group ref={rightLeg} position={[0.14, 0.95, 0]}>
        <Limb length={0.55} radius={0.075} />
      </group>

      <group ref={torso} position={[0, 1.05, 0]}>
        <mesh castShadow position={[0, 0.35, 0]}>
          <capsuleGeometry args={[0.16, 0.45, 8, 16]} />
          <meshStandardMaterial color={EMERALD_DEEP} roughness={0.4} metalness={0.2} />
        </mesh>

        <group ref={leftArm} position={[-0.22, 0.55, 0]}>
          <Limb length={0.4} radius={0.055} color={EMERALD} />
        </group>
        <group ref={rightArm} position={[0.22, 0.55, 0]}>
          <Limb length={0.4} radius={0.055} color={EMERALD} />
        </group>

        <group ref={head} position={[0, 0.78, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.14, 24, 24]} />
            <meshStandardMaterial color={SKIN} roughness={0.35} metalness={0.05} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.55} color="#a7f3d0" />
      <directionalLight
        castShadow
        position={[3.5, 6, 2]}
        intensity={1.35}
        color="#ecfdf5"
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-2.5, 2, -1]} intensity={0.45} color="#34d399" />
    </>
  );
}

function YogaFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <circleGeometry args={[2.4, 48]} />
      <meshStandardMaterial color="#064e3b" roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

function YogaScene({
  animationAssetId,
  breathPhase,
  isBreathing,
}: {
  animationAssetId: string;
  breathPhase?: BreathPhase;
  isBreathing?: boolean;
}) {
  return (
    <>
      <color attach="background" args={['#022c22']} />
      <fog attach="fog" args={['#022c22', 5.5, 14]} />
      <SceneLights />
      <YogaFloor />
      <AsanaFigure
        animationAssetId={animationAssetId}
        breathPhase={breathPhase}
        isBreathing={isBreathing}
      />
      <ContactShadows position={[0, 0, 0]} opacity={0.45} scale={6} blur={2.4} far={4} color="#022c22" />
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

export const Yoga3DViewport: React.FC<Yoga3DViewportProps> = ({
  animationAssetId,
  poseName,
  breathPhase = 'idle',
  isBreathing = false,
  label,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-[#022c22] to-[#064e3b] ${className}`}
      style={{ minHeight: '14rem' }}
    >
      <div className="absolute inset-0 h-56 sm:h-64">
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [2.4, 1.8, 3.2], fov: 38, near: 0.1, far: 40 }}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <YogaScene
              animationAssetId={animationAssetId}
              breathPhase={breathPhase}
              isBreathing={isBreathing}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none relative z-10 flex h-56 sm:h-64 flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-md bg-black/35 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200/90 backdrop-blur-sm">
            {label ?? '3D · Orbit to explore'}
          </span>
          {poseName ? (
            <span className="max-w-[55%] truncate rounded-md bg-emerald-950/50 px-2 py-1 text-[10px] font-medium text-emerald-100/90 backdrop-blur-sm">
              {poseName}
            </span>
          ) : null}
        </div>
        <p className="text-[10px] text-emerald-200/60">Drag to orbit · scroll to zoom</p>
      </div>
    </div>
  );
};
