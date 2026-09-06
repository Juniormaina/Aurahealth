import * as THREE from 'three';
import type { TrainerId } from './trainerConfig';
import { EMERALD } from './organicMotion';

export type WardrobePieceId =
  | 'aura_vest'
  | 'aura_shorts'
  | 'aura_sneaker_l'
  | 'aura_sneaker_r'
  | 'aurora_bra'
  | 'aurora_leggings'
  | 'aurora_waistband';

export interface PhysiqueProfile {
  /** Root uniform scale */
  rootScale: [number, number, number];
  /** Resting bone scale multipliers (x,z thicken; y length) */
  boneScale: Record<string, [number, number, number]>;
  skinTone: string;
  skinSheen: string;
  skinAttenuation: string;
  muscleBase: number;
  label: string;
}

export interface WardrobePalette {
  primary: string;
  secondary: string;
  accent: string;
  trim: string;
  sole?: string;
  midsole?: string;
}

export interface TrainerWardrobe {
  id: TrainerId;
  physique: PhysiqueProfile;
  palette: WardrobePalette;
  barefoot: boolean;
  description: string;
}

/** Procedural weave / knit normal for athletic fabric. */
export function makeFabricNormalMap(size = 96, stitch = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const weave = Math.sin(x * 1.2) * Math.cos(y * 1.2);
      const stitchLine = stitch && y % 8 < 1 ? 40 : 0;
      const nx = 128 + weave * 28 + stitchLine;
      const ny = 128 + Math.cos(x * 0.9 + y * 0.6) * 22;
      img.data[i] = nx;
      img.data[i + 1] = ny;
      img.data[i + 2] = 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(stitch ? 2.5 : 6, stitch ? 2.5 : 6);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

/** Sneaker upper: pebbled mesh + stitch channels. */
export function makeSneakerMaps(size = 128): {
  color: THREE.CanvasTexture;
  normal: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
} {
  const colorC = document.createElement('canvas');
  const normalC = document.createElement('canvas');
  const roughC = document.createElement('canvas');
  colorC.width = normalC.width = roughC.width = size;
  colorC.height = normalC.height = roughC.height = size;
  const cctx = colorC.getContext('2d')!;
  const nctx = normalC.getContext('2d')!;
  const rctx = roughC.getContext('2d')!;
  const cImg = cctx.createImageData(size, size);
  const nImg = nctx.createImageData(size, size);
  const rImg = rctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const pebble = (Math.sin(x * 0.55) * Math.cos(y * 0.7) + 1) * 0.5;
      const stitch = x % 14 < 1 || y % 18 < 1 ? 1 : 0;
      const base = 28 + pebble * 22;
      cImg.data[i] = base;
      cImg.data[i + 1] = base + 4;
      cImg.data[i + 2] = base + 10;
      cImg.data[i + 3] = 255;

      nImg.data[i] = 128 + pebble * 36 + stitch * 20;
      nImg.data[i + 1] = 128 + Math.cos(x * 0.4) * 24;
      nImg.data[i + 2] = 255;
      nImg.data[i + 3] = 255;

      const rough = 140 + pebble * 50 - stitch * 30;
      rImg.data[i] = rough;
      rImg.data[i + 1] = rough;
      rImg.data[i + 2] = rough;
      rImg.data[i + 3] = 255;
    }
  }
  cctx.putImageData(cImg, 0, 0);
  nctx.putImageData(nImg, 0, 0);
  rctx.putImageData(rImg, 0, 0);

  const mk = (canvas: HTMLCanvasElement, colorSpace?: string) => {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2.2, 2.2);
    if (colorSpace === 'srgb') t.colorSpace = THREE.SRGBColorSpace;
    else t.colorSpace = THREE.NoColorSpace;
    return t;
  };
  return {
    color: mk(colorC, 'srgb'),
    normal: mk(normalC),
    roughness: mk(roughC),
  };
}

export const TRAINER_WARDROBES: Record<TrainerId, TrainerWardrobe> = {
  aura: {
    id: 'aura',
    barefoot: false,
    description: 'Athletic vest + performance shorts + training sneakers',
    palette: {
      primary: '#059669',
      secondary: '#0f3d36',
      accent: '#34d399',
      trim: '#ecfdf5',
      sole: '#0b1220',
      midsole: '#e2e8f0',
    },
    physique: {
      label: 'Athletic calisthenics build',
      rootScale: [1.02, 1.0, 1.02],
      muscleBase: 0.55,
      skinTone: '#c68642',
      skinSheen: '#d4a574',
      skinAttenuation: '#b56e4a',
      boneScale: {
        mixamorigSpine2: [1.06, 1.0, 1.08],
        mixamorigSpine1: [1.04, 1.0, 1.05],
        mixamorigLeftArm: [1.1, 1.0, 1.1],
        mixamorigRightArm: [1.1, 1.0, 1.1],
        mixamorigLeftForeArm: [1.08, 1.0, 1.08],
        mixamorigRightForeArm: [1.08, 1.0, 1.08],
        mixamorigLeftUpLeg: [1.08, 1.0, 1.08],
        mixamorigRightUpLeg: [1.08, 1.0, 1.08],
        mixamorigLeftLeg: [1.05, 1.0, 1.05],
        mixamorigRightLeg: [1.05, 1.0, 1.05],
        mixamorigLeftShoulder: [1.06, 1.0, 1.04],
        mixamorigRightShoulder: [1.06, 1.0, 1.04],
        mixamorigHips: [1.03, 1.0, 1.04],
      },
    },
  },
  aurora: {
    id: 'aurora',
    barefoot: true,
    description: 'Sports bra + high-waisted leggings · barefoot for mat work',
    palette: {
      primary: '#064e3b',
      secondary: '#022c22',
      accent: '#6ee7b7',
      trim: '#a7f3d0',
    },
    physique: {
      label: 'Lean flexible yoga silhouette',
      rootScale: [0.94, 0.99, 0.94],
      muscleBase: 0.22,
      skinTone: '#e8b898',
      skinSheen: '#f3d5c0',
      skinAttenuation: '#f0c4a8',
      boneScale: {
        mixamorigSpine2: [0.96, 1.01, 0.95],
        mixamorigSpine1: [0.97, 1.01, 0.96],
        mixamorigHips: [0.98, 1.0, 0.97],
        mixamorigLeftArm: [0.96, 1.02, 0.96],
        mixamorigRightArm: [0.96, 1.02, 0.96],
        mixamorigLeftForeArm: [0.95, 1.02, 0.95],
        mixamorigRightForeArm: [0.95, 1.02, 0.95],
        mixamorigLeftUpLeg: [0.97, 1.03, 0.97],
        mixamorigRightUpLeg: [0.97, 1.03, 0.97],
        mixamorigLeftLeg: [0.96, 1.03, 0.96],
        mixamorigRightLeg: [0.96, 1.03, 0.96],
        mixamorigLeftShoulder: [0.97, 1.0, 0.97],
        mixamorigRightShoulder: [0.97, 1.0, 0.97],
        mixamorigNeck: [0.98, 1.0, 0.98],
      },
    },
  },
};

function fabricMat(
  color: string,
  opts: {
    normal?: THREE.Texture;
    sheen?: string;
    roughness?: number;
    clearcoat?: number;
  } = {}
): THREE.MeshPhysicalMaterial {
  const mat = new THREE.MeshPhysicalMaterial({
    color,
    roughness: opts.roughness ?? 0.7,
    metalness: 0.03,
    sheen: 0.55,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(opts.sheen ?? EMERALD.accent),
    clearcoat: opts.clearcoat ?? 0.08,
    clearcoatRoughness: 0.75,
    envMapIntensity: 0.7,
    normalMap: opts.normal ?? null,
    normalScale: new THREE.Vector2(0.55, 0.55),
  });
  return mat;
}

function attachToBone(
  bones: Map<string, THREE.Bone>,
  boneName: string,
  mesh: THREE.Object3D
): boolean {
  const bone = bones.get(boneName);
  if (!bone) return false;
  bone.add(mesh);
  return true;
}

function makeVest(palette: WardrobePalette, fabricN: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  g.name = 'wardrobe_aura_vest';
  const mat = fabricMat(palette.primary, { normal: fabricN, sheen: palette.accent, roughness: 0.68 });
  const trim = fabricMat(palette.trim, { roughness: 0.55, clearcoat: 0.15 });

  // Fitted tank torso
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.42, 20, 1, true), mat);
  body.position.set(0, 0.12, 0.02);
  body.castShadow = true;
  g.add(body);

  // Scoop neck trim
  const neck = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 8, 20), trim);
  neck.rotation.x = Math.PI / 2;
  neck.position.set(0, 0.32, 0.02);
  g.add(neck);

  // Armhole rings (suggest sleeveless cut)
  for (const x of [-0.16, 0.16]) {
    const hole = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.01, 6, 14), trim);
    hole.rotation.y = Math.PI / 2;
    hole.position.set(x, 0.22, 0.01);
    g.add(hole);
  }
  return g;
}

function makeShorts(palette: WardrobePalette, fabricN: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  g.name = 'wardrobe_aura_shorts';
  const mat = fabricMat(palette.secondary, { normal: fabricN, sheen: palette.accent, roughness: 0.74 });
  const waist = fabricMat(palette.primary, { roughness: 0.6 });

  const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.28, 18, 1, true), mat);
  shell.position.set(0, -0.05, 0);
  shell.castShadow = true;
  g.add(shell);

  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.045, 18, 1, true), waist);
  band.position.set(0, 0.08, 0);
  g.add(band);

  // Leg openings
  for (const x of [-0.09, 0.09]) {
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.095, 0.14, 12, 1, true), mat);
    cuff.position.set(x, -0.16, 0.01);
    cuff.castShadow = true;
    g.add(cuff);
  }
  return g;
}

function makeSneaker(
  side: 'L' | 'R',
  palette: WardrobePalette,
  maps: ReturnType<typeof makeSneakerMaps>
): THREE.Group {
  const g = new THREE.Group();
  g.name = side === 'L' ? 'wardrobe_aura_sneaker_l' : 'wardrobe_aura_sneaker_r';
  const upper = new THREE.MeshPhysicalMaterial({
    color: palette.secondary,
    map: maps.color,
    normalMap: maps.normal,
    roughnessMap: maps.roughness,
    roughness: 0.55,
    metalness: 0.08,
    clearcoat: 0.25,
    clearcoatRoughness: 0.35,
    envMapIntensity: 0.85,
    normalScale: new THREE.Vector2(0.7, 0.7),
  });
  const sole = new THREE.MeshPhysicalMaterial({
    color: palette.sole ?? '#0b1220',
    roughness: 0.85,
    metalness: 0.05,
  });
  const mid = new THREE.MeshPhysicalMaterial({
    color: palette.midsole ?? '#e2e8f0',
    roughness: 0.45,
    metalness: 0.1,
    clearcoat: 0.3,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.26), upper);
  body.position.set(0, 0.045, 0.04);
  body.castShadow = true;
  g.add(body);

  const toe = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), upper);
  toe.scale.set(1, 0.7, 1.15);
  toe.position.set(0, 0.04, 0.14);
  g.add(toe);

  const midsole = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.025, 0.28), mid);
  midsole.position.set(0, 0.018, 0.03);
  g.add(midsole);

  const outsole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.018, 0.29), sole);
  outsole.position.set(0, 0.005, 0.03);
  outsole.castShadow = true;
  g.add(outsole);

  return g;
}

function makeSportsBra(palette: WardrobePalette, fabricN: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  g.name = 'wardrobe_aurora_bra';
  const mat = fabricMat(palette.primary, {
    normal: fabricN,
    sheen: palette.accent,
    roughness: 0.62,
    clearcoat: 0.12,
  });
  const trim = fabricMat(palette.trim, { roughness: 0.5, clearcoat: 0.2 });

  const cup = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mat);
  cup.scale.set(1.15, 0.55, 0.75);
  cup.position.set(0, 0.18, 0.04);
  cup.castShadow = true;
  g.add(cup);

  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.165, 0.06, 18, 1, true), mat);
  band.position.set(0, 0.1, 0.02);
  g.add(band);

  // Cross-back straps suggestion
  for (const x of [-0.08, 0.08]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.02), trim);
    strap.position.set(x, 0.28, -0.06);
    strap.rotation.x = -0.35;
    g.add(strap);
  }
  return g;
}

function makeLeggings(palette: WardrobePalette, fabricN: THREE.Texture): THREE.Group {
  const g = new THREE.Group();
  g.name = 'wardrobe_aurora_leggings';
  const mat = fabricMat(palette.secondary, {
    normal: fabricN,
    sheen: palette.accent,
    roughness: 0.58,
    clearcoat: 0.1,
  });
  const waist = fabricMat(palette.primary, { roughness: 0.55, clearcoat: 0.15, sheen: palette.trim });

  // High-waisted panel
  const hiWaist = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.19, 0.22, 20, 1, true), waist);
  hiWaist.position.set(0, 0.06, 0);
  hiWaist.castShadow = true;
  g.add(hiWaist);

  const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.2, 20, 1, true), mat);
  hips.position.set(0, -0.12, 0);
  hips.castShadow = true;
  g.add(hips);

  return g;
}

function makeLegSleeve(
  side: 'L' | 'R',
  palette: WardrobePalette,
  fabricN: THREE.Texture
): THREE.Mesh {
  const mat = fabricMat(palette.secondary, {
    normal: fabricN,
    sheen: palette.accent,
    roughness: 0.58,
  });
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.42, 14, 1, true), mat);
  mesh.name = side === 'L' ? 'wardrobe_aurora_leg_l' : 'wardrobe_aurora_leg_r';
  mesh.position.set(0, -0.2, 0);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Hide Mixamo joint spheres and attach stylized wardrobe overlays to the skeleton.
 */
export function applyTrainerWardrobe(
  root: THREE.Object3D,
  bones: Map<string, THREE.Bone>,
  trainerId: TrainerId
): THREE.Group {
  const wardrobe = TRAINER_WARDROBES[trainerId];
  const layer = new THREE.Group();
  layer.name = `wardrobe_${trainerId}`;

  // Hide skeleton joint visualization — causes stick-figure look
  root.traverse((o) => {
    const n = o.name.toLowerCase();
    if (n.includes('beta_joints') || n.includes('joints')) {
      o.visible = false;
    }
  });

  const fabricN = makeFabricNormalMap(96, false);
  const stitchN = makeFabricNormalMap(96, true);

  if (trainerId === 'aura') {
    const vest = makeVest(wardrobe.palette, fabricN);
    attachToBone(bones, 'mixamorigSpine2', vest) || attachToBone(bones, 'mixamorigSpine1', vest);

    const shorts = makeShorts(wardrobe.palette, stitchN);
    attachToBone(bones, 'mixamorigHips', shorts);

    const sneakerMaps = makeSneakerMaps();
    const snL = makeSneaker('L', wardrobe.palette, sneakerMaps);
    const snR = makeSneaker('R', wardrobe.palette, sneakerMaps);
    snL.rotation.x = -0.15;
    snR.rotation.x = -0.15;
    attachToBone(bones, 'mixamorigLeftFoot', snL);
    attachToBone(bones, 'mixamorigRightFoot', snR);
  } else {
    const bra = makeSportsBra(wardrobe.palette, fabricN);
    attachToBone(bones, 'mixamorigSpine2', bra) || attachToBone(bones, 'mixamorigSpine1', bra);

    const legs = makeLeggings(wardrobe.palette, fabricN);
    attachToBone(bones, 'mixamorigHips', legs);

    const legL = makeLegSleeve('L', wardrobe.palette, fabricN);
    const legR = makeLegSleeve('R', wardrobe.palette, fabricN);
    attachToBone(bones, 'mixamorigLeftUpLeg', legL);
    attachToBone(bones, 'mixamorigRightUpLeg', legR);
    // Barefoot — no shoe overlays; foot skin remains visible for mat grip
  }

  // Marker only — garments are parented to bones so they deform with the rig
  root.add(layer);
  return layer;
}

/** Apply resting physique bone scales for distinct silhouettes. */
export function applyPhysiqueProfile(
  root: THREE.Object3D,
  bones: Map<string, THREE.Bone>,
  trainerId: TrainerId
): void {
  const profile = TRAINER_WARDROBES[trainerId].physique;
  const [sx, sy, sz] = profile.rootScale;
  root.scale.set(sx, sy, sz);

  for (const [name, scale] of Object.entries(profile.boneScale)) {
    const bone = bones.get(name);
    if (!bone) continue;
    bone.scale.set(scale[0], scale[1], scale[2]);
  }
}

/** Runtime muscle fill — Aura gets stronger definition, Aurora stays lean. */
export function applyWardrobeMuscleTone(
  bones: Map<string, THREE.Bone>,
  trainerId: TrainerId,
  exertion: number,
  dt: number
): void {
  const base = TRAINER_WARDROBES[trainerId].physique.muscleBase;
  const profile = TRAINER_WARDROBES[trainerId].physique.boneScale;
  const fill = exertion * (trainerId === 'aura' ? 0.06 : 0.028);

  for (const [name, rest] of Object.entries(profile)) {
    const bone = bones.get(name);
    if (!bone) continue;
    const tx = rest[0] * (1 + fill * (name.includes('Arm') || name.includes('UpLeg') ? 1.2 : 0.7));
    const tz = rest[2] * (1 + fill * (name.includes('Arm') || name.includes('UpLeg') ? 1.2 : 0.7));
    // Soft damp toward athletic fill without fighting rest scale
    bone.scale.x = THREE.MathUtils.damp(bone.scale.x, tx * (1 + base * 0.02), 4, dt);
    bone.scale.z = THREE.MathUtils.damp(bone.scale.z, tz * (1 + base * 0.02), 4, dt);
  }
}
