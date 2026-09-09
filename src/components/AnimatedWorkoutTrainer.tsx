import React, { useEffect, useId, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { MovementPattern } from '../content/calisthenicsProgram';
import { useReducedMotionPref } from '../lib/motionPrefs';

type TrainerMode = MovementPattern | 'rest' | 'idle';

interface AnimatedWorkoutTrainerProps {
  pattern?: MovementPattern;
  isResting?: boolean;
  isHold?: boolean;
  /** When true, coach drives a clear work-rep loop (default: !isResting). */
  isMirroring?: boolean;
  label?: string;
  className?: string;
  exerciseName?: string;
}

function resolveMode(pattern: MovementPattern | undefined, isResting: boolean): TrainerMode {
  if (isResting) return 'rest';
  return pattern || 'idle';
}

function moveTitle(mode: TrainerMode): string {
  switch (mode) {
    case 'horizontal_push':
      return 'Push-up rhythm';
    case 'vertical_push':
      return 'Pike / press rhythm';
    case 'vertical_pull':
      return 'Pull-up rhythm';
    case 'horizontal_pull':
      return 'Row rhythm';
    case 'anterior_legs':
      return 'Squat rhythm';
    case 'posterior_legs':
      return 'Bridge rhythm';
    case 'core':
      return 'Plank hold';
    case 'mobility':
      return 'Mobility flow';
    case 'rest':
      return 'Recovery shake-out';
    default:
      return 'Ready stance';
  }
}

/** Coach Aura trains WITH you — full-body loops that mimic the current pattern. */
export const AnimatedWorkoutTrainer: React.FC<AnimatedWorkoutTrainerProps> = ({
  pattern,
  isResting = false,
  isHold = false,
  isMirroring,
  label,
  className = '',
  exerciseName,
}) => {
  const uid = useId().replace(/:/g, '');
  const reduceMotion = useReducedMotionPref();
  const skinId = `trainerSkin-${uid}`;
  const accentId = `trainerAccent-${uid}`;
  const mode = resolveMode(pattern, isResting);
  const mirroring = isMirroring ?? !isResting;
  const [repTick, setRepTick] = useState(0);

  const cycleSec = isHold || mode === 'core' ? 2.8 : mode === 'rest' ? 2.2 : 1.05;

  useEffect(() => {
    if (reduceMotion || !mirroring || isHold || mode === 'core' || mode === 'rest' || mode === 'idle') return;
    const id = setInterval(() => setRepTick((n) => n + 1), cycleSec * 1000);
    return () => clearInterval(id);
  }, [reduceMotion, mirroring, isHold, mode, cycleSec]);

  useEffect(() => {
    setRepTick(0);
  }, [mode, mirroring]);

  const tip =
    label ||
    (isResting
      ? 'Coach Aura is shaking it out with you — breathe.'
      : isHold
        ? 'Hold with me — same shape, same breath.'
        : 'Move with Coach Aura — mirror every rep.');

  return (
    <div
      className={`trainer-stage relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#12263f] to-[#0b192c] ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-40 pointer-events-none trainer-stage-grid" />

      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border border-[var(--color-harmony)]/40 bg-[var(--color-harmony)]/15 text-[var(--color-harmony)]">
          {mirroring ? 'Training with you' : 'Recovering with you'}
        </span>
        <AnimatePresence mode="wait">
          {mirroring && !isResting && !isHold && mode !== 'core' && (
            <motion.span
              key={repTick}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-bold tabular-nums px-2 py-1 rounded-full bg-white/10 text-white border border-white/15"
            >
              Rep {(repTick % 12) + 1}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex flex-col items-center justify-end min-h-[13rem] sm:min-h-[15rem] px-3 pt-10 pb-3">
        <MirroringFigure
          mode={mode}
          isHold={isHold}
          mirroring={mirroring}
          cycleSec={cycleSec}
          skinId={skinId}
          accentId={accentId}
          reduceMotion={reduceMotion}
        />
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-harmony)]/90">
          {moveTitle(mode)}
          {exerciseName ? ` · ${exerciseName}` : ''}
        </p>
        <p className="mt-1 text-[11px] text-center text-slate-300/90 leading-snug max-w-[17rem]">{tip}</p>
      </div>
    </div>
  );
};

type PoseKey = 'a' | 'b';

function MirroringFigure({
  mode,
  isHold,
  mirroring,
  cycleSec,
  skinId,
  accentId,
  reduceMotion,
}: {
  mode: TrainerMode;
  isHold: boolean;
  mirroring: boolean;
  cycleSec: number;
  skinId: string;
  accentId: string;
  reduceMotion: boolean;
}) {
  const poses = fullBodyPoses(mode);
  const holdStill = isHold || mode === 'core';
  const animateKey: PoseKey[] = holdStill || mode === 'rest' || !mirroring || reduceMotion ? ['a', 'a'] : ['a', 'b', 'a'];
  const loop = reduceMotion
    ? { duration: 0 }
    : { duration: cycleSec, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <motion.div
      className="relative w-[150px] h-[170px] sm:w-[170px] sm:h-[190px]"
      animate={reduceMotion ? { y: 0 } : mirroring && !holdStill && mode !== 'rest'
          ? { y: [0, -2, 0] }
          : mode === 'rest'
            ? { y: [0, -5, 0] }
            : { y: [0, -2, 0] }
      }
      transition={loop}
    >
      <svg viewBox="0 0 120 150" className="w-full h-full drop-shadow-[0_10px_20px_rgba(47,122,115,0.4)]">
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

        <motion.ellipse
          cx="60"
          cy="140"
          ry="5"
          fill="rgba(125,211,199,0.2)"
          animate={{ rx: mirroring && !holdStill && !reduceMotion ? [30, 38, 30] : 32 }}
          transition={loop}
        />

        {/* Head */}
        <motion.circle
          r="11"
          fill={`url(#${skinId})`}
          animate={{
            cx: animateKey.map((k) => poses[k].head[0]),
            cy: animateKey.map((k) => poses[k].head[1]),
          }}
          transition={loop}
        />
        <motion.path
          stroke={`url(#${accentId})`}
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: animateKey.map((k) => {
              const [x, y] = poses[k].head;
              return `M${x - 9} ${y - 2} Q${x} ${y - 11} ${x + 9} ${y - 2}`;
            }),
          }}
          transition={loop}
        />

        {/* Torso */}
        <motion.path
          stroke={`url(#${skinId})`}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          animate={{ d: animateKey.map((k) => poses[k].torso) }}
          transition={loop}
        />

        {/* Limbs */}
        {(['leftArm', 'rightArm', 'leftLeg', 'rightLeg'] as const).map((limb) => (
          <motion.path
            key={limb}
            stroke={`url(#${skinId})`}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            animate={{ d: animateKey.map((k) => poses[k][limb]) }}
            transition={loop}
          />
        ))}
      </svg>
    </motion.div>
  );
}

type BodyPose = {
  head: [number, number];
  torso: string;
  leftArm: string;
  rightArm: string;
  leftLeg: string;
  rightLeg: string;
};

/** Two keyframes per pattern — A (start/top) and B (bottom/peak effort). */
function fullBodyPoses(mode: TrainerMode): Record<PoseKey, BodyPose> {
  const standing: BodyPose = {
    head: [60, 22],
    torso: 'M60 34 L60 78',
    leftArm: 'M48 48 L34 68 L28 86',
    rightArm: 'M72 48 L86 68 L92 86',
    leftLeg: 'M60 78 L48 110 L44 132',
    rightLeg: 'M60 78 L72 110 L76 132',
  };

  switch (mode) {
    case 'horizontal_push':
      // High plank → low push-up
      return {
        a: {
          head: [28, 48],
          torso: 'M36 55 L95 58',
          leftArm: 'M40 55 L28 72 L22 78',
          rightArm: 'M55 56 L55 78',
          leftLeg: 'M95 58 L108 72',
          rightLeg: 'M88 58 L102 78',
        },
        b: {
          head: [30, 68],
          torso: 'M38 72 L92 74',
          leftArm: 'M42 72 L26 78 L20 82',
          rightArm: 'M58 73 L52 86',
          leftLeg: 'M92 74 L108 78',
          rightLeg: 'M85 74 L100 86',
        },
      };
    case 'vertical_push':
      // Pike high → pike low (shoulders load)
      return {
        a: {
          head: [60, 78],
          torso: 'M60 55 L60 70',
          leftArm: 'M55 58 L35 78 L28 95',
          rightArm: 'M65 58 L85 78 L92 95',
          leftLeg: 'M60 70 L48 95 L42 118',
          rightLeg: 'M60 70 L72 95 L78 118',
        },
        b: {
          head: [60, 92],
          torso: 'M60 62 L60 78',
          leftArm: 'M55 66 L38 70 L30 78',
          rightArm: 'M65 66 L82 70 L90 78',
          leftLeg: 'M60 78 L50 100 L46 120',
          rightLeg: 'M60 78 L70 100 L74 120',
        },
      };
    case 'vertical_pull':
      // Dead hang → chin over bar
      return {
        a: {
          head: [60, 55],
          torso: 'M60 66 L60 100',
          leftArm: 'M50 68 L36 40 L30 28',
          rightArm: 'M70 68 L84 40 L90 28',
          leftLeg: 'M60 100 L50 122 L48 138',
          rightLeg: 'M60 100 L70 122 L72 138',
        },
        b: {
          head: [60, 28],
          torso: 'M60 40 L60 78',
          leftArm: 'M50 44 L38 28 L32 18',
          rightArm: 'M70 44 L82 28 L88 18',
          leftLeg: 'M60 78 L48 108 L44 128',
          rightLeg: 'M60 78 L72 108 L76 128',
        },
      };
    case 'horizontal_pull':
      // Hang under bar → chest to bar
      return {
        a: {
          head: [60, 70],
          torso: 'M60 58 L60 90',
          leftArm: 'M50 60 L30 48 L22 40',
          rightArm: 'M70 60 L90 48 L98 40',
          leftLeg: 'M60 90 L48 115 L44 135',
          rightLeg: 'M60 90 L72 115 L76 135',
        },
        b: {
          head: [60, 42],
          torso: 'M60 50 L60 82',
          leftArm: 'M50 52 L32 38 L24 30',
          rightArm: 'M70 52 L88 38 L96 30',
          leftLeg: 'M60 82 L50 110 L46 130',
          rightLeg: 'M60 82 L70 110 L74 130',
        },
      };
    case 'anterior_legs':
      // Stand → deep squat
      return {
        a: standing,
        b: {
          head: [60, 48],
          torso: 'M60 58 L60 88',
          leftArm: 'M48 68 L36 88 L32 102',
          rightArm: 'M72 68 L84 88 L88 102',
          leftLeg: 'M58 88 L38 105 L34 128',
          rightLeg: 'M62 88 L82 105 L86 128',
        },
      };
    case 'posterior_legs':
      // Supine → hips up bridge
      return {
        a: {
          head: [28, 78],
          torso: 'M36 80 L85 95',
          leftArm: 'M40 82 L28 95',
          rightArm: 'M55 88 L55 105',
          leftLeg: 'M85 95 L100 110',
          rightLeg: 'M78 93 L95 118',
        },
        b: {
          head: [30, 70],
          torso: 'M38 72 L82 58',
          leftArm: 'M42 74 L30 90',
          rightArm: 'M55 68 L58 88',
          leftLeg: 'M82 58 L100 70',
          rightLeg: 'M75 60 L92 85',
        },
      };
    case 'core':
      // Steady plank (tiny breath)
      return {
        a: {
          head: [24, 55],
          torso: 'M32 60 L98 62',
          leftArm: 'M36 60 L24 78 L20 84',
          rightArm: 'M55 60 L55 82',
          leftLeg: 'M98 62 L110 74',
          rightLeg: 'M90 62 L105 82',
        },
        b: {
          head: [24, 54],
          torso: 'M32 59 L98 61',
          leftArm: 'M36 59 L24 77 L20 83',
          rightArm: 'M55 59 L55 81',
          leftLeg: 'M98 61 L110 73',
          rightLeg: 'M90 61 L105 81',
        },
      };
    case 'mobility':
      return {
        a: {
          head: [48, 30],
          torso: 'M50 42 L58 78',
          leftArm: 'M48 50 L28 36 L18 24',
          rightArm: 'M58 52 L80 70 L92 90',
          leftLeg: 'M58 78 L40 110 L36 132',
          rightLeg: 'M58 78 L80 108 L90 128',
        },
        b: {
          head: [72, 30],
          torso: 'M70 42 L62 78',
          leftArm: 'M62 52 L40 70 L28 90',
          rightArm: 'M72 50 L92 36 L102 24',
          leftLeg: 'M62 78 L44 108 L36 128',
          rightLeg: 'M62 78 L80 110 L86 132',
        },
      };
    case 'rest':
      return {
        a: {
          head: [60, 24],
          torso: 'M60 36 L60 78',
          leftArm: 'M48 50 L30 58 L36 78',
          rightArm: 'M72 50 L90 58 L84 78',
          leftLeg: 'M60 78 L48 110 L44 132',
          rightLeg: 'M60 78 L72 110 L76 132',
        },
        b: {
          head: [60, 24],
          torso: 'M60 36 L60 78',
          leftArm: 'M48 50 L34 66 L40 82',
          rightArm: 'M72 50 L86 66 L80 82',
          leftLeg: 'M60 78 L50 110 L46 132',
          rightLeg: 'M60 78 L70 110 L74 132',
        },
      };
    default:
      return { a: standing, b: standing };
  }
}
