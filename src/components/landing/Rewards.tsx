import React from 'react';
import { Coins, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { CountUp } from './CountUp';
import { fadeUp, Reveal } from './Reveal';
import { IconBadge } from '../ui/IconBadge';

export const Rewards: React.FC = () => (
  <Reveal id="rewards" className="max-w-5xl mx-auto w-full mb-16 scroll-mt-24">
    <motion.h2 variants={fadeUp} className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">
      Rewards
    </motion.h2>
    <motion.p variants={fadeUp} className="text-center text-sm text-slate-400 mb-6 leading-[1.6] max-w-xl mx-auto">
      Optional after you start. Earn wellness points for check-ins and redeem partner perks — separate from the calm daily habit.
    </motion.p>
    <div className="rewards-band rounded-2xl p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.article variants={fadeUp} className="aura-card landing-feature-card p-6 rounded-2xl border border-[#242E42]">
          <IconBadge icon={Coins} variant="teal" size="lg" className="mb-4" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Wellness points</p>
          <p className="text-4xl font-bold text-white font-display tabular-nums">
            <CountUp to={350} />
          </p>
          <p className="text-sm text-slate-400 leading-[1.6] mt-3">
            Daily check-ins unlock clinic vouchers, gym passes, and streak shields. Open Rewards in the app when you want them.
          </p>
        </motion.article>

        <motion.article variants={fadeUp} className="aura-card landing-feature-card p-6 rounded-2xl border border-[#242E42]">
          <IconBadge icon={Gift} variant="violet" size="lg" className="mb-4" />
          <h3 className="text-lg font-bold text-white font-display mb-1">Weekly wellness perks</h3>
          <p className="text-sm text-slate-400 leading-[1.6]">
            After you sign in, spin for partner health codes and bonus points. The core product is still a five-minute session with Astra.
          </p>
        </motion.article>
      </div>
    </div>
  </Reveal>
);
