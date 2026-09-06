/** Studio gear catalog — modular calisthenics & yoga props (procedural meshes). */

export type GearCategory = 'calisthenics' | 'yoga' | 'shared';

export type GearMeshKind =
  | 'parallel_bars'
  | 'pull_up_station'
  | 'gymnastics_rings'
  | 'yoga_mat'
  | 'cork_block'
  | 'cotton_strap'
  | 'bolster'
  | 'resistance_band'
  | 'parallettes'
  | 'plyo_box'
  | 'gym_chair';

export interface GearFootprint {
  /** Width along local X (meters) */
  width: number;
  /** Depth along local Z (meters) */
  depth: number;
}

export interface StudioGearDef {
  id: GearMeshKind;
  label: string;
  shortLabel: string;
  category: GearCategory;
  description: string;
  /** Collision / snap footprint at yaw 0 */
  footprint: GearFootprint;
  /** Visual height (meters) for scaling reference */
  height: number;
  /** Allowed yaw snaps in degrees */
  yawSteps: number[];
}

export const STUDIO_GEAR_CATALOG: readonly StudioGearDef[] = [
  {
    id: 'parallel_bars',
    label: 'Parallel Bars',
    shortLabel: 'Bars',
    category: 'calisthenics',
    description: 'Dip / L-sit station with dual rails',
    footprint: { width: 0.85, depth: 1.35 },
    height: 1.15,
    yawSteps: [0, 90],
  },
  {
    id: 'pull_up_station',
    label: 'Pull-Up Station',
    shortLabel: 'Pull-up',
    category: 'calisthenics',
    description: 'Freestanding pull-up / hang frame',
    footprint: { width: 1.2, depth: 0.55 },
    height: 2.15,
    yawSteps: [0, 90],
  },
  {
    id: 'gymnastics_rings',
    label: 'Gymnastics Rings',
    shortLabel: 'Rings',
    category: 'calisthenics',
    description: 'Suspended rings with strap anchors',
    footprint: { width: 0.95, depth: 0.45 },
    height: 2.0,
    yawSteps: [0, 90],
  },
  {
    id: 'yoga_mat',
    label: 'Yoga Mat',
    shortLabel: 'Mat',
    category: 'yoga',
    description: 'Standard practice mat (≈173 × 61 cm)',
    footprint: { width: 0.61, depth: 1.73 },
    height: 0.04,
    yawSteps: [0, 90],
  },
  {
    id: 'cork_block',
    label: 'Cork Block',
    shortLabel: 'Block',
    category: 'yoga',
    description: 'Support block for alignment',
    footprint: { width: 0.23, depth: 0.15 },
    height: 0.1,
    yawSteps: [0, 90],
  },
  {
    id: 'cotton_strap',
    label: 'Cotton Strap',
    shortLabel: 'Strap',
    category: 'yoga',
    description: 'Rolled stretch strap',
    footprint: { width: 0.28, depth: 0.12 },
    height: 0.06,
    yawSteps: [0, 90],
  },
  {
    id: 'bolster',
    label: 'Bolster',
    shortLabel: 'Bolster',
    category: 'yoga',
    description: 'Restorative cylindrical bolster',
    footprint: { width: 0.7, depth: 0.28 },
    height: 0.22,
    yawSteps: [0, 90],
  },
  {
    id: 'resistance_band',
    label: 'Resistance Band',
    shortLabel: 'Band',
    category: 'shared',
    description: 'Loop band for assisted strength work',
    footprint: { width: 0.35, depth: 0.35 },
    height: 0.08,
    yawSteps: [0, 45, 90],
  },
  {
    id: 'parallettes',
    label: 'Wooden Parallettes',
    shortLabel: 'Parallettes',
    category: 'calisthenics',
    description: 'Solid wood low parallettes for skills & push work',
    footprint: { width: 0.55, depth: 0.5 },
    height: 0.38,
    yawSteps: [0, 90],
  },
  {
    id: 'plyo_box',
    label: 'Plyometric Box',
    shortLabel: 'Plyo box',
    category: 'calisthenics',
    description: 'Wooden jump / step box',
    footprint: { width: 0.75, depth: 0.55 },
    height: 0.6,
    yawSteps: [0, 90],
  },
  {
    id: 'gym_chair',
    label: 'Gym Chair',
    shortLabel: 'Chair',
    category: 'shared',
    description: 'Padded leather seat with steel frame',
    footprint: { width: 0.55, depth: 0.55 },
    height: 1.05,
    yawSteps: [0, 90],
  },
] as const;

export const GEAR_BY_ID: Record<GearMeshKind, StudioGearDef> = Object.fromEntries(
  STUDIO_GEAR_CATALOG.map((g) => [g.id, g])
) as Record<GearMeshKind, StudioGearDef>;

export function gearDefsForMode(mode: 'calisthenics' | 'yoga'): StudioGearDef[] {
  return STUDIO_GEAR_CATALOG.filter(
    (g) => g.category === 'shared' || g.category === mode || mode === 'calisthenics'
  );
}
