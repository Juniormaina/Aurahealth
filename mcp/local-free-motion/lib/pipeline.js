import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { workspaceRoot } from './catalog.js';
import { buildAnimationFrame } from './frame.js';
import { writeFrameArtifacts } from './render.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PYTHON_HOOK = path.join(__dirname, '..', 'pipelines', 'generate_frame.py');

export function defaultOutDir() {
  return (
    process.env.LOCAL_MOTION_OUT ||
    path.join(workspaceRoot(), 'tmp', 'local-free-motion')
  );
}

export function runPythonHook(jsonPath, engine, prompt) {
  return new Promise((resolve) => {
    const child = spawn('python', [PYTHON_HOOK, '--json-path', jsonPath, '--engine', engine, '--prompt', prompt], {
      env: process.env,
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('error', (err) => {
      resolve({ ok: false, skipped: true, reason: err.message, engine: 'python' });
    });
    child.on('close', (code) => {
      let parsed = null;
      try {
        parsed = JSON.parse(stdout.trim().split('\n').pop() || '{}');
      } catch {
        parsed = { raw: stdout.trim() };
      }
      resolve({ ok: code === 0, code, stderr: stderr.slice(-1500), ...parsed });
    });
  });
}

export async function generateLocalAnimationFrame(args) {
  const frameIndex = Number.isFinite(Number(args.frame_index)) ? Number(args.frame_index) : null;
  const frame = buildAnimationFrame(args);
  if (frameIndex !== null) frame.frameIndex = frameIndex;
  const width = Math.min(1280, Math.max(240, Number(args.width ?? 640)));
  const height = Math.min(1280, Math.max(240, Number(args.height ?? 640)));
  const outDir = args.out_dir ? path.resolve(args.out_dir) : defaultOutDir();
  const artifacts = writeFrameArtifacts(frame, outDir, width, height, frameIndex);
  const engine = String(args.engine ?? 'procedural');
  let python = { skipped: true, reason: 'procedural engine — Node raster only' };
  if (engine === 'python' || engine === 'svd') {
    python = await runPythonHook(artifacts.jsonPath, engine, frame.prompt);
    if (engine === 'svd' && !process.env.LOCAL_SVD_SCRIPT) {
      python = {
        ok: false,
        skipped: true,
        engine: 'svd',
        reason: 'LOCAL_SVD_SCRIPT unset — SVD stays dormant; used python/procedural path',
        fallback: 'python',
      };
      // Still run the safe python acknowledger so hooks stay warm without commercial APIs
      const pyAck = await runPythonHook(artifacts.jsonPath, 'python', frame.prompt);
      python.pythonAck = pyAck;
    } else if (engine === 'svd' && python && python.ok === false) {
      python.fallback = 'procedural';
    }
  }
  const resolvedEngine =
    engine === 'svd' && python?.ok && !python?.skipped
      ? 'svd'
      : engine === 'python' && python?.ok
        ? 'python'
        : 'procedural';
  return {
    ok: true,
    cost: 0,
    commercial: false,
    engine: resolvedEngine,
    frame: {
      mode: frame.resolved.mode,
      id: frame.resolved.id,
      trainerId: frame.trainerId,
      progress: frame.progress,
      breathPhase: frame.breathPhase,
      cueFlags: frame.cueFlags,
      rootY: frame.rootY,
      rootRot: frame.rootRot,
      frameIndex,
    },
    artifacts,
    python,
  };
}
