import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrganicViewportShell } from './organic/OrganicAvatar';
import { CoachCharacter, StudioSceneChrome } from './organic/CoachCharacter';
import type { BreathPhase } from './organic/organicMotion';

export interface Yoga3DViewportProps {
  animationAssetId: string;
  poseName?: string;
  breathPhase?: BreathPhase;
  isBreathing?: boolean;
  label?: string;
  className?: string;
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
          {label ?? 'Coach Aura · 360°'}
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
        camera={{ position: [2.6, 1.7, 3.4], fov: 36, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <StudioSceneChrome>
            <CoachCharacter
              mode="yoga"
              yogaAssetId={animationAssetId}
              breathPhase={breathPhase}
              isBreathing={isBreathing}
              swayAmp={breathPhase === 'idle' && !isBreathing ? 0.9 : 1.15}
            />
          </StudioSceneChrome>
        </Suspense>
      </Canvas>
    </OrganicViewportShell>
  );
};
