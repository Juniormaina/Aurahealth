import React from 'react';
import { motion } from 'motion/react';
import { SUBSCRIPTION_TIERS } from '../../content/valueProps';
import { fadeUp, Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

interface PricingProps {
  onStartTrial: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onStartTrial }) => (
  <Reveal id="pricing" className="max-w-5xl mx-auto w-full mb-16 scroll-mt-28">
    <SectionHeading
      kicker="Pricing"
      title="Stay as long as it serves you"
      copy="Start with a 7-day trial. Upgrade when the 5-minute habit sticks."
    />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
      {SUBSCRIPTION_TIERS.map((tier) => {
        const featured = tier.id === 'annual';
        return (
          <motion.article
            key={tier.id}
            variants={fadeUp}
            className={`glass-panel landing-feature-card p-6 rounded-2xl flex flex-col relative ${
              featured ? 'pricing-tier-featured lg:-translate-y-1 z-10 pt-7' : ''
            }`}
          >
            {featured && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
                Best value
              </span>
            )}
            <h3 className="text-sm font-bold text-[#F7FFFC]">{tier.name}</h3>
            <p className="text-3xl font-bold text-[#F7FFFC] font-display mt-2 tabular-nums">
              ${tier.priceUsd}
              <span className="text-sm font-semibold text-[#D5E4DC]">
                {tier.cadence !== 'once' ? `/${tier.cadence === 'month' ? 'mo' : 'yr'}` : ''}
              </span>
            </p>
            <p className="text-sm text-[#D5E4DC] leading-[1.6] mt-2 flex-1">{tier.highlight}</p>
            <button type="button" onClick={onStartTrial} className="btn-primary mt-5 justify-center text-xs">
              Get started
            </button>
          </motion.article>
        );
      })}
    </div>
  </Reveal>
);
