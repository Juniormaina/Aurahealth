import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { GearMeshKind } from '../../content/studioGearCatalog';
import { EMERALD } from './organicMotion';

const STEEL = '#94a3b8';
const STEEL_DARK = '#475569';
const MAT = '#0f766e';
const CORK = '#c4a574';
const FABRIC = '#e7e5e4';
const BOLSTER = '#d6d3d1';
const BAND = '#f97316';
const WOOD = '#78716c';

function Metal({ color = STEEL, roughness = 0.35, metalness = 0.75 }: { color?: string; roughness?: number; metalness?: number }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />;
}

function Soft({ color, roughness = 0.85 }: { color: string; roughness?: number }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={0.05} />;
}

function ParallelBars() {
  return (
    <group>
      {[ -0.28, 0.28 ].map((x) => (
        <group key={x}>
          <mesh castShadow position={[x, 0.55, -0.55]}>
            <cylinderGeometry args={[0.035, 0.04, 1.1, 10]} />
            <Metal color={STEEL_DARK} />
          </mesh>
          <mesh castShadow position={[x, 0.55, 0.55]}>
            <cylinderGeometry args={[0.035, 0.04, 1.1, 10]} />
            <Metal color={STEEL_DARK} />
          </mesh>
          <mesh castShadow position={[x, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 1.2, 12]} />
            <Metal />
          </mesh>
        </group>
      ))}
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.85, 0.04, 1.35]} />
        <Soft color={WOOD} roughness={0.9} />
      </mesh>
    </group>
  );
}

function PullUpStation() {
  return (
    <group>
      <mesh castShadow position={[-0.5, 1.05, 0]}>
        <cylinderGeometry args={[0.04, 0.045, 2.1, 10]} />
        <Metal color={STEEL_DARK} />
      </mesh>
      <mesh castShadow position={[0.5, 1.05, 0]}>
        <cylinderGeometry args={[0.04, 0.045, 2.1, 10]} />
        <Metal color={STEEL_DARK} />
      </mesh>
      <mesh castShadow position={[0, 2.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1, 12]} />
        <Metal />
      </mesh>
      {/* side braces */}
      <mesh castShadow position={[-0.5, 0.35, 0.22]} rotation={[0.55, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
        <Metal color={STEEL_DARK} />
      </mesh>
      <mesh castShadow position={[0.5, 0.35, 0.22]} rotation={[0.55, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
        <Metal color={STEEL_DARK} />
      </mesh>
      <mesh receiveShadow position={[0, 0.02, 0.05]}>
        <boxGeometry args={[1.2, 0.04, 0.5]} />
        <Soft color={WOOD} />
      </mesh>
    </group>
  );
}

function GymnasticsRings() {
  return (
    <group>
      <mesh castShadow position={[-0.35, 1.95, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
        <Metal color={STEEL_DARK} />
      </mesh>
      {[-0.28, 0.28].map((x) => (
        <group key={x}>
          <mesh castShadow position={[x, 1.55, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.85, 6]} />
            <Soft color="#292524" roughness={0.7} />
          </mesh>
          <mesh castShadow position={[x, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.1, 0.018, 10, 24]} />
            <Soft color="#1c1917" roughness={0.55} />
          </mesh>
        </group>
      ))}
      <mesh castShadow position={[-0.42, 1.0, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 2.0, 8]} />
        <Metal color={STEEL_DARK} />
      </mesh>
      <mesh castShadow position={[0.42, 1.0, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 2.0, 8]} />
        <Metal color={STEEL_DARK} />
      </mesh>
    </group>
  );
}

function YogaMat() {
  return (
    <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
      <boxGeometry args={[0.61, 0.04, 1.73]} />
      <meshStandardMaterial color={MAT} roughness={0.75} metalness={0.08} emissive={EMERALD.accent} emissiveIntensity={0.04} />
    </mesh>
  );
}

function CorkBlock() {
  return (
    <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
      <boxGeometry args={[0.23, 0.1, 0.15]} />
      <Soft color={CORK} roughness={0.92} />
    </mesh>
  );
}

function CottonStrap() {
  return (
    <group>
      <mesh castShadow position={[0, 0.03, 0]} rotation={[0, 0.2, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.22, 12]} />
        <Soft color={FABRIC} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.02, 0.05, 0.01]} rotation={[0.3, 0.4, 0]}>
        <boxGeometry args={[0.18, 0.012, 0.04]} />
        <Soft color="#a8a29e" />
      </mesh>
    </group>
  );
}

function Bolster() {
  return (
    <mesh castShadow receiveShadow position={[0, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[0.11, 0.48, 6, 12]} />
      <Soft color={BOLSTER} roughness={0.78} />
    </mesh>
  );
}

function ResistanceBand() {
  return (
    <mesh castShadow position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.14, 0.018, 10, 28]} />
      <meshStandardMaterial color={BAND} roughness={0.45} metalness={0.1} emissive={BAND} emissiveIntensity={0.08} />
    </mesh>
  );
}

function Parallettes() {
  return (
    <group>
      {[-0.2, 0.2].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh castShadow position={[0, 0.16, -0.16]}>
            <cylinderGeometry args={[0.025, 0.028, 0.32, 10]} />
            <Soft color={WOOD} />
          </mesh>
          <mesh castShadow position={[0, 0.16, 0.16]}>
            <cylinderGeometry args={[0.025, 0.028, 0.32, 10]} />
            <Soft color={WOOD} />
          </mesh>
          <mesh castShadow position={[0, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.38, 12]} />
            <Soft color={WOOD} roughness={0.65} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PlyoBox() {
  return (
    <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
      <boxGeometry args={[0.75, 0.6, 0.55]} />
      <Soft color={WOOD} roughness={0.7} />
    </mesh>
  );
}

function GymChair() {
  return (
    <group>
      {[
        [-0.2, 0.4, -0.2],
        [0.2, 0.4, -0.2],
        [-0.2, 0.4, 0.2],
        [0.2, 0.4, 0.2],
      ].map((p, i) => (
        <mesh key={i} castShadow position={p as [number, number, number]}>
          <cylinderGeometry args={[0.016, 0.018, 0.8, 8]} />
          <Metal color={STEEL_DARK} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.46, 0]}>
        <boxGeometry args={[0.45, 0.06, 0.45]} />
        <Soft color="#1c1917" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 0.8, -0.18]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.45, 0.5, 0.06]} />
        <Soft color="#292524" roughness={0.5} />
      </mesh>
    </group>
  );
}

const MESH_MAP: Record<GearMeshKind, React.FC> = {
  parallel_bars: ParallelBars,
  pull_up_station: PullUpStation,
  gymnastics_rings: GymnasticsRings,
  yoga_mat: YogaMat,
  cork_block: CorkBlock,
  cotton_strap: CottonStrap,
  bolster: Bolster,
  resistance_band: ResistanceBand,
  parallettes: Parallettes,
  plyo_box: PlyoBox,
  gym_chair: GymChair,
};

export function StudioGearMesh({
  gearId,
  selected,
}: {
  gearId: GearMeshKind;
  selected?: boolean;
}) {
  const Mesh = MESH_MAP[gearId];
  const highlight = useMemo(
    () =>
      selected ? (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18, 0.28, 32]} />
          <meshBasicMaterial color={EMERALD.accent} transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      ) : null,
    [selected]
  );

  return (
    <group>
      {highlight}
      <Mesh />
    </group>
  );
}
