import * as THREE from 'three';

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D, ImageData] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  return [c, ctx, ctx.createImageData(size, size)];
}

function toTex(
  c: HTMLCanvasElement,
  opts: { repeat?: number; colorSpace?: 'srgb' | 'none' } = {}
): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const r = opts.repeat ?? 4;
  t.repeat.set(r, r);
  t.colorSpace = opts.colorSpace === 'srgb' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Charcoal rubber gym tiles with black/grey speckles + interlocking seams. */
export function makeRubberTileMaps(size = 256): {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const [cc, , cImg] = canvas(size);
  const [nc, , nImg] = canvas(size);
  const [rc, , rImg] = canvas(size);
  const tile = 64;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const seam = x % tile < 2 || y % tile < 2 || x % tile > tile - 3 || y % tile > tile - 3;
      const speck = ((x * 17 + y * 31) % 97) / 97;
      const speck2 = ((x * 13 + y * 41) % 53) / 53;
      let g = 42 + speck * 18;
      if (speck2 > 0.82) g = 18;
      if (speck > 0.9) g = 70;
      if (seam) g = 28;

      cImg.data[i] = g;
      cImg.data[i + 1] = g;
      cImg.data[i + 2] = g + 2;
      cImg.data[i + 3] = 255;

      const nx = seam ? 100 : 128 + (speck - 0.5) * 20;
      const ny = seam ? 100 : 128 + (speck2 - 0.5) * 20;
      nImg.data[i] = nx;
      nImg.data[i + 1] = ny;
      nImg.data[i + 2] = 255;
      nImg.data[i + 3] = 255;

      const rough = seam ? 200 : 155 + speck * 40;
      rImg.data[i] = rough;
      rImg.data[i + 1] = rough;
      rImg.data[i + 2] = rough;
      rImg.data[i + 3] = 255;
    }
  }
  cc.getContext('2d')!.putImageData(cImg, 0, 0);
  nc.getContext('2d')!.putImageData(nImg, 0, 0);
  rc.getContext('2d')!.putImageData(rImg, 0, 0);

  return {
    map: toTex(cc, { repeat: 8, colorSpace: 'srgb' }),
    normalMap: toTex(nc, { repeat: 8 }),
    roughnessMap: toTex(rc, { repeat: 8 }),
  };
}

/** Painted industrial concrete. */
export function makeConcreteMaps(size = 256): {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
} {
  const [cc, , cImg] = canvas(size);
  const [nc, , nImg] = canvas(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n =
        Math.sin(x * 0.11) * 8 + Math.cos(y * 0.09) * 7 + ((x * 7 + y * 11) % 17) - 8;
      const g = 58 + n;
      cImg.data[i] = g;
      cImg.data[i + 1] = g + 1;
      cImg.data[i + 2] = g + 3;
      cImg.data[i + 3] = 255;
      nImg.data[i] = 128 + n * 1.5;
      nImg.data[i + 1] = 128 + Math.cos(x * 0.2) * 10;
      nImg.data[i + 2] = 255;
      nImg.data[i + 3] = 255;
    }
  }
  cc.getContext('2d')!.putImageData(cImg, 0, 0);
  nc.getContext('2d')!.putImageData(nImg, 0, 0);
  return {
    map: toTex(cc, { repeat: 3, colorSpace: 'srgb' }),
    normalMap: toTex(nc, { repeat: 3 }),
  };
}

/** Charcoal brickwork. */
export function makeBrickMaps(size = 256): {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
} {
  const [cc, , cImg] = canvas(size);
  const [nc, , nImg] = canvas(size);
  const bw = 48;
  const bh = 22;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const row = Math.floor(y / bh);
      const ox = row % 2 === 0 ? 0 : bw / 2;
      const lx = (x + ox) % bw;
      const ly = y % bh;
      const mortar = lx < 2 || ly < 2;
      const shade = ((row * 3 + Math.floor((x + ox) / bw)) % 5) * 4;
      const g = mortar ? 36 : 48 + shade + ((x * y) % 7);
      cImg.data[i] = g;
      cImg.data[i + 1] = g;
      cImg.data[i + 2] = g + 2;
      cImg.data[i + 3] = 255;
      nImg.data[i] = mortar ? 90 : 140;
      nImg.data[i + 1] = mortar ? 90 : 135;
      nImg.data[i + 2] = 255;
      nImg.data[i + 3] = 255;
    }
  }
  cc.getContext('2d')!.putImageData(cImg, 0, 0);
  nc.getContext('2d')!.putImageData(nImg, 0, 0);
  return {
    map: toTex(cc, { repeat: 4, colorSpace: 'srgb' }),
    normalMap: toTex(nc, { repeat: 4 }),
  };
}

/** Brushed metal plate for etched signage. */
export function makeBrushedMetalSign(size = 512): THREE.CanvasTexture {
  const [c, ctx] = canvas(size);
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, '#8a9199');
  g.addColorStop(0.5, '#c5ccd3');
  g.addColorStop(1, '#6b737c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 2) {
    ctx.fillStyle = `rgba(255,255,255,${0.02 + (y % 5) * 0.004})`;
    ctx.fillRect(0, y, size, 1);
  }
  // Etched title
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(20,24,28,0.55)';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('FITNESS PLAYGROUND', size / 2, size * 0.42);
  ctx.font = '600 28px sans-serif';
  ctx.fillText('AURORA  &  AURA', size / 2, size * 0.55);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, size - 48, size - 48);
  return toTex(c, { repeat: 1, colorSpace: 'srgb' });
}

/** Misty green hills for window backdrop. */
export function makeHillsVista(size = 512): THREE.CanvasTexture {
  const [c, ctx] = canvas(size);
  const sky = ctx.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, '#9db8c9');
  sky.addColorStop(0.45, '#c5d4c8');
  sky.addColorStop(1, '#6b8f6a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = 'rgba(40,70,45,0.55)';
  ctx.beginPath();
  ctx.moveTo(0, size * 0.7);
  ctx.quadraticCurveTo(size * 0.25, size * 0.45, size * 0.5, size * 0.62);
  ctx.quadraticCurveTo(size * 0.75, size * 0.78, size, size * 0.55);
  ctx.lineTo(size, size);
  ctx.lineTo(0, size);
  ctx.fill();

  ctx.fillStyle = 'rgba(30,55,35,0.45)';
  ctx.beginPath();
  ctx.moveTo(0, size * 0.82);
  ctx.quadraticCurveTo(size * 0.4, size * 0.6, size, size * 0.75);
  ctx.lineTo(size, size);
  ctx.lineTo(0, size);
  ctx.fill();

  // Mist veil
  ctx.fillStyle = 'rgba(200,210,205,0.28)';
  ctx.fillRect(0, size * 0.5, size, size * 0.35);

  const t = toTex(c, { repeat: 1, colorSpace: 'srgb' });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

/** Shared wood grain for parallettes / plyo box. */
export function makeWoodMap(size = 128): THREE.CanvasTexture {
  const [c, , img] = canvas(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const grain = Math.sin(y * 0.35 + Math.sin(x * 0.08) * 2) * 18;
      const r = 120 + grain;
      const g = 85 + grain * 0.7;
      const b = 48 + grain * 0.4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  c.getContext('2d')!.putImageData(img, 0, 0);
  return toTex(c, { repeat: 2, colorSpace: 'srgb' });
}
