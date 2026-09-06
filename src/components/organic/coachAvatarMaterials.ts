import * as THREE from 'three';
import type { TrainerId } from './trainerConfig';
import { TRAINER_WARDROBES, applyWardrobeMuscleTone } from './coachWardrobe';

export type AvatarSurfaceKind = 'skin' | 'hair' | 'fabric' | 'shoe' | 'eye' | 'joints' | 'other';

/** Tiny procedural normal map — soft skin micro-detail. */
function makeSkinNormalMap(size = 64): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = (Math.sin(x * 0.7) + Math.cos(y * 0.55) + Math.sin((x + y) * 0.35)) * 0.5;
      img.data[i] = 128 + n * 18;
      img.data[i + 1] = 128 + Math.cos(x * 0.4 + y * 0.3) * 14;
      img.data[i + 2] = 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

/** Barefoot plantar traction micro-texture for Aurora. */
function makeFootGripNormal(size = 64): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const ridges = Math.sin(y * 0.9) * 30 + Math.sin(x * 0.35) * 12;
      img.data[i] = 128 + ridges;
      img.data[i + 1] = 128 + Math.cos(x * 0.8) * 18;
      img.data[i + 2] = 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 5);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

let sharedSkinNormal: THREE.CanvasTexture | null = null;
let sharedFootNormal: THREE.CanvasTexture | null = null;

function skinNormal(): THREE.CanvasTexture {
  if (!sharedSkinNormal) sharedSkinNormal = makeSkinNormalMap();
  return sharedSkinNormal;
}

function footNormal(): THREE.CanvasTexture {
  if (!sharedFootNormal) sharedFootNormal = makeFootGripNormal();
  return sharedFootNormal;
}

export function classifySurface(meshName: string, matName: string): AvatarSurfaceKind {
  const n = `${meshName} ${matName}`.toLowerCase();
  if (/joint/.test(n)) return 'joints';
  if (/eye|cornea|sclera|iris|pupil/.test(n)) return 'eye';
  if (/hair|scalp|brow|lash/.test(n)) return 'hair';
  if (/shoe|boot|sneaker|sole/.test(n)) return 'shoe';
  if (/shirt|pant|short|suit|vest|cloth|fabric|top|bottom|outfit|gear|sock|bra|legging/.test(n)) {
    return 'fabric';
  }
  if (/skin|face|head|body|arm|leg|hand|foot|torso|neck|chest|hip|flesh|avatar|surface|highlimbs/.test(n)) {
    return 'skin';
  }
  if (/alpha_surface|beta_surface|skinned|character|mesh/.test(n) && !/joint|bone/.test(n)) {
    return 'skin';
  }
  return 'other';
}

function toPhysical(orig: THREE.Material): THREE.MeshPhysicalMaterial {
  if ((orig as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial) {
    return (orig as THREE.MeshPhysicalMaterial).clone();
  }
  const std = orig as THREE.MeshStandardMaterial;
  const mat = new THREE.MeshPhysicalMaterial();
  if (std.isMeshStandardMaterial) {
    mat.color.copy(std.color);
    mat.map = std.map;
    mat.normalMap = std.normalMap;
    mat.roughnessMap = std.roughnessMap;
    mat.metalnessMap = std.metalnessMap;
    mat.aoMap = std.aoMap;
    mat.emissive.copy(std.emissive);
    mat.emissiveIntensity = std.emissiveIntensity;
    mat.emissiveMap = std.emissiveMap;
    mat.roughness = std.roughness;
    mat.metalness = std.metalness;
    mat.envMapIntensity = std.envMapIntensity ?? 1;
    mat.transparent = std.transparent;
    mat.opacity = std.opacity;
    mat.side = std.side;
  } else if ((orig as THREE.MeshBasicMaterial).isMeshBasicMaterial) {
    const basic = orig as THREE.MeshBasicMaterial;
    mat.color.copy(basic.color);
    mat.map = basic.map;
  }
  return mat;
}

function styleSkin(mat: THREE.MeshPhysicalMaterial, trainerId: TrainerId) {
  const w = TRAINER_WARDROBES[trainerId];
  const p = w.physique;
  mat.color.set(p.skinTone);
  mat.roughness = trainerId === 'aura' ? 0.4 : 0.44;
  mat.metalness = 0.0;
  mat.sheen = trainerId === 'aura' ? 0.48 : 0.62;
  mat.sheenRoughness = trainerId === 'aura' ? 0.4 : 0.48;
  mat.sheenColor.set(p.skinSheen);
  mat.transmission = trainerId === 'aurora' ? 0.075 : 0.05;
  mat.thickness = trainerId === 'aurora' ? 0.48 : 0.62;
  mat.attenuationColor.set(p.skinAttenuation);
  mat.attenuationDistance = trainerId === 'aurora' ? 0.7 : 0.95;
  mat.clearcoat = trainerId === 'aura' ? 0.1 : 0.14;
  mat.clearcoatRoughness = 0.52;
  mat.envMapIntensity = 0.9;
  if (!mat.normalMap) {
    mat.normalMap = skinNormal();
    mat.normalScale = new THREE.Vector2(
      trainerId === 'aura' ? 0.45 : 0.32,
      trainerId === 'aura' ? 0.45 : 0.32
    );
  }
  mat.emissive.set('#3a2010');
  mat.emissiveIntensity = 0.025;
}

function styleHair(mat: THREE.MeshPhysicalMaterial, trainerId: TrainerId) {
  mat.color.set(trainerId === 'aurora' ? '#1c1917' : '#0b3d2e');
  mat.roughness = 0.62;
  mat.metalness = 0.05;
  mat.sheen = 0.35;
  mat.sheenRoughness = 0.4;
  mat.sheenColor.set('#44403c');
  mat.clearcoat = 0.25;
  mat.clearcoatRoughness = 0.35;
  mat.envMapIntensity = 0.7;
}

function styleShoe(mat: THREE.MeshPhysicalMaterial, trainerId: TrainerId) {
  if (TRAINER_WARDROBES[trainerId].barefoot) {
    // Aurora: treat shoe geo as barefoot skin with grip
    styleSkin(mat, trainerId);
    mat.normalMap = footNormal();
    mat.normalScale = new THREE.Vector2(0.65, 0.65);
    mat.roughness = 0.55;
    mat.clearcoat = 0.05;
    return;
  }
  const sole = TRAINER_WARDROBES.aura.palette.sole ?? '#0b1220';
  mat.color.set(sole);
  mat.roughness = 0.55;
  mat.metalness = 0.12;
  mat.clearcoat = 0.35;
  mat.clearcoatRoughness = 0.3;
}

function styleEye(mat: THREE.MeshPhysicalMaterial) {
  mat.color.set('#f8fafc');
  mat.roughness = 0.15;
  mat.metalness = 0.05;
  mat.clearcoat = 1;
  mat.clearcoatRoughness = 0.05;
  mat.envMapIntensity = 1.2;
}

/**
 * Upgrade body surface to PBR skin; hide joint spheres.
 * Clothing is provided by the wardrobe overlay system.
 */
export function applyHumanoidMaterials(root: THREE.Object3D, trainerId: TrainerId): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;

    const kind = classifySurface(mesh.name, Array.isArray(mesh.material) ? mesh.material[0]?.name ?? '' : mesh.material?.name ?? '');

    if (kind === 'joints') {
      mesh.visible = false;
      return;
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = true;

    if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
      const skinned = mesh as THREE.SkinnedMesh;
      skinned.bindMode = THREE.AttachedBindMode;
      skinned.frustumCulled = false;
    }

    const upgrade = (orig: THREE.Material): THREE.Material => {
      const surface = classifySurface(mesh.name, orig.name);
      const mat = toPhysical(orig);
      switch (surface) {
        case 'joints':
          mat.visible = false;
          break;
        case 'skin':
        case 'other':
          styleSkin(mat, trainerId);
          break;
        case 'hair':
          styleHair(mat, trainerId);
          break;
        case 'shoe':
          styleShoe(mat, trainerId);
          break;
        case 'eye':
          styleEye(mat);
          break;
        case 'fabric':
          // Base mesh fabric rare on Mixamo — skin underneath wardrobe overlays
          styleSkin(mat, trainerId);
          break;
        default:
          styleSkin(mat, trainerId);
          break;
      }
      mat.needsUpdate = true;
      return mat;
    };

    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(upgrade)
      : upgrade(mesh.material);
  });
}

/** Runtime muscle fill — delegates to wardrobe physique profiles. */
export function applyMuscleDefinition(
  bones: Map<string, THREE.Bone>,
  exertion: number,
  dt: number,
  trainerId: TrainerId = 'aura'
): void {
  applyWardrobeMuscleTone(bones, trainerId, exertion, dt);
}
