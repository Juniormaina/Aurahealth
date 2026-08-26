import React from 'react';
import { motion } from 'motion/react';

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: 'section' | 'div';
}

export const Reveal: React.FC<RevealProps> = ({ children, className = '', id, as = 'section' }) => {
  const Tag = as === 'div' ? motion.div : motion.section;
  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.18 }}
      variants={stagger}
    >
      {children}
    </Tag>
  );
};
