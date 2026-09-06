import type { GearMeshKind } from '../../content/studioGearCatalog';
import { GEAR_BY_ID } from '../../content/studioGearCatalog';
import type { ZonePresetId, ZonePlacementSeed } from '../../content/studioZonePresets';
import { ZONE_PRESET_BY_ID } from '../../content/studioZonePresets';
import type { ExercisePropSessionMeta } from '../../content/exercisePropAffinity';

export const STUDIO_GRID = {
  /** Cell size in meters */
  cell: 0.25,
  /** Usable half-extent from origin (cells) — gym floor training area */
  halfCells: 14,
  /** Keep clear radius around coach (meters) */
  coachClearRadius: 0.55,
  /** Legacy radius — facility now uses rectangular rubber floor */
  floorRadius: 4.5,
} as const;

export interface GearInstance {
  instanceId: string;
  gearId: GearMeshKind;
  /** World XZ on floor */
  x: number;
  z: number;
  yawDeg: number;
  /** Highlighted / in-use by the active exercise */
  sessionRole?: 'active' | 'ambient';
  /** Spawned by AI for the current module — removable on bodyweight fallback */
  sessionManaged?: boolean;
}

export interface StudioPlaygroundState {
  version: 1;
  zoneId: ZonePresetId | null;
  instances: GearInstance[];
  selectedId: string | null;
  editMode: boolean;
  /** Live session flags for exercise ↔ prop sync */
  sessionMeta?: ExercisePropSessionMeta | null;
  activeInstanceId?: string | null;
}

const STORAGE_KEY = 'aura.studioPlayground.v1';

let idSeq = 0;
export function newInstanceId(gearId: GearMeshKind): string {
  idSeq += 1;
  return `${gearId}-${Date.now().toString(36)}-${idSeq}`;
}

export function defaultPlaygroundState(): StudioPlaygroundState {
  return {
    version: 1,
    zoneId: null,
    instances: [],
    selectedId: null,
    editMode: false,
    sessionMeta: null,
    activeInstanceId: null,
  };
}

export function loadPlaygroundState(): StudioPlaygroundState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPlaygroundState();
    const parsed = JSON.parse(raw) as Partial<StudioPlaygroundState>;
    if (parsed.version !== 1 || !Array.isArray(parsed.instances)) {
      return defaultPlaygroundState();
    }
    return {
      version: 1,
      zoneId: (parsed.zoneId as ZonePresetId) ?? null,
      instances: parsed.instances.filter(
        (i) => i && typeof i.instanceId === 'string' && GEAR_BY_ID[i.gearId as GearMeshKind]
      ) as GearInstance[],
      selectedId: null,
      editMode: false,
    };
  } catch {
    return defaultPlaygroundState();
  }
}

export function savePlaygroundState(state: StudioPlaygroundState): void {
  try {
    const payload: StudioPlaygroundState = {
      version: 1,
      zoneId: state.zoneId,
      instances: state.instances.map(({ sessionRole: _r, sessionManaged: _m, ...rest }) => rest),
      selectedId: null,
      editMode: false,
      sessionMeta: null,
      activeInstanceId: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

export function snapToGrid(value: number): number {
  const c = STUDIO_GRID.cell;
  return Math.round(value / c) * c;
}

export function clampToFloor(x: number, z: number): { x: number; z: number } {
  const max = STUDIO_GRID.halfCells * STUDIO_GRID.cell;
  // Rectangular gym floor bounds (matches IndustrialGymFacility room)
  const maxX = Math.min(max, 5.0);
  const maxZ = Math.min(max, 4.0);
  const sx = snapToGrid(Math.max(-maxX, Math.min(maxX, x)));
  const sz = snapToGrid(Math.max(-maxZ, Math.min(maxZ, z)));
  return { x: sx, z: sz };
}

function rotatedExtents(width: number, depth: number, yawDeg: number): { hw: number; hd: number } {
  const rad = (yawDeg * Math.PI) / 180;
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  return {
    hw: (width * c + depth * s) / 2,
    hd: (width * s + depth * c) / 2,
  };
}

export function instanceAabb(inst: GearInstance): { minX: number; maxX: number; minZ: number; maxZ: number } {
  const def = GEAR_BY_ID[inst.gearId];
  const { hw, hd } = rotatedExtents(def.footprint.width, def.footprint.depth, inst.yawDeg);
  return {
    minX: inst.x - hw,
    maxX: inst.x + hw,
    minZ: inst.z - hd,
    maxZ: inst.z + hd,
  };
}

function aabbOverlap(
  a: { minX: number; maxX: number; minZ: number; maxZ: number },
  b: { minX: number; maxX: number; minZ: number; maxZ: number },
  pad = 0.04
): boolean {
  return !(
    a.maxX + pad < b.minX ||
    a.minX - pad > b.maxX ||
    a.maxZ + pad < b.minZ ||
    a.minZ - pad > b.maxZ
  );
}

/** True if placement is valid (no coach clear-zone / prop overlap). */
export function canPlace(
  candidate: GearInstance,
  others: GearInstance[],
  ignoreId?: string | null,
  opts?: { allowCoachOverlap?: boolean }
): boolean {
  const dist = Math.hypot(candidate.x, candidate.z);
  const def = GEAR_BY_ID[candidate.gearId];
  const reach = Math.max(def.footprint.width, def.footprint.depth) / 2;
  if (!opts?.allowCoachOverlap && dist - reach < STUDIO_GRID.coachClearRadius) return false;

  const box = instanceAabb(candidate);
  for (const o of others) {
    if (ignoreId && o.instanceId === ignoreId) continue;
    if (aabbOverlap(box, instanceAabb(o))) return false;
  }
  return true;
}

export function findOpenCell(
  gearId: GearMeshKind,
  instances: GearInstance[],
  preferred?: { x: number; z: number }
): { x: number; z: number } | null {
  const start = preferred ?? { x: 1.25, z: 1.0 };
  const cell = STUDIO_GRID.cell;
  const max = STUDIO_GRID.halfCells;
  for (let ring = 0; ring <= max; ring++) {
    for (let dx = -ring; dx <= ring; dx++) {
      for (let dz = -ring; dz <= ring; dz++) {
        if (ring > 0 && Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
        const { x, z } = clampToFloor(start.x + dx * cell, start.z + dz * cell);
        const trial: GearInstance = {
          instanceId: '__probe__',
          gearId,
          x,
          z,
          yawDeg: 0,
        };
        if (canPlace(trial, instances)) return { x, z };
      }
    }
  }
  return null;
}

export function placementsFromZone(seeds: ZonePlacementSeed[]): GearInstance[] {
  const cell = STUDIO_GRID.cell;
  const out: GearInstance[] = [];
  for (const seed of seeds) {
    const { x, z } = clampToFloor(seed.gx * cell, seed.gz * cell);
    const inst: GearInstance = {
      instanceId: newInstanceId(seed.gearId),
      gearId: seed.gearId,
      x,
      z,
      yawDeg: seed.yawDeg,
    };
    if (canPlace(inst, out)) out.push(inst);
    else {
      const open = findOpenCell(seed.gearId, out, { x, z });
      if (open) out.push({ ...inst, ...open });
    }
  }
  return out;
}

export function applyZonePreset(zoneId: ZonePresetId): GearInstance[] {
  const preset = ZONE_PRESET_BY_ID[zoneId];
  return placementsFromZone(preset?.placements ?? []);
}
