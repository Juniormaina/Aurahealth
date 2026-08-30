import React from 'react';
import { motion } from 'motion/react';
import { VALUE_PROPS } from '../../content/valueProps';
import { fadeUp, Reveal } from './Reveal';

interface CtaProps {
  onUpgrade: () => void;
}

export const Cta: React.FC<CtaProps> = ({ onUpgrade }) => (
  <Reveal className="max-w-3xl mx-auto w-full mb-16">
    <motion.div variants={fadeUp} className="text-center glass-panel p-8 rounded-2xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#F7FFFC] font-display leading-snug">
        {VALUE_PROPS.ctaHeadline}
      </h2>
      <button type="button" onClick={onUpgrade} className="btn-primary text-sm px-6 py-3 mt-6">
        Upgrade to Premium
      </button>
    </motion.div>
  </Reveal>
);
