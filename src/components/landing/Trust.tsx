import React from 'react';
import { ShieldCheck, Lock, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeUp, Reveal } from './Reveal';
import { IconBadge } from '../ui/IconBadge';

const BADGES = [
  { icon: ShieldCheck, label: 'Private by design', copy: 'Check-ins stay on your account. We do not sell health logs.' },
  { icon: Lock, label: 'Cancel anytime', copy: '7-day trial, then you choose a plan. No surprise crypto wallet required.' },
  { icon: HeartHandshake, label: 'Not a clinical trial', copy: 'Aura is a wellness companion, not a substitute for professional care.' },
];

export const Trust: React.FC = () => (
  <Reveal id="trust" className="max-w-5xl mx-auto w-full mb-16 scroll-mt-24">
    <motion.h2 variants={fadeUp} className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-6">
      Built for calm, not hype
    </motion.h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {BADGES.map((item, i) => (
        <motion.article
          key={item.label}
          variants={fadeUp}
          className="aura-card p-5 rounded-2xl border border-[#242E42]"
        >
          <IconBadge icon={item.icon} variant={i === 1 ? 'violet' : 'teal'} />
          <h3 className="text-sm font-bold text-white mt-3 mb-1">{item.label}</h3>
          <p className="text-sm text-slate-400 leading-[1.6]">{item.copy}</p>
        </motion.article>
      ))}
    </div>
  </Reveal>
);
