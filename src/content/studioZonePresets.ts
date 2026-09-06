import type { GearMeshKind } from './studioGearCatalog';

export type ZonePresetId = 'calisthenics_rig' | 'restorative_yoga' | 'hybrid_flow' | 'clear';

export interface ZonePlacementSeed {
  gearId: GearMeshKind;
  /** Grid cell coordinates (integer) */
  gx: number;
  gz: number;
  yawDeg: number;
}

export interface ZonePreset {
  id: ZonePresetId;
  label: string;
  description: string;
  accent: string;
  placements: ZonePlacementSeed[];
}

/** Instant layout toggles for the Aura / Aurora playground. */
export const STUDIO_ZONE_PRESETS: readonly ZonePreset[] = [
  {
    id: 'calisthenics_rig',
    label: 'Calisthenics Rig',
    description: 'Pull-up frame, parallel bars, rings, and band',
    accent: '#34d399',
    placements: [
      { gearId: 'pull_up_station', gx: 0, gz: -6, yawDeg: 0 },
      { gearId: 'parallel_bars', gx: -4, gz: 2, yawDeg: 90 },
      { gearId: 'gymnastics_rings', gx: 4, gz: 1, yawDeg: 0 },
      { gearId: 'resistance_band', gx: 3, gz: -4, yawDeg: 45 },
    ],
  },
  {
    id: 'restorative_yoga',
    label: 'Restorative Yoga',
    description: 'Mat, blocks, strap, and bolster studio',
    accent: '#a7f3d0',
    placements: [
      { gearId: 'yoga_mat', gx: 0, gz: 2, yawDeg: 0 },
      { gearId: 'cork_block', gx: -2, gz: -2, yawDeg: 0 },
      { gearId: 'cork_block', gx: 2, gz: -2, yawDeg: 90 },
      { gearId: 'cotton_strap', gx: 3, gz: 4, yawDeg: 0 },
      { gearId: 'bolster', gx: 0, gz: -5, yawDeg: 90 },
    ],
  },
  {
    id: 'hybrid_flow',
    label: 'Hybrid Flow',
    description: 'Bodyweight + mobility hybrid zone',
    accent: '#6ee7b7',
    placements: [
      { gearId: 'yoga_mat', gx: -3, gz: 1, yawDeg: 90 },
      { gearId: 'gymnastics_rings', gx: 3, gz: -3, yawDeg: 0 },
      { gearId: 'resistance_band', gx: 4, gz: 3, yawDeg: 0 },
      { gearId: 'cork_block', gx: -4, gz: -3, yawDeg: 0 },
      { gearId: 'parallel_bars', gx: 0, gz: -6, yawDeg: 0 },
    ],
  },
  {
    id: 'clear',
    label: 'Clear Floor',
    description: 'Empty playground — coach only',
    accent: '#64748b',
    placements: [],
  },
] as const;

export const ZONE_PRESET_BY_ID: Record<ZonePresetId, ZonePreset> = Object.fromEntries(
  STUDIO_ZONE_PRESETS.map((z) => [z.id, z])
) as Record<ZonePresetId, ZonePreset>;
