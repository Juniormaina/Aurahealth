import React from 'react';
import { VALUE_PROPS } from '../../content/valueProps';

interface CtaProps {
  onUpgrade: () => void;
}

export const Cta: React.FC<CtaProps> = ({ onUpgrade }) => (
  <section className="max-w-3xl mx-auto w-full mb-16 text-center aura-card p-8 rounded-2xl border border-[#242E42]">
    <h2 className="text-2xl sm:text-3xl font-bold text-white font-display leading-snug">
      {VALUE_PROPS.ctaHeadline}
    </h2>
    <button type="button" onClick={onUpgrade} className="btn-primary text-sm px-6 py-3 mt-6">
      Upgrade to Premium
    </button>
  </section>
);
