import React from 'react';
import { Coins, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { CountUp } from './CountUp';
import { fadeUp, Reveal } from './Reveal';
import { IconBadge } from '../ui/IconBadge';
import { SectionHeading } from './SectionHeading';

export const Rewards: React.FC = () => (
  <Reveal id="rewards" className="max-w-5xl mx-auto w-full mb-16 scroll-mt-28">
    <SectionHeading
      kicker="Rewards"
      title="Points that float, perks that wait"
      copy="Optional after you start. Earn wellness points for check-ins and redeem partner perks — separate from the calm daily habit."
    />
    <div className="rewards-band rounded-2xl p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.article variants={fadeUp} className="glass-panel vault-card landing-feature-card p-6 rounded-2xl">
          <IconBadge icon={Coins} variant="teal" size="lg" className="mb-4" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#D5E4DC] mb-3">Wellness points</p>
          <div className="glass-token font-display tabular-nums text-[#F7FFFC]">
            <span className="text-4xl font-bold leading-none">
              <CountUp to={350} />
            </span>
          </div>
          <p className="text-sm text-[#D5E4DC] leading-[1.6] mt-4">
            Daily check-ins unlock clinic vouchers, gym passes, and streak shields. Open Rewards in the app when you want them.
          </p>
        </motion.article>

        <motion.article variants={fadeUp} className="glass-panel vault-card landing-feature-card p-6 rounded-2xl">
          <IconBadge icon={Gift} variant="violet" size="lg" className="mb-4" />
          <h3 className="text-lg font-bold text-[#F7FFFC] font-display mb-1">Weekly wellness perks</h3>
          <p className="text-sm text-[#D5E4DC] leading-[1.6]">
            After you sign in, spin for partner health codes and bonus points. The core product is still a five-minute session with Astra.
          </p>
        </motion.article>
      </div>
    </div>
  </Reveal>
);
