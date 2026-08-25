import React, { useState } from 'react';
import { WHEEL_PRIZES } from '../data/initialData';
import { WheelPrize } from '../types';
import { Sparkles, Gift, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpinWheelLootboxProps {
  onWinPrize: (prize: WheelPrize) => void;
  cowriesBalance: number;
}

const COMMUNITY_WINS = [
  'Maya redeemed a $10 Gym Voucher 2m ago',
  'Kwame won +200 Cowries 5m ago',
  'Amina claimed a Clinic Discount 9m ago',
  'Leo spun a Cosmic XP Boost 12m ago',
];

export const SpinWheelLootbox: React.FC<SpinWheelLootboxProps> = ({ onWinPrize, cowriesBalance }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<WheelPrize | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setTickerIndex((i) => (i + 1) % COMMUNITY_WINS.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedPrize(null);

    const randomIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const degreesPerSlice = 360 / WHEEL_PRIZES.length;
    const targetDegree = 360 * 5 + (360 - randomIndex * degreesPerSlice - degreesPerSlice / 2);
    setRotation((prev) => prev + targetDegree);

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
    <div className="aura-card-gradient gold-panel p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-400/30 mb-2">
            <Gift className="w-3.5 h-3.5" /> Loot Wheel
          </div>
          <h2 className="text-2xl font-bold text-white">Adherence Wheel of Health</h2>
          <p className="text-xs text-slate-400 mt-1">Spin after daily logs for Cowries, XP, and partner vouchers.</p>
        </div>
        <button type="button" onClick={() => setIsOpen(true)} className="btn-primary justify-center">
          <Sparkles className="w-4 h-4" />
          Open Loot Wheel
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
        <span className="text-amber-300 font-bold mr-2">Live</span>
        {COMMUNITY_WINS[tickerIndex]}
      </div>
      <p className="text-[11px] text-slate-500">Balance: {cowriesBalance.toLocaleString()} Cowries · Extra spins 50 🐚</p>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="aura-card w-full max-w-lg p-6 relative shadow-[0_0_60px_rgba(245,158,11,0.25)]">
            <button
              type="button"
              onClick={() => !isSpinning && setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              aria-label="Close loot wheel"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-5">
              <h3 className="text-xl font-bold text-white">Spin for rewards</h3>
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
                <div className="absolute -top-4 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                <div
                  className="w-full h-full rounded-full border-4 border-amber-400/70 shadow-[0_0_40px_rgba(34,211,238,0.25)] relative overflow-hidden transition-all duration-[4000ms]"
                  style={{ transform: `rotate(${rotation}deg)`, transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.2, 1)' }}
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
                <button
                  onClick={spinWheel}
                  disabled={isSpinning}
                  className="absolute z-10 w-20 h-20 rounded-full bg-navy border-4 border-amber-400 flex flex-col items-center justify-center text-amber-300 hover:scale-105 disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span className="text-xs font-black text-white">SPIN</span>
                </button>
              </div>
              {selectedPrize && (
                <div className="bg-emerald-500/10 border border-emerald-400/40 p-4 rounded-xl">
                  <div className="text-xs text-emerald-300 font-semibold mb-1">You won</div>
                  <div className="text-xl font-black text-white">
                    {selectedPrize.icon} {selectedPrize.label}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
