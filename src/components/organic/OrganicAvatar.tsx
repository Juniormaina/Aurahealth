import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  BreathPhase,
  ChainPose,
  EMERALD,
  SpringScalar,
  breathInflation,
  posturalSway,
  slerpEuler,
} from './organicMotion';

export interface MuscleSpot {
  id: string;
  position: [number, number, number];
  mirror?: boolean;
  primary?: boolean;
}

interface OrganicAvatarProps {
  pose: ChainPose;
  breathPhase?: BreathPhase;
  isBreathing?: boolean;
  /** Extra sway during holds / rest (0–1.5). */
  swayAmp?: number;
  /** Soft muscle tension glow 0–1. */
  tension?: number;
  muscleSpots?: MuscleSpot[];
  accentColor?: string;
}

function Segment({
  length,
  radius,
  color,
  roughness = 0.42,
}: {
  length: number;
  radius: number;
  color: string;
  roughness?: number;
}) {
  return (
    <mesh castShadow position={[0, -length / 2, 0]}>
      <capsuleGeometry args={[radius, Math.max(0.01, length - radius * 2), 6, 14]} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={0.12}
        envMapIntensity={0.6}
      />
    </mesh>
  );
}

function MuscleGlow({
  spots,
  tension,
  accent,
}: {
  spots: MuscleSpot[];
  tension: number;
  accent: string;
}) {
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame((_, dt) => {
    const target = 0.25 + tension * 0.9;
    for (const m of mats.current) {
      if (!m) continue;
      m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, target, 4, dt);
    }
  });

  let idx = 0;
  const nodes: React.ReactNode[] = [];
  for (const spot of spots) {
    const positions: [number, number, number][] = [spot.position];
    if (spot.mirror) positions.push([-spot.position[0], spot.position[1], spot.position[2]]);
    for (const p of positions) {
      const i = idx++;
      nodes.push(
        <mesh key={`${spot.id}-${i}`} position={p}>
          <sphereGeometry args={[spot.primary ? 0.065 : 0.05, 12, 12]} />
          <meshStandardMaterial
            ref={(el) => {
              mats.current[i] = el;
            }}
            color={accent}
            emissive={accent}
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>
      );
    }
  }
  return <>{nodes}</>;
}

/**
 * Articulated hierarchical avatar: pelvis → spine → chest → head,
 * shoulder → elbow chains, hip → knee chains, with spring / slerp damping.
 */
export function OrganicAvatar({
  pose,
  breathPhase = 'idle',
  isBreathing = false,
  swayAmp = 1,
  tension = 0.35,
  muscleSpots,
  accentColor = EMERALD.accent,
}: OrganicAvatarProps) {
  const root = useRef<THREE.Group>(null);
  const pelvis = useRef<THREE.Group>(null);
  const spine = useRef<THREE.Group>(null);
  const chest = useRef<THREE.Group>(null);
  const ribcage = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const lShoulder = useRef<THREE.Group>(null);
  const lElbow = useRef<THREE.Group>(null);
  const rShoulder = useRef<THREE.Group>(null);
  const rElbow = useRef<THREE.Group>(null);
  const lHip = useRef<THREE.Group>(null);
  const lKnee = useRef<THREE.Group>(null);
  const rHip = useRef<THREE.Group>(null);
  const rKnee = useRef<THREE.Group>(null);

  const rootY = useMemo(() => new SpringScalar(pose.rootY), []);
  const breath = useMemo(() => new SpringScalar(0.4), []);
  const lElbowSpring = useMemo(() => new SpringScalar(pose.lElbow), []);
  const rElbowSpring = useMemo(() => new SpringScalar(pose.rElbow), []);
  const lKneeSpring = useMemo(() => new SpringScalar(pose.lKnee), []);
  const rKneeSpring = useMemo(() => new SpringScalar(pose.rKnee), []);

  useFrame((state, delta) => {
    if (
      !root.current ||
      !pelvis.current ||
      !spine.current ||
      !chest.current ||
      !head.current ||
      !lShoulder.current ||
      !lElbow.current ||
      !rShoulder.current ||
      !rElbow.current ||
      !lHip.current ||
      !lKnee.current ||
      !rHip.current ||
      !rKnee.current
    ) {
      return;
    }

    const dt = delta;
    const sway = posturalSway(state.clock.elapsedTime, swayAmp);

    root.current.position.y = rootY.step(pose.rootY, dt, 18, 8);
    slerpEuler(root.current, pose.rootRot, dt, 6.5);

    slerpEuler(pelvis.current, pose.pelvis, dt, 7, sway.pelvis);
    slerpEuler(spine.current, pose.spine, dt, 6.8, sway.spine);
    slerpEuler(chest.current, pose.chest, dt, 6.5, sway.chest);
    slerpEuler(head.current, pose.head, dt, 8.5, sway.head);

    // Proximal → distal chain: shoulders then elbows (spring flexion)
    slerpEuler(lShoulder.current, pose.lShoulder, dt, 7.2);
    slerpEuler(rShoulder.current, pose.rShoulder, dt, 7.2);
    lElbow.current.rotation.x = lElbowSpring.step(pose.lElbow, dt, 26, 10);
    rElbow.current.rotation.x = rElbowSpring.step(pose.rElbow, dt, 26, 10);

    slerpEuler(lHip.current, pose.lHip, dt, 7);
    slerpEuler(rHip.current, pose.rHip, dt, 7);
    lKnee.current.rotation.x = lKneeSpring.step(pose.lKnee, dt, 24, 10);
    rKnee.current.rotation.x = rKneeSpring.step(pose.rKnee, dt, 24, 10);

    // Organic respiratory expansion on ribcage
    const breathTarget = breathInflation(breathPhase, isBreathing);
    const b = breath.step(breathTarget, dt, 10, 6);
    if (ribcage.current) {
      const sx = 1 + b * 0.07;
      const sy = 1 + b * 0.035;
      const sz = 1 + b * 0.055;
      ribcage.current.scale.x = THREE.MathUtils.damp(ribcage.current.scale.x, sx, 5, dt);
      ribcage.current.scale.y = THREE.MathUtils.damp(ribcage.current.scale.y, sy, 5, dt);
      ribcage.current.scale.z = THREE.MathUtils.damp(ribcage.current.scale.z, sz, 5, dt);
    }
  });

  return (
    <group ref={root}>
      {/* Legs hang from pelvis height */}
      <group ref={lHip} position={[-0.12, 0.92, 0]}>
        <Segment length={0.32} radius={0.07} color={EMERALD.limb} />
        <group ref={lKnee} position={[0, -0.32, 0]}>
          <Segment length={0.3} radius={0.055} color={EMERALD.limb} />
        </group>
      </group>
      <group ref={rHip} position={[0.12, 0.92, 0]}>
        <Segment length={0.32} radius={0.07} color={EMERALD.limb} />
        <group ref={rKnee} position={[0, -0.32, 0]}>
          <Segment length={0.3} radius={0.055} color={EMERALD.limb} />
        </group>
      </group>

      <group ref={pelvis} position={[0, 0.95, 0]}>
        <mesh castShadow position={[0, 0.04, 0]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color={EMERALD.torso} roughness={0.48} metalness={0.15} />
        </mesh>

        <group ref={spine} position={[0, 0.12, 0]}>
          <Segment length={0.18} radius={0.09} color={EMERALD.torso} roughness={0.45} />

          <group ref={chest} position={[0, 0.2, 0]}>
            <mesh ref={ribcage} castShadow position={[0, 0.16, 0]}>
              <capsuleGeometry args={[0.15, 0.28, 8, 16]} />
              <meshStandardMaterial
                color={EMERALD.torso}
                roughness={0.38}
                metalness={0.18}
                emissive={EMERALD.accent}
                emissiveIntensity={0.04}
              />
            </mesh>

            {/* Rim highlight catch light */}
            <mesh position={[0, 0.18, 0.12]} scale={[0.7, 0.55, 0.2]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial
                color={EMERALD.rim}
                transparent
                opacity={0.18}
                roughness={0.2}
                metalness={0.3}
              />
            </mesh>

            <group ref={lShoulder} position={[-0.2, 0.28, 0]}>
              <Segment length={0.22} radius={0.05} color={EMERALD.limb} />
              <group ref={lElbow} position={[0, -0.22, 0]}>
                <Segment length={0.2} radius={0.042} color={EMERALD.limb} />
              </group>
            </group>
            <group ref={rShoulder} position={[0.2, 0.28, 0]}>
              <Segment length={0.22} radius={0.05} color={EMERALD.limb} />
              <group ref={rElbow} position={[0, -0.22, 0]}>
                <Segment length={0.2} radius={0.042} color={EMERALD.limb} />
              </group>
            </group>

            <group ref={head} position={[0, 0.42, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.125, 24, 24]} />
                <meshStandardMaterial color={EMERALD.skin} roughness={0.32} metalness={0.04} />
              </mesh>
            </group>

            {muscleSpots && muscleSpots.length > 0 ? (
              <MuscleGlow spots={muscleSpots} tension={tension} accent={accentColor} />
            ) : null}
          </group>
        </group>
      </group>
    </group>
  );
}

export function OrganicSceneChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <color attach="background" args={[EMERALD.bgDeep]} />
      <fog attach="fog" args={[EMERALD.fog, 5.2, 13.5]} />
      <ambientLight intensity={0.48} color="#a7f3d0" />
      <directionalLight
        castShadow
        position={[3.2, 5.8, 2.4]}
        intensity={1.2}
        color="#ecfdf5"
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-2.5, 2, -2]} intensity={0.35} color={EMERALD.rim} />
      <pointLight position={[0.5, 1.8, 1.5]} intensity={0.55} color={EMERALD.accent} distance={8} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[2.45, 64]} />
        <meshStandardMaterial color={EMERALD.bgMid} roughness={0.88} metalness={0.06} />
      </mesh>
      {children}
      <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={6} blur={2} far={4.2} color={EMERALD.bgDeep} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        enableDamping
        dampingFactor={0.05}
        minDistance={2.2}
        maxDistance={6}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2}
        target={[0, 1, 0]}
      />
    </>
  );
}

export function OrganicViewportShell({
  className = '',
  children,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight = 'Drag to orbit · scroll to zoom',
}: {
  className?: string;
  children: React.ReactNode;
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
  bottomLeft?: React.ReactNode;
  bottomRight?: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-[#022c22] to-[#064e3b] ${className}`}
      style={{ minHeight: '14rem' }}
    >
      <div className="absolute inset-0 h-56 sm:h-64">{children}</div>
      <div className="pointer-events-none relative z-10 flex h-56 sm:h-64 flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="pointer-events-auto flex flex-col gap-1.5">{topLeft}</div>
          <div className="pointer-events-none">{topRight}</div>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>{bottomLeft}</div>
          <p className="text-[10px] text-emerald-200/55">{bottomRight}</p>
        </div>
      </div>
    </div>
  );
}
