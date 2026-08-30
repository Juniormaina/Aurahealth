import React from 'react';
import { motion } from 'motion/react';
import { fadeUp } from './Reveal';

const TITLE = 'Reduce Stress in 5 Minutes a Day';

export const Hero: React.FC = () => (
  <section className="hero-scene" aria-labelledby="hero-title">
    <img
      className="hero-scene-bg"
      src="/aura-hero-hills.png"
      alt=""
      aria-hidden
    />
    <div className="hero-scene-shade" aria-hidden />
    <div className="hero-scene-content">
      <motion.p variants={fadeUp} initial="hidden" animate="show" className="hero-kicker">
        – Daily Wellness & Community Adherence –
      </motion.p>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.06 }}
        className="hero-title-wrap"
      >
        <h1 id="hero-title" className="hero-glass-title">
          {TITLE}
        </h1>
      </motion.div>
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.12 }}
        className="hero-sub"
      >
        AI-guided micro-sessions in natural language built for busy professionals.
      </motion.p>
    </div>
  </section>
);
