import React from 'react';
import { Droplets, Sparkles, MessageCircle, Dumbbell } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeUp, Reveal } from './Reveal';
import { IconBadge, IconBadgeVariant } from '../ui/IconBadge';
import { SectionHeading } from './SectionHeading';

const FEATURES: { icon: typeof Droplets; title: string; copy: string; variant: IconBadgeVariant }[] = [
  {
    icon: Droplets,
    title: 'Daily check-ins',
    copy: 'Log water, sleep, mood, and medication in seconds. Streaks and quick logs keep the habit small enough for a busy day.',
    variant: 'teal',
  },
  {
    icon: Sparkles,
    title: 'Evolve Astra',
    copy: 'Your companion grows with consistent check-ins so staying on track feels like play, not another dashboard.',
    variant: 'violet',
  },
  {
    icon: MessageCircle,
    title: 'AI Coach in English',
    copy: 'Chat with Astra for 5-minute micro-sessions that adapt to how you feel — clear English guidance for sleep, stress, and recovery.',
    variant: 'teal',
  },
  {
    icon: Dumbbell,
    title: 'Train with Aura & Aurora',
    copy: 'Guided calisthenics and yoga with 3D coaches — bodyweight strength and breath work you can follow on screen.',
    variant: 'violet',
  },
];

export const Features: React.FC = () => (
  <Reveal id="features" className="max-w-5xl mx-auto w-full mb-16 scroll-mt-28">
    <SectionHeading
      kicker="Features"
      title="Four ways to stay well"
      copy="Check-ins, Astra coaching in English, and guided training with Aura and Aurora."
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
