import React, { useId } from 'react';
import { motion } from 'motion/react';
import type { MovementPattern } from '../content/calisthenicsProgram';

type TrainerMode = MovementPattern | 'rest' | 'idle';

interface AnimatedWorkoutTrainerProps {
  pattern?: MovementPattern;
  isResting?: boolean;
  isHold?: boolean;
  label?: string;
  className?: string;
}

function resolveMode(pattern: MovementPattern | undefined, isResting: boolean): TrainerMode {
  if (isResting) return 'rest';
  return pattern || 'idle';
}

/** Stylized coach figure — pose + motion keyed to movement pattern. */
export const AnimatedWorkoutTrainer: React.FC<AnimatedWorkoutTrainerProps> = ({
  pattern,
  isResting = false,
  isHold = false,
  label,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const skinId = `trainerSkin-${uid}`;
  const accentId = `trainerAccent-${uid}`;
  const mode = resolveMode(pattern, isResting);
  const tip =
    label ||
    (isResting
      ? 'Shake it out — breathe and reset.'
      : isHold
        ? 'Hold steady — match my posture.'
        : 'Watch the rhythm, then match my form.');

  return (
    <div
      className={`trainer-stage relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#12263f] to-[#0b192c] ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-40 pointer-events-none trainer-stage-grid" />
      <div className="relative flex flex-col items-center justify-end min-h-[11.5rem] sm:min-h-[13rem] px-3 pt-4 pb-3">
        <TrainerFigure mode={mode} isHold={isHold} skinId={skinId} accentId={accentId} />
        <p className="mt-2 text-[11px] text-center text-slate-300/90 leading-snug max-w-[16rem]">{tip}</p>
      </div>
    </div>
  );
};

function TrainerFigure({
  mode,
  isHold,
  skinId,
  accentId,
}: {
  mode: TrainerMode;
  isHold: boolean;
  skinId: string;
  accentId: string;
}) {
  const duration = isHold || mode === 'rest' || mode === 'core' ? 2.4 : 1.15;
  const bounce = mode === 'rest' ? 4 : mode === 'mobility' ? 6 : 3;

  return (
    <motion.div
      className="relative w-[140px] h-[160px] sm:w-[160px] sm:h-[180px]"
      animate={{ y: [0, -bounce, 0] }}
      transition={{ duration: duration * 1.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 120 150" className="w-full h-full drop-shadow-[0_8px_18px_rgba(47,122,115,0.35)]">
        <defs>
          <linearGradient id={skinId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7dd3c7" />
            <stop offset="100%" stopColor="#2f7a73" />
          </linearGradient>
          <linearGradient id={accentId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0c75e" />
            <stop offset="100%" stopColor="#c9a227" />
          </linearGradient>
        </defs>

        <ellipse cx="60" cy="138" rx="34" ry="6" fill="rgba(125,211,199,0.18)" />

        <motion.g
          animate={
            mode === 'rest'
              ? { rotate: [-4, 4, -4] }
              : mode === 'mobility'
                ? { rotate: [-8, 8, -8] }
                : { rotate: 0 }
          }
          style={{ transformOrigin: '60px 28px' }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="60" cy="22" r="12" fill={`url(#${skinId})`} />
          <circle cx="56" cy="20" r="1.6" fill="#0b192c" />
          <circle cx="64" cy="20" r="1.6" fill="#0b192c" />
          <path d="M55 26 Q60 29 65 26" stroke="#0b192c" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M48 18 Q60 8 72 18" stroke={`url(#${accentId})`} strokeWidth="3" fill="none" strokeLinecap="round" />
        </motion.g>

        <motion.g
          animate={poseFor(mode)}
          style={{ transformOrigin: '60px 55px' }}
          transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M60 34 L60 78" stroke={`url(#${skinId})`} strokeWidth="8" strokeLinecap="round" />
          <path d="M48 48 L72 48" stroke={`url(#${skinId})`} strokeWidth="7" strokeLinecap="round" opacity="0.85" />
        </motion.g>

        <Limb dIdle="M48 48 L34 68 L28 86" mode={mode} part="leftArm" duration={duration} skinId={skinId} />
        <Limb dIdle="M72 48 L86 68 L92 86" mode={mode} part="rightArm" duration={duration} skinId={skinId} />
        <Limb dIdle="M60 78 L48 108 L44 132" mode={mode} part="leftLeg" duration={duration} skinId={skinId} />
        <Limb dIdle="M60 78 L72 108 L76 132" mode={mode} part="rightLeg" duration={duration} skinId={skinId} />
      </svg>
    </motion.div>
  );
}

type LimbPart = 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';

function Limb({
  dIdle,
  mode,
  part,
  duration,
  skinId,
}: {
  dIdle: string;
  mode: TrainerMode;
  part: LimbPart;
  duration: number;
  skinId: string;
}) {
  const frames = limbFrames(mode, part, dIdle);
  return (
    <motion.path
      d={dIdle}
      animate={{ d: frames }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      stroke={`url(#${skinId})`}
      strokeWidth="6.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function poseFor(mode: TrainerMode) {
  switch (mode) {
    case 'horizontal_push':
      return { rotate: [0, 12, 0], y: [0, 8, 0] };
    case 'vertical_push':
      return { rotate: [0, -6, 0], y: [0, 4, 0] };
    case 'vertical_pull':
    case 'horizontal_pull':
      return { rotate: [0, -4, 0], y: [0, -6, 0] };
    case 'anterior_legs':
      return { rotate: [0, 6, 0], y: [0, 10, 0] };
    case 'posterior_legs':
      return { rotate: [0, -8, 0], y: [0, -4, 0] };
    case 'core':
      return { rotate: [0, 0, 0], y: [0, 2, 0] };
    case 'mobility':
      return { rotate: [-6, 6, -6], y: [0, -3, 0] };
    case 'rest':
      return { rotate: [0, 0, 0], y: [0, 2, 0] };
    default:
      return { rotate: 0, y: [0, 2, 0] };
  }
}

function limbFrames(mode: TrainerMode, part: LimbPart, dIdle: string): string[] {
  const pushDown = {
    leftArm: 'M48 52 L28 70 L18 78',
    rightArm: 'M72 52 L92 70 L102 78',
    leftLeg: 'M58 82 L46 112 L42 132',
    rightLeg: 'M62 82 L74 112 L78 132',
  };
  const pushUp = {
    leftArm: 'M48 46 L30 58 L22 64',
    rightArm: 'M72 46 L90 58 L98 64',
    leftLeg: 'M58 78 L48 108 L44 132',
    rightLeg: 'M62 78 L72 108 L76 132',
  };
  const pullUp = {
    leftArm: 'M48 44 L36 28 L30 16',
    rightArm: 'M72 44 L84 28 L90 16',
    leftLeg: 'M58 80 L50 112 L46 134',
    rightLeg: 'M62 80 L70 112 L74 134',
  };
  const pullDown = {
    leftArm: 'M48 50 L34 66 L28 82',
    rightArm: 'M72 50 L86 66 L92 82',
    leftLeg: 'M60 78 L48 108 L44 132',
    rightLeg: 'M60 78 L72 108 L76 132',
  };
  const squatDown = {
    leftArm: 'M48 52 L36 72 L32 88',
    rightArm: 'M72 52 L84 72 L88 88',
    leftLeg: 'M58 78 L40 100 L38 124',
    rightLeg: 'M62 78 L80 100 L82 124',
  };
  const bridge = {
    leftArm: 'M48 56 L34 78 L30 96',
    rightArm: 'M72 56 L86 78 L90 96',
    leftLeg: 'M55 70 L42 88 L40 108',
    rightLeg: 'M65 70 L78 88 L80 108',
  };
  const plank = {
    leftArm: 'M50 58 L28 70 L18 74',
    rightArm: 'M70 58 L92 70 L102 74',
    leftLeg: 'M58 78 L78 90 L98 98',
    rightLeg: 'M62 78 L82 92 L102 102',
  };
  const stretchA = {
    leftArm: 'M48 46 L28 34 L18 22',
    rightArm: 'M72 48 L90 70 L96 90',
    leftLeg: 'M58 78 L40 110 L36 132',
    rightLeg: 'M62 78 L80 108 L88 128',
  };
  const stretchB = {
    leftArm: 'M48 48 L30 70 L24 90',
    rightArm: 'M72 46 L92 34 L102 22',
    leftLeg: 'M58 78 L42 108 L34 128',
    rightLeg: 'M62 78 L78 110 L84 132',
  };
  const restA = {
    leftArm: 'M48 50 L32 62 L38 78',
    rightArm: 'M72 50 L88 62 L82 78',
    leftLeg: 'M58 78 L48 110 L44 132',
    rightLeg: 'M62 78 L72 110 L76 132',
  };
  const restB = {
    leftArm: 'M48 50 L36 66 L42 80',
    rightArm: 'M72 50 L84 66 L78 80',
    leftLeg: 'M58 78 L50 110 L46 132',
    rightLeg: 'M62 78 L70 110 L74 132',
  };

  const pick = (map: Record<LimbPart, string>) => map[part];

  switch (mode) {
    case 'horizontal_push':
    case 'vertical_push':
      return [pick(pushUp), pick(pushDown), pick(pushUp)];
    case 'vertical_pull':
    case 'horizontal_pull':
      return [pick(pullDown), pick(pullUp), pick(pullDown)];
    case 'anterior_legs':
      return [dIdle, pick(squatDown), dIdle];
    case 'posterior_legs':
      return [dIdle, pick(bridge), dIdle];
    case 'core':
      return [pick(plank), pick(plank), pick(plank)];
    case 'mobility':
      return [pick(stretchA), pick(stretchB), pick(stretchA)];
    case 'rest':
      return [pick(restA), pick(restB), pick(restA)];
    default:
      return [dIdle, dIdle, dIdle];
  }
}
