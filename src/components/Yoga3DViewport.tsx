import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrganicViewportShell } from './organic/OrganicAvatar';
import { CoachCharacter, StudioSceneChrome } from './organic/CoachCharacter';
import { TrainerSelect } from './organic/TrainerSelect';
import { StudioGearPanel } from './organic/StudioGearPanel';
import { StudioPlayground } from './organic/StudioPlayground';
import { useStudioPlayground } from './organic/useStudioPlayground';
import { STUDIO_GRID } from './organic/studioPlaygroundState';
import { loadTrainerId, saveTrainerId, type TrainerId } from './organic/trainerConfig';
import type { BreathPhase } from './organic/organicMotion';

export interface Yoga3DViewportProps {
  animationAssetId: string;
  poseName?: string;
  instructionCue?: string;
  breathPhase?: BreathPhase;
  isBreathing?: boolean;
  label?: string;
  className?: string;
}

export const Yoga3DViewport: React.FC<Yoga3DViewportProps> = ({
  animationAssetId,
  poseName,
  instructionCue,
  breathPhase = 'idle',
  isBreathing = false,
  label,
  className = '',
}) => {
  const [trainerId, setTrainerId] = useState<TrainerId>(() => loadTrainerId());
  const playground = useStudioPlayground();

  useEffect(() => {
    playground.syncExercise({
      mode: 'yoga',
      exerciseKey: animationAssetId,
      yogaAssetId: animationAssetId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on exercise module change only
  }, [animationAssetId]);

  const onTrainerChange = (id: TrainerId) => {
    setTrainerId(id);
    saveTrainerId(id);
  };

  return (
    <OrganicViewportShell
      className={className}
      expanded={playground.state.editMode}
      bottomRight={
        playground.state.editMode
          ? 'Drag props on grid · orbit disabled while dragging'
          : playground.propBinding.mode !== 'bodyweight'
            ? `Aligned · ${playground.propBinding.label}`
            : 'Drag to orbit · scroll to zoom'
      }
      topLeft={
        <>
          <TrainerSelect value={trainerId} onChange={onTrainerChange} />
          <StudioGearPanel
            mode="yoga"
            state={playground.state}
            aiStatus={playground.propBinding.label}
            onToggleEdit={() => playground.setEditMode(!playground.state.editMode)}
            onAdd={playground.addGear}
            onApplyZone={playground.applyZone}
            onRotate={playground.rotateSelected}
            onRemove={playground.removeSelected}
            onClear={playground.clearAll}
          />
          <span className="rounded-md bg-black/35 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200/90 backdrop-blur-sm w-fit">
            {label ?? 'Aurora studio · 360°'}
          </span>
        </>
      }
      topRight={
        poseName ? (
          <span className="max-w-[42vw] sm:max-w-[55%] truncate rounded-md bg-emerald-950/50 px-2 py-1 text-[10px] font-medium text-emerald-100/90 backdrop-blur-sm">
            {poseName}
          </span>
        ) : null
      }
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [3.2, 2.0, 4.0], fov: 38, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%', touchAction: playground.state.editMode ? 'none' : 'auto' }}
      >
        <Suspense fallback={null}>
          <StudioSceneChrome
            omitFloor
            floorRadius={STUDIO_GRID.floorRadius}
            orbitEnabled={!playground.dragging}
          >
            <StudioPlayground
              instances={playground.state.instances}
              selectedId={playground.state.selectedId}
              editMode={playground.state.editMode}
              onSelect={playground.select}
              onMove={playground.moveInstance}
              onDraggingChange={playground.setDragging}
              showChair={
                playground.state.sessionMeta?.bindMode === 'chair' ||
                playground.state.sessionMeta?.activeGearId === 'gym_chair' ||
                playground.propBinding.mode === 'chair'
              }
            />
            <CoachCharacter
              mode="yoga"
              trainerId={trainerId}
              yogaAssetId={animationAssetId}
              poseName={poseName}
              instructionCue={instructionCue}
              breathPhase={breathPhase}
              isBreathing={isBreathing}
              swayAmp={breathPhase === 'idle' && !isBreathing ? 0.9 : 1.15}
              propBinding={playground.propBinding}
            />
          </StudioSceneChrome>
        </Suspense>
      </Canvas>
    </OrganicViewportShell>
  );
};
