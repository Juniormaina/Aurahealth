import React from 'react';
import { motion } from 'motion/react';
import { fadeUp } from './Reveal';

interface SectionHeadingProps {
  kicker: string;
  title: string;
  copy?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ kicker, title, copy }) => (
  <div className="text-center mb-8 max-w-2xl mx-auto">
    <motion.p variants={fadeUp} className="view-kicker">
      {kicker}
    </motion.p>
    <motion.h2 variants={fadeUp} className="view-title">
      {title}
    </motion.h2>
    {copy && (
      <motion.p variants={fadeUp} className="view-copy mt-3">
        {copy}
      </motion.p>
    )}
  </div>
);
