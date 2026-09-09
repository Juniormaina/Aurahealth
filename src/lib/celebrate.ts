import confetti from 'canvas-confetti';
import { prefersReducedMotion } from './motionPrefs';

export type CelebrateKind = 'checkin' | 'wheel' | 'levelup';

const PRESETS: Record<CelebrateKind, confetti.Options> = {
  checkin: {
    particleCount: 70,
    spread: 80,
    origin: { y: 0.5 },
    colors: ['#10b981', '#38bdf8', '#fbbf24'],
  },
  wheel: {
    particleCount: 80,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#38bdf8', '#f59e0b', '#10b981'],
  },
  levelup: {
    particleCount: 90,
    spread: 88,
    origin: { y: 0.55 },
    colors: ['#5EC8B8', '#FFB800', '#8C52FF'],
  },
};

/** Confetti for the three product moments that deserve it. No-ops when reduced motion is on. */
export function celebrate(kind: CelebrateKind): void {
  if (prefersReducedMotion()) return;
  confetti(PRESETS[kind]);
}

export function celebrateLevelUp(previousLevel: number, nextLevel: number): void {
  if (nextLevel > previousLevel) celebrate('levelup');
}
