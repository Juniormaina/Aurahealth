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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
      {SUBSCRIPTION_TIERS.map((tier) => {
        const featured = tier.id === 'annual';
        return (
          <motion.article
            key={tier.id}
            variants={fadeUp}
            className={`aura-card landing-feature-card p-6 rounded-2xl border flex flex-col relative ${
              featured
                ? 'border-[var(--color-primary)] shadow-[0_12px_40px_rgba(47,122,115,0.22)] lg:-translate-y-1 z-10 pt-7'
                : 'border-[#242E42]'
            }`}
          >
            {featured && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
                Best value
              </span>
            )}
            <h3 className="text-sm font-bold text-white">{tier.name}</h3>
            <p className="text-3xl font-bold text-white font-display mt-2 tabular-nums">
              ${tier.priceUsd}
              <span className="text-sm font-semibold text-slate-400">
                {tier.cadence !== 'once' ? `/${tier.cadence === 'month' ? 'mo' : 'yr'}` : ''}
              </span>
            </p>
            <p className="text-sm text-slate-400 leading-[1.6] mt-2 flex-1">{tier.highlight}</p>
            <button
              type="button"
              onClick={onStartTrial}
              className={featured ? 'btn-primary mt-5 justify-center text-xs' : 'btn-ghost mt-5 justify-center text-xs'}
            >
              Get started
            </button>
          </motion.article>
        );
      })}
    </div>
  </Reveal>
);
