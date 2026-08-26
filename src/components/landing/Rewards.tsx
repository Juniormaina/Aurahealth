import React from 'react';
import { Coins, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { CountUp } from './CountUp';
import { fadeUp, Reveal } from './Reveal';

export const Rewards: React.FC = () => (
  <Reveal id="rewards" className="max-w-5xl mx-auto w-full mb-16 scroll-mt-24">
    <motion.h2 variants={fadeUp} className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-6">
      Rewards
    </motion.h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <motion.article variants={fadeUp} className="aura-card landing-feature-card p-6 rounded-2xl border border-[#242E42]">
        <div className="w-12 h-12 rounded-xl bg-[#FFB800]/15 text-[#FFB800] flex items-center justify-center mb-4">
          <Coins className="w-6 h-6" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Cowries balance</p>
        <p className="text-4xl font-bold text-white font-display tabular-nums">
          <CountUp to={350} />
          <span className="text-lg text-[#FFB800] ml-1">🐚</span>
        </p>
        <p className="text-sm text-slate-400 leading-[1.6] mt-3">
          Earn Cowries for daily check-ins. Spend them on clinic vouchers, gym passes, and streak shields.
        </p>
      </motion.article>

      <motion.article
        variants={fadeUp}
        className="aura-card landing-feature-card loot-wheel-card p-6 rounded-2xl border border-[#242E42] relative overflow-hidden"
      >
        <div className="loot-wheel-sheen pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-[#8C52FF]/20 text-[#C4B5FD] flex items-center justify-center mb-4 border border-[#8C52FF]/40">
            <Gift className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-display mb-1">Loot Wheel vouchers</h3>
          <p className="text-sm text-slate-400 leading-[1.6]">
            Spin after you sign in for partner health codes, clinic vouchers, and bonus Cowries. Hover to feel the play.
          </p>
        </div>
      </motion.article>
    </div>
  </Reveal>
);
