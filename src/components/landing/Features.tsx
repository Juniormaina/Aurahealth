import React from 'react';
import { Droplets, Sparkles, MessageCircle, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeUp, Reveal } from './Reveal';
import { IconBadge, IconBadgeVariant } from '../ui/IconBadge';
import { SectionHeading } from './SectionHeading';

const FEATURES: { icon: typeof Droplets; title: string; copy: string; variant: IconBadgeVariant }[] = [
  {
    icon: Droplets,
    title: 'Track daily wellness',
    copy: 'Log water, sleep, mood, and medication in seconds — or sync a wearable.',
    variant: 'teal',
  },
  {
    icon: Sparkles,
    title: 'Evolve Astra',
    copy: 'Your companion grows with consistent check-ins so staying on track feels like play.',
    variant: 'violet',
  },
  {
    icon: MessageCircle,
    title: 'Natural-language sessions',
    copy: 'AI-guided 5-minute micro-sessions that adapt to how you feel, in the language you speak.',
    variant: 'teal',
  },
  {
    icon: Building2,
    title: 'Corporate wellness',
    copy: 'Bulk signups for teams — culturally relevant sessions and shared impact reports.',
    variant: 'violet',
  },
];

export const Features: React.FC = () => (
  <Reveal id="features" className="max-w-5xl mx-auto w-full mb-16 scroll-mt-28">
    <SectionHeading
      kicker="Features"
      title="Four ways to stay well"
      copy="Glass modules for the daily habit, Astra, language-first sessions, and team programs."
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {FEATURES.map((item) => (
        <motion.article
          key={item.title}
          variants={fadeUp}
          className="glass-panel landing-feature-card p-5 rounded-2xl flex gap-3 min-w-0"
        >
          <IconBadge icon={item.icon} variant={item.variant} />
          <div>
            <h3 className="text-sm font-bold text-[#F7FFFC] mb-1">{item.title}</h3>
            <p className="text-sm text-[#D5E4DC] leading-[1.6]">{item.copy}</p>
          </div>
        </motion.article>
      ))}
    </div>
  </Reveal>
);
