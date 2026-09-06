import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  makeBrickMaps,
  makeBrushedMetalSign,
  makeConcreteMaps,
  makeHillsVista,
  makeRubberTileMaps,
  makeWoodMap,
} from './gymTextures';

const ROOM = {
  w: 11,
  d: 9,
  h: 4.35,
} as const;

function Steel({
  color = '#3f4651',
  roughness = 0.38,
  metalness = 0.82,
}: {
  color?: string;
  roughness?: number;
  metalness?: number;
}) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} envMapIntensity={1.1} />;
}

function RubberFloor({ onFloorClick }: { onFloorClick?: () => void }) {
  const maps = useMemo(() => makeRubberTileMaps(), []);
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onFloorClick?.();
      }}
    >
      <planeGeometry args={[ROOM.w, ROOM.d]} />
      <meshStandardMaterial
        map={maps.map}
        normalMap={maps.normalMap}
        roughnessMap={maps.roughnessMap}
        roughness={0.92}
        metalness={0.04}
        color="#3a3d42"
      />
    </mesh>
  );
}

function GymWalls() {
  const concrete = useMemo(() => makeConcreteMaps(), []);
  const brick = useMemo(() => makeBrickMaps(), []);
  const sign = useMemo(() => makeBrushedMetalSign(), []);
  const hills = useMemo(() => makeHillsVista(), []);
  const hw = ROOM.w / 2;
  const hd = ROOM.d / 2;
  const h = ROOM.h;

  return (
    <group>
      <mesh position={[0, h / 2, -hd]} receiveShadow>
        <planeGeometry args={[ROOM.w, h]} />
        <meshStandardMaterial
          map={brick.map}
          normalMap={brick.normalMap}
          roughness={0.9}
          metalness={0.05}
          color="#4a4e55"
        />
      </mesh>

      <mesh position={[0, h / 2, hd]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[ROOM.w, h]} />
        <meshStandardMaterial
          map={concrete.map}
          normalMap={concrete.normalMap}
          roughness={0.88}
          metalness={0.04}
          color="#5a6068"
        />
      </mesh>

      <mesh position={[-hw, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.d, h]} />
        <meshStandardMaterial
          map={concrete.map}
          normalMap={concrete.normalMap}
          roughness={0.88}
          metalness={0.04}
          color="#555b63"
        />
      </mesh>

      <mesh position={[hw, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.d, h]} />
        <meshStandardMaterial
          map={brick.map}
          normalMap={brick.normalMap}
          roughness={0.9}
          metalness={0.05}
          color="#4a4e55"
        />
      </mesh>

      <group position={[hw - 0.04, 3.15, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {[-2.8, -0.9, 0.9, 2.8].map((z) => (
          <group key={z} position={[z, 0, 0]}>
            <mesh>
              <planeGeometry args={[1.55, 0.95]} />
              <meshStandardMaterial
                map={hills}
                roughness={0.15}
                metalness={0.1}
                emissive="#8fa89a"
                emissiveIntensity={0.12}
              />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[1.62, 1.02, 0.04]} />
              <Steel color="#2a2e35" metalness={0.7} roughness={0.45} />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <boxGeometry args={[1.5, 0.9, 0.02]} />
              <meshStandardMaterial color="#6b7c8a" transparent opacity={0.18} roughness={0.1} metalness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      <mesh position={[0, 3.05, -hd + 0.03]} castShadow>
        <planeGeometry args={[3.4, 1.05]} />
        <meshStandardMaterial
          map={sign}
          roughness={0.32}
          metalness={0.92}
          envMapIntensity={1.4}
          color="#c8c0c8"
        />
      </mesh>
      <mesh position={[0, 3.05, -hd + 0.01]}>
        <boxGeometry args={[3.5, 1.15, 0.04]} />
        <Steel color="#5c6570" />
      </mesh>

      {[
        [0, 0.08, -hd + 0.02, ROOM.w, 0],
        [0, 0.08, hd - 0.02, ROOM.w, Math.PI],
        [-hw + 0.02, 0.08, 0, ROOM.d, Math.PI / 2],
        [hw - 0.02, 0.08, 0, ROOM.d, -Math.PI / 2],
      ].map(([x, y, z, len, rot], i) => (
        <mesh key={i} position={[x as number, y as number, z as number]} rotation={[0, rot as number, 0]}>
          <boxGeometry args={[len as number, 0.16, 0.04]} />
          <Steel color="#2c3138" roughness={0.55} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function GymCeiling() {
  const h = ROOM.h;
  const beams = [-3.5, -1.75, 0, 1.75, 3.5];
  const tracks = [-2.5, -0.8, 0.8, 2.5];

  return (
    <group>
      <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial color="#2e333a" roughness={0.92} metalness={0.08} />
      </mesh>

      {beams.map((z) => (
        <group key={z} position={[0, h - 0.12, z]}>
          <mesh castShadow>
            <boxGeometry args={[ROOM.w - 0.4, 0.08, 0.22]} />
            <Steel color="#1a1d22" roughness={0.45} />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <boxGeometry args={[ROOM.w - 0.4, 0.2, 0.06]} />
            <Steel color="#22262d" />
          </mesh>
        </group>
      ))}

      {[-3, 0, 3].map((x) => (
        <mesh key={x} position={[x, h - 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, ROOM.d - 1, 8]} />
          <Steel color="#3a404a" metalness={0.65} roughness={0.4} />
        </mesh>
      ))}

      {[-2, 0, 2].map((x) =>
        [-2.5, 0, 2.5].map((z) => (
          <group key={`${x}-${z}`} position={[x, h - 0.28, z]}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 0.12, 6]} />
              <Steel color="#6b7280" />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 10]} />
              <Steel color="#9ca3af" metalness={0.9} roughness={0.25} />
            </mesh>
          </group>
        ))
      )}

      {tracks.map((x, ti) => (
        <group key={x} position={[x, h - 0.42, 0]}>
          <mesh>
            <boxGeometry args={[0.08, 0.05, ROOM.d - 1.2]} />
            <Steel color="#111827" />
          </mesh>
          {[-3, -1.5, 0, 1.5, 3].map((z) => (
            <group key={z} position={[0, -0.04, z]}>
              <mesh>
                <boxGeometry args={[0.12, 0.04, 0.55]} />
                <meshStandardMaterial
                  color="#e8eef5"
                  emissive="#dbeafe"
                  emissiveIntensity={1.35}
                  roughness={0.35}
                  metalness={0.1}
                />
              </mesh>
              <pointLight
                intensity={ti % 2 === 0 ? 0.55 : 0.4}
                distance={7}
                color="#e8f0ff"
                position={[0, -0.2, 0]}
              />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function PermanentCalisthenicsRig() {
  const hd = ROOM.d / 2;
  return (
    <group position={[0, 0, -hd + 1.1]}>
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 0.03, 0.3]} receiveShadow castShadow>
          <boxGeometry args={[0.45, 0.06, 0.55]} />
          <Steel color="#1f2937" roughness={0.5} />
        </mesh>
      ))}
      {[-1.4, 1.4].map((x) => (
        <mesh key={`u-${x}`} castShadow position={[x, 1.35, 0.3]}>
          <boxGeometry args={[0.1, 2.7, 0.1]} />
          <Steel color="#374151" />
        </mesh>
      ))}
      <mesh castShadow position={[0, 2.55, 0.3]}>
        <boxGeometry args={[2.9, 0.1, 0.1]} />
        <Steel color="#4b5563" />
      </mesh>
      <mesh castShadow position={[0, 2.1, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 2.85, 14]} />
        <Steel color="#9ca3af" metalness={0.9} roughness={0.28} />
      </mesh>
      {[-1.4, 1.4].map((x) => (
        <mesh key={`b-${x}`} castShadow position={[x, 2.0, -0.25]} rotation={[0.55, 0, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.9]} />
          <Steel color="#4b5563" />
        </mesh>
      ))}
      {[-0.85, -0.35, 0.35, 0.85].map((x) => (
        <group key={x} position={[x, 2.45, 0.38]}>
          <mesh castShadow>
            <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
            <Steel color="#d1d5db" metalness={0.95} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.06]} />
            <Steel color="#6b7280" />
          </mesh>
        </group>
      ))}
      {[-0.85, 0.85].map((x) => (
        <group key={`ring-${x}`}>
          <mesh position={[x, 1.85, 0.45]}>
            <cylinderGeometry args={[0.008, 0.008, 1.1, 6]} />
            <meshStandardMaterial color="#1c1917" roughness={0.7} />
          </mesh>
          <mesh position={[x, 1.25, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.11, 0.02, 10, 24]} />
            <meshStandardMaterial color="#292524" roughness={0.45} metalness={0.15} />
          </mesh>
        </group>
      ))}
      <mesh position={[-0.35, 1.9, 0.5]} rotation={[Math.PI / 2, 0.2, 0]} castShadow>
        <torusGeometry args={[0.16, 0.018, 10, 24]} />
        <meshStandardMaterial
          color="#ea580c"
          roughness={0.4}
          metalness={0.1}
          emissive="#c2410c"
          emissiveIntensity={0.08}
        />
      </mesh>
      <mesh position={[0.35, 1.7, 0.48]} castShadow>
        <boxGeometry args={[0.06, 0.7, 0.02]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.75} />
      </mesh>
    </group>
  );
}

function WoodenParallettes() {
  const wood = useMemo(() => makeWoodMap(), []);
  return (
    <group position={[-2.8, 0, 1.2]} rotation={[0, 0.2, 0]}>
      {[-0.22, 0.22].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh castShadow position={[0, 0.18, -0.18]}>
            <cylinderGeometry args={[0.028, 0.032, 0.36, 10]} />
            <meshStandardMaterial map={wood} roughness={0.7} metalness={0.05} />
          </mesh>
          <mesh castShadow position={[0, 0.18, 0.18]}>
            <cylinderGeometry args={[0.028, 0.032, 0.36, 10]} />
            <meshStandardMaterial map={wood} roughness={0.7} metalness={0.05} />
          </mesh>
          <mesh castShadow position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.42, 12]} />
            <meshStandardMaterial map={wood} roughness={0.55} metalness={0.08} />
          </mesh>
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[0.12, 0.04, 0.48]} />
            <meshStandardMaterial map={wood} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PermanentYogaCorner() {
  return (
    <group position={[3.2, 0, 2.4]}>
      <mesh castShadow receiveShadow position={[0, 0.02, 0]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[0.68, 0.04, 1.85]} />
        <meshStandardMaterial color="#0f766e" roughness={0.78} metalness={0.06} />
      </mesh>
      <mesh castShadow position={[-0.35, 0.06, -0.7]}>
        <boxGeometry args={[0.23, 0.1, 0.15]} />
        <meshStandardMaterial color="#c4a574" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[-0.35, 0.06, -0.5]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.23, 0.1, 0.15]} />
        <meshStandardMaterial color="#b8956a" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.15, 0.12, -0.85]} rotation={[0, 0.5, Math.PI / 2]}>
        <capsuleGeometry args={[0.1, 0.45, 6, 12]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.8} />
      </mesh>
    </group>
  );
}

function PlyometricBox() {
  const wood = useMemo(() => makeWoodMap(), []);
  return (
    <group position={[3.4, 0, -1.5]} rotation={[0, -0.35, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[0.75, 0.6, 0.55]} />
        <meshStandardMaterial map={wood} roughness={0.65} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.76, 0.02, 0.56]} />
        <meshStandardMaterial color="#57534e" roughness={0.7} />
      </mesh>
    </group>
  );
}

function GymChair({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <group position={[-3.2, 0, -0.8]} rotation={[0, 0.6, 0]}>
      {[
        [-0.22, 0.42, -0.22],
        [0.22, 0.42, -0.22],
        [-0.22, 0.42, 0.22],
        [0.22, 0.42, 0.22],
      ].map((p, i) => (
        <mesh key={i} castShadow position={p as [number, number, number]}>
          <cylinderGeometry args={[0.018, 0.02, 0.84, 8]} />
          <Steel color="#6b7280" />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.48, 0]}>
        <boxGeometry args={[0.48, 0.07, 0.48]} />
        <meshStandardMaterial color="#1c1917" roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh castShadow position={[0, 0.85, -0.2]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.48, 0.55, 0.07]} />
        <meshStandardMaterial color="#292524" roughness={0.5} metalness={0.06} />
      </mesh>
    </group>
  );
}

function LivedInClutter() {
  return (
    <group>
      <mesh position={[-2.2, 0.05, -2.8]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.08, 12]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.85} />
      </mesh>
      <mesh position={[2.5, 0.03, -2.6]} rotation={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.35, 0.05, 0.22]} />
        <meshStandardMaterial color="#44403c" roughness={0.9} />
      </mesh>
      <mesh position={[-ROOM.w / 2 + 0.08, 1.4, 1.5]}>
        <boxGeometry args={[0.08, 1.6, 1.2]} />
        <Steel color="#374151" roughness={0.5} />
      </mesh>
    </group>
  );
}

export interface IndustrialGymFacilityProps {
  editMode?: boolean;
  coachClearRadius?: number;
  showChair?: boolean;
  onFloorClick?: () => void;
}

export function IndustrialGymFacility({
  editMode = false,
  coachClearRadius = 0.55,
  showChair = false,
  onFloorClick,
}: IndustrialGymFacilityProps) {
  return (
    <group name="industrial-gym-facility">
      <RubberFloor onFloorClick={onFloorClick} />
      <GymWalls />
      <GymCeiling />
      <PermanentCalisthenicsRig />
      <WoodenParallettes />
      <PermanentYogaCorner />
      <PlyometricBox />
      <GymChair visible={showChair} />
      <LivedInClutter />

      {editMode && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[coachClearRadius - 0.02, coachClearRadius, 48]} />
          <meshBasicMaterial color="#f87171" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export const GYM_ROOM = ROOM;
