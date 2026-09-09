import React, { useEffect, useMemo, useRef } from 'react';
import { ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { GearInstance } from './studioPlaygroundState';
import {
  STUDIO_GRID,
  canPlace,
  clampToFloor,
} from './studioPlaygroundState';
import { StudioGearMesh } from './StudioGearMeshes';
import { IndustrialGymFacility } from './IndustrialGymFacility';

export interface StudioPlaygroundProps {
  instances: GearInstance[];
  selectedId: string | null;
  editMode: boolean;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, z: number) => void;
  onDraggingChange?: (dragging: boolean) => void;
  /** Functional gym chair when the active module needs it */
  showChair?: boolean;
}

type DraggableGearProps = {
  instance: GearInstance;
  selected: boolean;
  editMode: boolean;
  others: GearInstance[];
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, z: number) => void;
  onDraggingChange?: (dragging: boolean) => void;
};

const DraggableGear: React.FC<DraggableGearProps> = ({
  instance,
  selected,
  editMode,
  others,
  onSelect,
  onMove,
  onDraggingChange,
}) => {
  const dragging = useRef(false);
  const instanceRef = useRef(instance);
  const othersRef = useRef(others);
  const editRef = useRef(editMode);
  instanceRef.current = instance;
  othersRef.current = others;
  editRef.current = editMode;

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const { gl, camera } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);

  const yaw = (instance.yawDeg * Math.PI) / 180;

  useEffect(() => {
    const projectToFloor = (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(plane, hit)) return null;
      return clampToFloor(hit.x, hit.z);
    };

    const onWindowMove = (ev: PointerEvent) => {
      if (!dragging.current) return;
      const snapped = projectToFloor(ev.clientX, ev.clientY);
      if (!snapped) return;
      const cur = instanceRef.current;
      const trial = { ...cur, x: snapped.x, z: snapped.z };
      if (canPlace(trial, othersRef.current, cur.instanceId)) {
        onMove(cur.instanceId, snapped.x, snapped.z);
      }
    };

    const onWindowUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      onDraggingChange?.(false);
      gl.domElement.style.cursor = editRef.current ? 'grab' : 'default';
    };

    window.addEventListener('pointermove', onWindowMove);
    window.addEventListener('pointerup', onWindowUp);
    return () => {
      window.removeEventListener('pointermove', onWindowMove);
      window.removeEventListener('pointerup', onWindowUp);
    };
  }, [camera, gl, hit, ndc, onDraggingChange, onMove, plane, raycaster]);

  const pointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!editMode) return;
    e.stopPropagation();
    dragging.current = true;
    onSelect(instance.instanceId);
    onDraggingChange?.(true);
    gl.domElement.style.cursor = 'grabbing';
  };

  return (
    <group
      position={[instance.x, 0, instance.z]}
      rotation={[0, yaw, 0]}
      onPointerDown={pointerDown}
      onClick={(e) => {
        if (!editMode) return;
        e.stopPropagation();
        onSelect(instance.instanceId);
      }}
    >
      {editMode && (
        <mesh visible={false} position={[0, 0.4, 0]}>
          <boxGeometry args={[0.85, 0.85, 0.85]} />
        </mesh>
      )}
      <StudioGearMesh
        gearId={instance.gearId}
        selected={(selected && editMode) || instance.sessionRole === 'active'}
      />
    </group>
  );
};

/** Industrial gym facility + session gear instances on rubber tile floor. */
export function StudioPlayground({
  instances,
  selectedId,
  editMode,
  onSelect,
  onMove,
  onDraggingChange,
  showChair = false,
}: StudioPlaygroundProps) {
  return (
    <group>
      <IndustrialGymFacility
        editMode={editMode}
        coachClearRadius={STUDIO_GRID.coachClearRadius}
        showChair={showChair}
        onFloorClick={() => {
          if (editMode) onSelect(null);
        }}
      />
      {instances.map((inst) => (
        <DraggableGear
          key={inst.instanceId}
          instance={inst}
          selected={selectedId === inst.instanceId}
          editMode={editMode}
          others={instances}
          onSelect={onSelect}
          onMove={onMove}
          onDraggingChange={onDraggingChange}
        />
      ))}
    </group>
  );
}
