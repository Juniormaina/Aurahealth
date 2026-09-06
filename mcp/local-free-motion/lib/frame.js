import { addVec3, lerp, lerpVec3, smoothstep } from './math.js';
import { posesForResolved, resolveMotionPrompt } from './catalog.js';
import { breathInflation, cueBoneOffsets, parseCueMotion, posturalSway } from './cues.js';

export function blendRigPose(a, b, t) {
  const ease = smoothstep(t);
  const keys = new Set([...Object.keys(a.bones), ...Object.keys(b.bones)]);
  const bones = {};
  for (const k of keys) {
    bones[k] = lerpVec3(a.bones[k] ?? [0, 0, 0], b.bones[k] ?? [0, 0, 0], ease);
  }
  return {
    rootRot: lerpVec3(a.rootRot, b.rootRot, ease),
    rootY: lerp(a.rootY, b.rootY, ease),
    bones,
  };
}

export function applyOverlays(rig, flags, elapsed, breathPhase, isBreathing) {
  const cues = cueBoneOffsets(flags, elapsed);
  const sway = posturalSway(elapsed, 1);
  const inflate = breathInflation(breathPhase, isBreathing);
  const bones = { ...rig.bones };

  const add = (name, delta) => {
    bones[name] = addVec3(bones[name] ?? [0, 0, 0], delta);
  };

  add('mixamorigHips', sway.pelvis);
  add('mixamorigSpine', sway.spine);
  add('mixamorigSpine2', sway.chest);
  add('mixamorigHead', sway.head);

  const chestLift = (inflate - 0.4) * 0.06;
  add('mixamorigSpine1', [-chestLift, 0, 0]);
  add('mixamorigSpine2', [-chestLift * 0.7, 0, 0]);

  for (const [name, delta] of Object.entries(cues)) {
    add(name, delta);
  }

  return {
    ...rig,
    rootY: rig.rootY + Math.sin(elapsed * 1.4) * 0.004,
    bones,
    overlays: { cues, sway, inflate },
  };
}

export function buildAnimationFrame(args) {
  const prompt = String(args.prompt ?? '').trim();
  if (!prompt) {
    throw new Error('prompt is required');
  }
  const progress = Math.min(1, Math.max(0, Number(args.progress ?? 0.5)));
  const elapsed = Number(args.elapsed ?? 1.2);
  const breathPhase = args.breath_phase ?? 'idle';
  const isBreathing = args.is_breathing !== false;
  const trainerId = args.trainer_id === 'aura' ? 'aura' : 'aurora';
  const resolved = resolveMotionPrompt(prompt, args.asset_id);
  const { poseA, poseB } = posesForResolved(resolved);
  const blended = blendRigPose(poseA, poseB, resolved.mode === 'yoga' ? 0 : progress);
  const flags = parseCueMotion(prompt, resolved.poseName, resolved.assetId);
  const posed = applyOverlays(blended, flags, elapsed, breathPhase, isBreathing);

  return {
    engine: 'local-free-motion',
    cost: 0,
    trainerId,
    prompt,
    resolved,
    progress,
    elapsed,
    breathPhase,
    isBreathing,
    cueFlags: flags,
    rootRot: posed.rootRot,
    rootY: posed.rootY,
    bones: posed.bones,
    overlays: posed.overlays,
    source: {
      poseLibrary: 'src/components/organic/coachPoseLibrary.ts',
      cues: 'src/components/organic/trainerConfig.ts',
      motion: 'src/components/organic/organicMotion.ts',
    },
  };
}
