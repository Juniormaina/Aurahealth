import React, { useId } from 'react';
import { motion } from 'motion/react';

interface AnimatedYogaTrainerProps {
  animationAssetId: string;
  isBreathing?: boolean;
  breathPhase?: 'inhale' | 'hold_top' | 'exhale' | 'hold_bottom' | 'idle';
  label?: string;
  className?: string;
}

type YogaPoseFamily =
  | 'standing'
  | 'fold'
  | 'half_fold'
  | 'chair'
  | 'warrior'
  | 'triangle'
  | 'tree'
  | 'down_dog'
  | 'plank'
  | 'chaturanga'
  | 'up_dog'
  | 'cobra'
  | 'child'
  | 'seated_fold'
  | 'butterfly'
  | 'twist'
  | 'lunge'
  | 'legs_up'
  | 'savasana'
  | 'breath';

function familyFromAsset(id: string): YogaPoseFamily {
  if (id.includes('breath')) return 'breath';
  if (id.includes('uttanasana') && id.includes('ardha')) return 'half_fold';
  if (id.includes('uttanasana')) return 'fold';
  if (id.includes('utkatasana')) return 'chair';
  if (id.includes('warrior')) return 'warrior';
  if (id.includes('trikonasana')) return 'triangle';
  if (id.includes('tree')) return 'tree';
  if (id.includes('down_dog')) return 'down_dog';
  if (id.includes('plank')) return 'plank';
  if (id.includes('chaturanga')) return 'chaturanga';
  if (id.includes('up_dog')) return 'up_dog';
  if (id.includes('cobra')) return 'cobra';
  if (id.includes('child')) return 'child';
  if (id.includes('seated_fold')) return 'seated_fold';
  if (id.includes('butterfly')) return 'butterfly';
  if (id.includes('twist')) return 'twist';
  if (id.includes('lunge')) return 'lunge';
  if (id.includes('legs_up')) return 'legs_up';
  if (id.includes('savasana')) return 'savasana';
  return 'standing';
}

export const AnimatedYogaTrainer: React.FC<AnimatedYogaTrainerProps> = ({
  animationAssetId,
  isBreathing,
  breathPhase = 'idle',
  label,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const skinId = `yogaSkin-${uid}`;
  const accentId = `yogaAccent-${uid}`;
  const family = familyFromAsset(animationAssetId);
  const scale =
    breathPhase === 'inhale' ? 1.04 : breathPhase === 'exhale' ? 0.97 : breathPhase === 'hold_top' ? 1.05 : 1;

  return (
    <div
      className={`trainer-stage relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a2f28] to-[#0b192c] ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-35 pointer-events-none trainer-stage-grid" />
      <div className="relative flex flex-col items-center justify-end min-h-[11.5rem] sm:min-h-[13rem] px-3 pt-4 pb-3">
        <motion.div
          className="relative w-[140px] h-[160px] sm:w-[160px] sm:h-[180px]"
          animate={{ scale }}
          transition={{ duration: 0.85, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 120 150" className="w-full h-full drop-shadow-[0_8px_18px_rgba(47,122,115,0.3)]">
            <defs>
              <linearGradient id={skinId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9ad4c8" />
                <stop offset="100%" stopColor="#3d8f86" />
              </linearGradient>
              <linearGradient id={accentId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8d48b" />
                <stop offset="100%" stopColor="#b8973d" />
              </linearGradient>
            </defs>
            <ellipse cx="60" cy="140" rx="36" ry="5" fill="rgba(154,212,200,0.16)" />
            <YogaSilhouette family={family} skinId={skinId} accentId={accentId} breathing={Boolean(isBreathing)} />
          </svg>
        </motion.div>
        {label && (
          <p className="mt-2 text-[11px] text-center text-slate-300/90 leading-snug max-w-[16rem]">{label}</p>
        )}
      </div>
    </div>
  );
};

function YogaSilhouette({
  family,
  skinId,
  accentId,
  breathing,
}: {
  family: YogaPoseFamily;
  skinId: string;
  accentId: string;
  breathing: boolean;
}) {
  const stroke = `url(#${skinId})`;
  const pulse = breathing ? { opacity: [0.85, 1, 0.85] } : { opacity: 1 };

  const paths = posePaths(family);

  return (
    <motion.g animate={pulse} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <circle cx={paths.head[0]} cy={paths.head[1]} r="10" fill={stroke} />
      <path d={`M${paths.head[0] - 8} ${paths.head[1] - 2} Q${paths.head[0]} ${paths.head[1] - 12} ${paths.head[0] + 8} ${paths.head[1] - 2}`} stroke={`url(#${accentId})`} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {paths.limbs.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke={stroke}
          strokeWidth={i === 0 ? 7 : 6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={family === 'breath' ? { d: [d, paths.limbsAlt?.[i] || d, d] } : undefined}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </motion.g>
  );
}

function posePaths(family: YogaPoseFamily): {
  head: [number, number];
  limbs: string[];
  limbsAlt?: string[];
} {
  switch (family) {
    case 'fold':
      return {
        head: [60, 78],
        limbs: [
          'M60 55 L60 70',
          'M60 55 L40 48 L28 42',
          'M60 55 L80 48 L92 42',
          'M60 70 L48 100 L44 128',
          'M60 70 L72 100 L76 128',
        ],
      };
    case 'half_fold':
      return {
        head: [78, 48],
        limbs: [
          'M50 70 L78 55',
          'M78 55 L95 48',
          'M50 70 L38 95 L34 125',
          'M50 70 L62 95 L66 125',
        ],
      };
    case 'chair':
      return {
        head: [60, 28],
        limbs: [
          'M60 38 L60 78',
          'M48 50 L36 30 L30 18',
          'M72 50 L84 30 L90 18',
          'M60 78 L42 100 L40 122',
          'M60 78 L78 100 L80 122',
        ],
      };
    case 'warrior':
      return {
        head: [58, 26],
        limbs: [
          'M58 36 L58 72',
          'M58 48 L40 30 L32 18',
          'M58 48 L78 48 L96 48',
          'M58 72 L36 108 L32 128',
          'M58 72 L86 100 L98 118',
        ],
      };
    case 'triangle':
      return {
        head: [86, 42],
        limbs: [
          'M60 70 L86 50',
          'M86 50 L100 36',
          'M60 70 L42 95 L36 120',
          'M60 70 L88 100 L104 118',
          'M60 70 L48 55',
        ],
      };
    case 'tree':
      return {
        head: [60, 24],
        limbs: [
          'M60 34 L60 78',
          'M48 48 L40 32 L36 18',
          'M72 48 L80 32 L84 18',
          'M60 78 L60 128',
          'M60 88 L78 78 L82 70',
        ],
      };
    case 'down_dog':
      return {
        head: [38, 88],
        limbs: [
          'M55 55 L80 95',
          'M55 55 L30 95 L22 108',
          'M80 95 L100 108',
          'M55 55 L70 40',
        ],
      };
    case 'plank':
    case 'chaturanga':
      return {
        head: [22, 58],
        limbs: [
          'M30 62 L95 62',
          'M30 62 L22 78',
          'M50 62 L48 82',
          'M95 62 L102 78',
          'M78 62 L80 82',
        ],
      };
    case 'up_dog':
    case 'cobra':
      return {
        head: [78, 42],
        limbs: [
          'M40 95 L78 55',
          'M55 82 L42 100',
          'M70 70 L88 95',
          'M40 95 L28 108',
          'M40 95 L55 110',
        ],
      };
    case 'child':
      return {
        head: [60, 95],
        limbs: [
          'M60 85 L60 70',
          'M60 75 L30 68 L18 62',
          'M60 75 L90 68 L102 62',
          'M60 85 L45 105 L40 118',
          'M60 85 L75 105 L80 118',
        ],
      };
    case 'seated_fold':
      return {
        head: [88, 70],
        limbs: [
          'M50 100 L88 78',
          'M88 78 L105 70',
          'M50 100 L28 100 L12 100',
          'M50 100 L72 100 L95 100',
        ],
      };
    case 'butterfly':
      return {
        head: [60, 40],
        limbs: [
          'M60 50 L60 88',
          'M50 60 L36 50',
          'M70 60 L84 50',
          'M60 88 L40 105 L48 118',
          'M60 88 L80 105 L72 118',
        ],
      };
    case 'twist':
      return {
        head: [68, 36],
        limbs: [
          'M55 50 L55 90',
          'M55 58 L78 48 L92 42',
          'M55 58 L40 70',
          'M55 90 L35 110 L30 122',
          'M55 90 L80 108 L95 100',
        ],
      };
    case 'lunge':
      return {
        head: [55, 28],
        limbs: [
          'M55 38 L55 75',
          'M55 50 L40 32 L34 20',
          'M55 50 L72 32 L80 20',
          'M55 75 L35 110 L30 128',
          'M55 75 L90 95 L100 118',
        ],
      };
    case 'legs_up':
      return {
        head: [60, 110],
        limbs: [
          'M60 100 L60 70',
          'M50 95 L30 100',
          'M70 95 L90 100',
          'M60 70 L50 35 L48 18',
          'M60 70 L70 35 L72 18',
        ],
      };
    case 'savasana':
      return {
        head: [22, 70],
        limbs: [
          'M30 72 L95 72',
          'M40 72 L32 88',
          'M55 72 L55 90',
          'M85 72 L95 88',
          'M70 72 L70 90',
        ],
      };
    case 'breath':
      return {
        head: [60, 28],
        limbs: [
          'M60 38 L60 78',
          'M48 52 L32 60 L28 78',
          'M72 52 L88 60 L92 78',
          'M60 78 L48 110 L44 130',
          'M60 78 L72 110 L76 130',
        ],
        limbsAlt: [
          'M60 38 L60 78',
          'M48 50 L30 42 L22 30',
          'M72 50 L90 42 L98 30',
          'M60 78 L48 110 L44 130',
          'M60 78 L72 110 L76 130',
        ],
      };
    default:
      return {
        head: [60, 24],
        limbs: [
          'M60 34 L60 78',
          'M48 50 L34 68 L28 86',
          'M72 50 L86 68 L92 86',
          'M60 78 L48 110 L44 132',
          'M60 78 L72 110 L76 132',
        ],
      };
  }
}
