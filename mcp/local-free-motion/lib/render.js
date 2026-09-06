import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const BG = [2, 44, 34, 255];
const LIMB = [16, 185, 129, 255];
const JOINT = [110, 231, 183, 255];
const ACCENT = [52, 211, 153, 255];

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const payload = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(payload), 0);
  return Buffer.concat([len, payload, crc]);
}

export function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const dest = y * (width * 4 + 1);
    raw[dest] = 0;
    rgba.copy(raw, dest + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return png;
}

function setPx(rgba, w, h, x, y, color) {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const i = (y * w + x) * 4;
  rgba[i] = color[0];
  rgba[i + 1] = color[1];
  rgba[i + 2] = color[2];
  rgba[i + 3] = color[3];
}

function drawLine(rgba, w, h, x0, y0, x1, y1, color, thick = 2) {
  if (![x0, y0, x1, y1].every(Number.isFinite)) return;
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = Math.round(x0);
  let y = Math.round(y0);
  const xEnd = Math.round(x1);
  const yEnd = Math.round(y1);
  const limit = (w + h) * 4;
  for (let n = 0; n < limit; n++) {
    for (let ox = -thick; ox <= thick; ox++) {
      for (let oy = -thick; oy <= thick; oy++) {
        if (ox * ox + oy * oy <= thick * thick) setPx(rgba, w, h, x + ox, y + oy, color);
      }
    }
    if (x === xEnd && y === yEnd) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

/** Sagittal step: angle 0 is screen-up. Positive euler X flexes the chain forward. */
function step(from, angle, len) {
  return [from[0] + Math.sin(angle) * len, from[1] - Math.cos(angle) * len];
}

function projectJoints(frame, w, h) {
  const bones = frame.bones;
  const g = (name) => bones[name] ?? [0, 0, 0];
  const scale = Math.min(w, h) * 0.28;
  const hips = [w * 0.5, h * 0.52 - frame.rootY * scale * 0.8];
  const root = frame.rootRot[0];

  const spineAng = root + g('mixamorigHips')[0] + g('mixamorigSpine')[0];
  const chestAng = spineAng + g('mixamorigSpine1')[0] + g('mixamorigSpine2')[0];
  const headAng = chestAng + g('mixamorigNeck')[0] + g('mixamorigHead')[0];
  const spine = step(hips, spineAng, 0.32 * scale);
  const chest = step(spine, chestAng, 0.3 * scale);
  const head = step(chest, headAng, 0.26 * scale);

  const spread = 0.14 * scale;
  const lShoulder = [chest[0] - spread, chest[1]];
  const rShoulder = [chest[0] + spread, chest[1]];
  const lArmAng = chestAng + g('mixamorigLeftShoulder')[0] + g('mixamorigLeftArm')[0];
  const rArmAng = chestAng + g('mixamorigRightShoulder')[0] + g('mixamorigRightArm')[0];
  const lElbow = step(lShoulder, lArmAng, 0.38 * scale);
  const rElbow = step(rShoulder, rArmAng, 0.38 * scale);
  const lHand = step(lElbow, lArmAng + g('mixamorigLeftForeArm')[0], 0.34 * scale);
  const rHand = step(rElbow, rArmAng + g('mixamorigRightForeArm')[0], 0.34 * scale);

  const lHip = [hips[0] - 0.1 * scale, hips[1]];
  const rHip = [hips[0] + 0.1 * scale, hips[1]];
  const lThighAng = root + g('mixamorigLeftUpLeg')[0] + Math.PI;
  const rThighAng = root + g('mixamorigRightUpLeg')[0] + Math.PI;
  const lKnee = step(lHip, lThighAng, 0.42 * scale);
  const rKnee = step(rHip, rThighAng, 0.42 * scale);
  const lFoot = step(lKnee, lThighAng + g('mixamorigLeftLeg')[0], 0.4 * scale);
  const rFoot = step(rKnee, rThighAng + g('mixamorigRightLeg')[0], 0.4 * scale);

  return fitJoints({
    hips, spine, chest, head,
    lShoulder, rShoulder, lElbow, rElbow, lHand, rHand,
    lHip, rHip, lKnee, rKnee, lFoot, rFoot,
  }, w, h);
}

function fitJoints(joints, w, h, pad = 64) {
  const pts = Object.values(joints);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  const bw = Math.max(1, maxX - minX);
  const bh = Math.max(1, maxY - minY);
  const s = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh);
  const ox = (w - (minX + maxX) * s) / 2;
  const oy = (h - (minY + maxY) * s) / 2 + 10;
  const fitted = {};
  for (const [name, [x, y]] of Object.entries(joints)) {
    fitted[name] = [x * s + ox, y * s + oy];
  }
  return fitted;
}

export function renderSvg(frame, width, height) {
  const j = projectJoints(frame, width, height);
  const segs = [
    [j.hips, j.spine], [j.spine, j.chest], [j.chest, j.head],
    [j.chest, j.lShoulder], [j.lShoulder, j.lElbow], [j.lElbow, j.lHand],
    [j.chest, j.rShoulder], [j.rShoulder, j.rElbow], [j.rElbow, j.rHand],
    [j.hips, j.lHip], [j.lHip, j.lKnee], [j.lKnee, j.lFoot],
    [j.hips, j.rHip], [j.rHip, j.rKnee], [j.rKnee, j.rFoot],
  ];
  const lines = segs
    .map(([a, b]) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" />`)
    .join('\n    ');
  const dots = Object.values(j)
    .map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" />`)
    .join('\n    ');
  const title = `${frame.resolved.mode} / ${frame.resolved.id} · p=${frame.progress}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#022c22"/>
  <text x="24" y="36" fill="#6ee7b7" font-family="Segoe UI, sans-serif" font-size="16">${escapeXml(title)}</text>
  <text x="24" y="58" fill="#34d399" font-family="Segoe UI, sans-serif" font-size="12">${escapeXml(frame.prompt)}</text>
  <g fill="none" stroke="#10b981" stroke-width="6" stroke-linecap="round">${lines}</g>
  <g fill="#6ee7b7">${dots}</g>
</svg>
`;
}

function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }[ch]));
}

export function renderPng(frame, width, height) {
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = BG[0];
    rgba[i * 4 + 1] = BG[1];
    rgba[i * 4 + 2] = BG[2];
    rgba[i * 4 + 3] = BG[3];
  }
  const j = projectJoints(frame, width, height);
  const segs = [
    [j.hips, j.spine], [j.spine, j.chest], [j.chest, j.head],
    [j.chest, j.lShoulder], [j.lShoulder, j.lElbow], [j.lElbow, j.lHand],
    [j.chest, j.rShoulder], [j.rShoulder, j.rElbow], [j.rElbow, j.rHand],
    [j.hips, j.lHip], [j.lHip, j.lKnee], [j.lKnee, j.lFoot],
    [j.hips, j.rHip], [j.rHip, j.rKnee], [j.rKnee, j.rFoot],
  ];
  for (const [a, b] of segs) {
    drawLine(rgba, width, height, a[0], a[1], b[0], b[1], LIMB, 3);
  }
  for (const p of Object.values(j)) {
    drawLine(rgba, width, height, p[0], p[1], p[0], p[1], JOINT, 5);
  }
  drawLine(rgba, width, height, j.head[0], j.head[1], j.head[0], j.head[1], ACCENT, 8);
  return encodePng(width, height, rgba);
}

export function writeFrameArtifacts(frame, outDir, width, height, frameIndex = null) {
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const idx = frameIndex === null || Number.isNaN(frameIndex) ? '' : `_f${String(Math.floor(frameIndex)).padStart(4, '0')}`;
  const base = `${stamp}_${frame.resolved.mode}_${frame.resolved.id}${idx}`;
  const jsonPath = path.join(outDir, `${base}.json`);
  const svgPath = path.join(outDir, `${base}.svg`);
  const pngPath = path.join(outDir, `${base}.png`);
  // Write JSON first, then SVG, then PNG — avoid holding large buffers in parallel
  fs.writeFileSync(jsonPath, JSON.stringify(frame, null, 2));
  fs.writeFileSync(svgPath, renderSvg(frame, width, height));
  const png = renderPng(frame, width, height);
  fs.writeFileSync(pngPath, png);
  return { jsonPath, svgPath, pngPath, base, bytes: { png: png.length } };
}
