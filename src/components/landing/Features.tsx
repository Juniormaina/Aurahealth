import React from 'react';
import { Droplets, Sparkles, MessageCircle, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeUp, Reveal } from './Reveal';

const FEATURES = [
  {
    icon: Droplets,
    title: 'Track daily wellness',
    copy: 'Log water, sleep, mood, and medication in seconds — or sync a wearable.',
    accent: 'bg-[#00E5E5]/12 text-[#00E5E5]',
  },
  {
    icon: Sparkles,
    title: 'Evolve Astra',
    copy: 'Your companion grows with consistent check-ins so staying on track feels like play.',
    accent: 'bg-[#8C52FF]/15 text-[#C4B5FD]',
  },
  {
    icon: MessageCircle,
    title: 'Natural-language sessions',
    copy: 'AI-guided 5-minute micro-sessions that adapt to how you feel, in the language you speak.',
    accent: 'bg-[#00FFC2]/12 text-[#00FFC2]',
  },
  {
    icon: Building2,
    title: 'Corporate wellness',
    copy: 'Bulk signups for teams — culturally relevant sessions and shared impact reports.',
    accent: 'bg-[#FFB800]/15 text-[#FFB800]',
  },
];

export const Features: React.FC = () => (
  <Reveal id="features" className="max-w-5xl mx-auto w-full mb-16 scroll-mt-24">
    <motion.h2 variants={fadeUp} className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-6">
      Features
    </motion.h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {FEATURES.map((item) => (
        <motion.article
          key={item.title}
          variants={fadeUp}
          className="aura-card landing-feature-card p-5 rounded-2xl border border-[#242E42] flex gap-3"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.accent}`}>
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
            <p className="text-sm text-slate-400 leading-[1.6]">{item.copy}</p>
          </div>
        </motion.article>
      ))}
    </div>
  </Reveal>
);
