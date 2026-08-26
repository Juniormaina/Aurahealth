import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeUp } from './Reveal';

interface HeroProps {
  onStartTrial: () => void;
}

const PROMPTS = [
  'How are you feeling right now?',
  'Shall we take five quiet minutes to breathe?',
  'Name one thing that felt heavy today.',
  'Ready for a 5-minute micro-session?',
];

export const Hero: React.FC<HeroProps> = ({ onStartTrial }) => {
  const [pop, setPop] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    const full = PROMPTS[promptIndex];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setTyped(full);
      return;
    }
    setTyped('');
    let i = 0;
    const typeId = window.setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(typeId);
    }, 38);
    const nextId = window.setTimeout(() => {
      setPromptIndex((n) => (n + 1) % PROMPTS.length);
    }, full.length * 38 + 2200);
    return () => {
      window.clearInterval(typeId);
      window.clearTimeout(nextId);
    };
  }, [promptIndex]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center max-w-6xl mx-auto mb-16">
      <div className="text-center lg:text-left space-y-5">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-[36px] sm:text-5xl lg:text-[48px] font-bold tracking-tight text-white font-display leading-[1.15]"
        >
          Reduce Stress in 5 Minutes a Day
        </motion.h1>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.08 }}
          className="text-lg sm:text-xl text-[#9CA3AF] leading-[1.6] max-w-xl mx-auto lg:mx-0"
        >
          AI-guided micro-sessions in natural language built for busy professionals.
        </motion.p>
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="pt-1 flex justify-center lg:justify-start">
          <button type="button" onClick={onStartTrial} className="btn-primary text-sm px-6 py-3">
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.12 }}
        className="astra-glass astra-hero rounded-2xl p-6"
      >
        <button
          type="button"
          className="w-full flex items-center gap-4 text-left"
          aria-label="Astra companion preview"
          onClick={() => {
            setPop(true);
            window.setTimeout(() => setPop(false), 500);
          }}
        >
          <div className="relative shrink-0">
            <span
              className="astra-ambient absolute inset-[-10px] rounded-full bg-[var(--color-accent-secondary)]/40 blur-md pointer-events-none"
              aria-hidden
            />
            <img
              src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80"
              alt="Astra"
              className={`relative w-16 h-16 rounded-full object-cover border-2 border-[var(--color-accent-secondary)]/50 ${pop ? 'scale-105' : ''} transition-transform`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-white font-display">Astra</h2>
            <p className="text-sm text-[#9CA3AF] min-h-[2.6rem] leading-[1.5]">
              {typed}
              <span className="inline-block w-px h-4 ml-0.5 align-[-2px] bg-[var(--color-harmony)] animate-pulse" aria-hidden />
            </p>
          </div>
        </button>
      </motion.div>
    </section>
  );
};
