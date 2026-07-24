import React, { useState } from 'react';
import { WHEEL_PRIZES } from '../data/initialData';
import { WheelPrize } from '../types';
import { Award, Sparkles, Gift, Flame, Trophy, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpinWheelLootboxProps {
  onWinPrize: (prize: WheelPrize) => void;
  cowriesBalance: number;
}

export const SpinWheelLootbox: React.FC<SpinWheelLootboxProps> = ({ onWinPrize, cowriesBalance }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<WheelPrize | null>(null);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedPrize(null);

    // Pick random prize index
    const randomIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const degreesPerSlice = 360 / WHEEL_PRIZES.length;
    const targetDegree = 360 * 5 + (360 - randomIndex * degreesPerSlice - degreesPerSlice / 2);

    const newRotation = rotation + targetDegree;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const won = WHEEL_PRIZES[randomIndex];
      setSelectedPrize(won);
      onWinPrize(won);

      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#f59e0b', '#ec4899', '#10b981'],
      });
    }, 4000);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/30 mb-2">
            <Gift className="w-3.5 h-3.5" /> Adherence Reward Minigame
          </div>
          <h2 className="text-3xl font-black text-white">Adherence Wheel of Health</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Spin daily after reporting health check-ins to win Health Cowries, Companion XP boosts, and wellness raffle passes!
          </p>
        </div>

        {/* Wheel Container */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto my-6 flex items-center justify-center">
          {/* Top Indicator Arrow */}
          <div className="absolute -top-4 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-rose-500 drop-shadow-md" />

          {/* Rotating Wheel Graphic */}
          <div
            className="w-full h-full rounded-full border-4 border-slate-700 shadow-2xl relative overflow-hidden transition-all duration-[4000ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {WHEEL_PRIZES.map((prize, idx) => {
              const rotateAngle = (360 / WHEEL_PRIZES.length) * idx;
              return (
                <div
                  key={prize.id}
                  className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-start justify-center pt-3 text-white font-bold text-xs"
                  style={{
                    backgroundColor: prize.color,
                    transform: `rotate(${rotateAngle}deg)`,
                    clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                  }}
                >
                  <div className="transform rotate-[30deg] -translate-x-3 translate-y-2 flex flex-col items-center">
                    <span className="text-base">{prize.icon}</span>
                    <span className="text-[10px] whitespace-nowrap text-slate-900 font-extrabold">{prize.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Spin Button */}
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className="absolute z-10 w-20 h-20 rounded-full bg-slate-900 border-4 border-amber-400 shadow-2xl flex flex-col items-center justify-center text-amber-300 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-xs font-black text-white">SPIN</span>
          </button>
        </div>

        {/* Selected Prize Banner */}
        {selectedPrize && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-xl max-w-md mx-auto animate-bounce">
            <div className="text-xs text-emerald-300 font-semibold mb-1">🎉 Congratulations! You Won:</div>
            <div className="text-xl font-black text-white flex items-center justify-center gap-2">
              <span>{selectedPrize.icon}</span>
              <span>{selectedPrize.label}</span>
            </div>
          </div>
        )}

        {/* Spin Cost / Info */}
        <div className="text-xs text-slate-400 flex items-center justify-center gap-4 pt-2">
          <span>Daily Free Spin: <strong className="text-emerald-400">AVAILABLE</strong></span>
          <span>•</span>
          <span>Extra Spins: <strong className="text-amber-300">50 🐚 Cowries</strong></span>
        </div>
      </div>
    </div>
  );
};
