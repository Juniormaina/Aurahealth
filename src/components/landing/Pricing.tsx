import React from 'react';
import { motion } from 'motion/react';
import { SUBSCRIPTION_TIERS } from '../../content/valueProps';
import { fadeUp, Reveal } from './Reveal';

interface PricingProps {
  onStartTrial: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onStartTrial }) => (
  <Reveal id="pricing" className="max-w-5xl mx-auto w-full mb-16 scroll-mt-24">
    <motion.h2 variants={fadeUp} className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">
      Pricing
    </motion.h2>
    <motion.p variants={fadeUp} className="text-center text-sm text-slate-400 mb-6 leading-[1.6]">
      Start with a 7-day trial. Upgrade when the 5-minute habit sticks.
    </motion.p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {SUBSCRIPTION_TIERS.map((tier) => (
        <motion.article
          key={tier.id}
          variants={fadeUp}
          className={`aura-card landing-feature-card p-6 rounded-2xl border flex flex-col ${
            tier.id === 'monthly' ? 'border-[#FFB800]/50' : 'border-[#242E42]'
          }`}
        >
          <h3 className="text-sm font-bold text-white">{tier.name}</h3>
          <p className="text-3xl font-bold text-white font-display mt-2 tabular-nums">
            ${tier.priceUsd}
            <span className="text-sm font-semibold text-slate-400">
              {tier.cadence !== 'once' ? `/${tier.cadence === 'month' ? 'mo' : 'yr'}` : ''}
            </span>
          </p>
          <p className="text-sm text-slate-400 leading-[1.6] mt-2 flex-1">{tier.highlight}</p>
          <button type="button" onClick={onStartTrial} className={tier.id === 'monthly' ? 'btn-primary mt-5 justify-center text-xs' : 'btn-ghost mt-5 justify-center text-xs'}>
            {tier.id === 'monthly' ? 'Start Free Trial' : 'Choose plan'}
          </button>
        </motion.article>
      ))}
    </div>
  </Reveal>
);
