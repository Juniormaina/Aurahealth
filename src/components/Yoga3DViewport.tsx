import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrganicAvatar, OrganicSceneChrome, OrganicViewportShell } from './organic/OrganicAvatar';
import {
  BreathPhase,
  ChainPose,
  standingChain,
} from './organic/organicMotion';

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

const DEG = Math.PI / 180;

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

const POSES: Record<PoseFamily, ChainPose> = {
  standing: standingChain(),
  breath: standingChain({
    lShoulder: [0, 0, 0.22],
    rShoulder: [0, 0, -0.22],
    chest: [0, 0, 0],
  }),
  chair: standingChain({
    spine: [6 * DEG, 0, 0],
    chest: [4 * DEG, 0, 0],
    lShoulder: [-145 * DEG, 0, 18 * DEG],
    rShoulder: [-145 * DEG, 0, -18 * DEG],
    lElbow: 0.25,
    rElbow: 0.25,
    lHip: [50 * DEG, 0, 0],
    rHip: [50 * DEG, 0, 0],
    lKnee: 1.15,
    rKnee: 1.15,
    rootY: -0.18,
  }),
  fold: standingChain({
    pelvis: [25 * DEG, 0, 0],
    spine: [40 * DEG, 0, 0],
    chest: [35 * DEG, 0, 0],
    head: [15 * DEG, 0, 0],
    lShoulder: [25 * DEG, 0, 12 * DEG],
    rShoulder: [25 * DEG, 0, -12 * DEG],
    lElbow: 0.15,
    rElbow: 0.15,
    rootY: -0.08,
  }),
  half_fold: standingChain({
    pelvis: [12 * DEG, 0, 0],
    spine: [28 * DEG, 0, 0],
    chest: [18 * DEG, 0, 0],
    lShoulder: [-95 * DEG, 0, 0],
    rShoulder: [-95 * DEG, 0, 0],
    lElbow: 0.08,
    rElbow: 0.08,
  }),
  warrior: standingChain({
    chest: [0, 12 * DEG, 0],
    head: [0, 10 * DEG, 0],
    lShoulder: [-165 * DEG, 0, 12 * DEG],
    rShoulder: [-165 * DEG, 0, -12 * DEG],
    lElbow: 0.1,
    rElbow: 0.1,
    lHip: [65 * DEG, 0, 0],
    rHip: [-18 * DEG, 0, 0],
    lKnee: 1.2,
    rKnee: 0.08,
    rootY: -0.1,
    rootRot: [0, -18 * DEG, 0],
  }),
  triangle: standingChain({
    pelvis: [0, 0, 12 * DEG],
    spine: [0, 0, 28 * DEG],
    chest: [0, 0, 22 * DEG],
    head: [0, 0, -18 * DEG],
    lShoulder: [0, 0, 95 * DEG],
    rShoulder: [0, 0, -95 * DEG],
    lElbow: 0.05,
    rElbow: 0.05,
    lHip: [0, 0, 22 * DEG],
    rHip: [0, 0, -22 * DEG],
  }),
  tree: standingChain({
    lShoulder: [-155 * DEG, 0, 22 * DEG],
    rShoulder: [-155 * DEG, 0, -22 * DEG],
    lElbow: 0.35,
    rElbow: 0.35,
    rHip: [45 * DEG, 0, 55 * DEG],
    rKnee: 1.35,
    spine: [0, 0, 2 * DEG],
  }),
  down_dog: standingChain({
    pelvis: [35 * DEG, 0, 0],
    spine: [28 * DEG, 0, 0],
    chest: [18 * DEG, 0, 0],
    head: [28 * DEG, 0, 0],
    lShoulder: [-55 * DEG, 0, 12 * DEG],
    rShoulder: [-55 * DEG, 0, -12 * DEG],
    lElbow: 0.15,
    rElbow: 0.15,
    lHip: [-30 * DEG, 0, 0],
    rHip: [-30 * DEG, 0, 0],
    lKnee: 0.08,
    rKnee: 0.08,
    rootY: 0.18,
  }),
  plank: standingChain({
    pelvis: [88 * DEG, 0, 0],
    spine: [4 * DEG, 0, 0],
    chest: [0, 0, 0],
    lShoulder: [-88 * DEG, 0, 8 * DEG],
    rShoulder: [-88 * DEG, 0, -8 * DEG],
    lElbow: 0.12,
    rElbow: 0.12,
    rootY: 0.52,
  }),
  chaturanga: standingChain({
    pelvis: [88 * DEG, 0, 0],
    spine: [6 * DEG, 0, 0],
    lShoulder: [-50 * DEG, 0, 18 * DEG],
    rShoulder: [-50 * DEG, 0, -18 * DEG],
    lElbow: 1.35,
    rElbow: 1.35,
    rootY: 0.22,
  }),
  up_dog: standingChain({
    pelvis: [-8 * DEG, 0, 0],
    spine: [-12 * DEG, 0, 0],
    chest: [-14 * DEG, 0, 0],
    head: [-12 * DEG, 0, 0],
    lShoulder: [-70 * DEG, 0, 12 * DEG],
    rShoulder: [-70 * DEG, 0, -12 * DEG],
    lElbow: 0.2,
    rElbow: 0.2,
    lHip: [8 * DEG, 0, 0],
    rHip: [8 * DEG, 0, 0],
    rootY: -0.18,
  }),
  cobra: standingChain({
    pelvis: [-5 * DEG, 0, 0],
    spine: [-18 * DEG, 0, 0],
    chest: [-22 * DEG, 0, 0],
    head: [-8 * DEG, 0, 0],
    lShoulder: [-42 * DEG, 0, 22 * DEG],
    rShoulder: [-42 * DEG, 0, -22 * DEG],
    lElbow: 0.85,
    rElbow: 0.85,
    rootY: -0.32,
  }),
  child: standingChain({
    pelvis: [35 * DEG, 0, 0],
    spine: [28 * DEG, 0, 0],
    chest: [22 * DEG, 0, 0],
    head: [35 * DEG, 0, 0],
    lShoulder: [35 * DEG, 0, 35 * DEG],
    rShoulder: [35 * DEG, 0, -35 * DEG],
    lHip: [110 * DEG, 0, 12 * DEG],
    rHip: [110 * DEG, 0, -12 * DEG],
    lKnee: 1.55,
    rKnee: 1.55,
    rootY: -0.42,
  }),
  seated_fold: standingChain({
    pelvis: [15 * DEG, 0, 0],
    spine: [35 * DEG, 0, 0],
    chest: [28 * DEG, 0, 0],
    head: [20 * DEG, 0, 0],
    lShoulder: [28 * DEG, 0, 8 * DEG],
    rShoulder: [28 * DEG, 0, -8 * DEG],
    lHip: [85 * DEG, 0, 0],
    rHip: [85 * DEG, 0, 0],
    lKnee: 0.1,
    rKnee: 0.1,
    rootY: -0.52,
  }),
  butterfly: standingChain({
    spine: [10 * DEG, 0, 0],
    chest: [8 * DEG, 0, 0],
    lShoulder: [18 * DEG, 0, 28 * DEG],
    rShoulder: [18 * DEG, 0, -28 * DEG],
    lHip: [65 * DEG, 0, 48 * DEG],
    rHip: [65 * DEG, 0, -48 * DEG],
    lKnee: 1.4,
    rKnee: 1.4,
    rootY: -0.52,
  }),
  twist: standingChain({
    pelvis: [5 * DEG, 10 * DEG, 0],
    spine: [6 * DEG, 22 * DEG, 0],
    chest: [4 * DEG, 28 * DEG, 0],
    head: [0, 22 * DEG, 0],
    lShoulder: [-38 * DEG, 25 * DEG, 18 * DEG],
    rShoulder: [-38 * DEG, -25 * DEG, -18 * DEG],
    lElbow: 0.45,
    rElbow: 0.45,
    lHip: [85 * DEG, 0, 8 * DEG],
    rHip: [85 * DEG, 0, -8 * DEG],
    rootY: -0.52,
  }),
  lunge: standingChain({
    spine: [4 * DEG, 0, 0],
    lShoulder: [-155 * DEG, 0, 12 * DEG],
    rShoulder: [-155 * DEG, 0, -12 * DEG],
    lHip: [72 * DEG, 0, 0],
    rHip: [-12 * DEG, 0, 0],
    lKnee: 1.35,
    rKnee: 0.12,
    rootY: -0.18,
  }),
  legs_up: standingChain({
    rootY: -0.68,
    rootRot: [-88 * DEG, 0, 0],
    lShoulder: [0, 0, 22 * DEG],
    rShoulder: [0, 0, -22 * DEG],
    lHip: [-90 * DEG, 0, 6 * DEG],
    rHip: [-90 * DEG, 0, -6 * DEG],
    lKnee: 0.08,
    rKnee: 0.08,
  }),
  savasana: standingChain({
    rootY: -0.72,
    rootRot: [-90 * DEG, 0, 0],
    lShoulder: [0, 0, 32 * DEG],
    rShoulder: [0, 0, -32 * DEG],
    lElbow: 0.15,
    rElbow: 0.15,
    lHip: [0, 0, 10 * DEG],
    rHip: [0, 0, -10 * DEG],
  }),
};

function YogaFigure({
  animationAssetId,
  breathPhase,
  isBreathing,
}: {
  animationAssetId: string;
  breathPhase: BreathPhase;
  isBreathing: boolean;
}) {
  const family = useMemo(() => familyFromAsset(animationAssetId), [animationAssetId]);
  const pose = POSES[family];
  const swayAmp = breathPhase === 'idle' && !isBreathing ? 0.85 : 1.15;

  return (
    <OrganicAvatar
      pose={pose}
      breathPhase={breathPhase}
      isBreathing={isBreathing}
      swayAmp={swayAmp}
      tension={isBreathing ? 0.45 : 0.28}
    />
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
    <OrganicViewportShell
      className={className}
      topLeft={
        <span className="rounded-md bg-black/35 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200/90 backdrop-blur-sm">
          {label ?? '3D · Orbit to explore'}
        </span>
      }
      topRight={
        poseName ? (
          <span className="max-w-[55%] truncate rounded-md bg-emerald-950/50 px-2 py-1 text-[10px] font-medium text-emerald-100/90 backdrop-blur-sm">
            {poseName}
          </span>
        ) : null
      }
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [2.4, 1.8, 3.2], fov: 38, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <OrganicSceneChrome>
            <YogaFigure
              animationAssetId={animationAssetId}
              breathPhase={breathPhase}
              isBreathing={isBreathing}
            />
          </OrganicSceneChrome>
        </Suspense>
      </Canvas>
    </OrganicViewportShell>
  );
};
