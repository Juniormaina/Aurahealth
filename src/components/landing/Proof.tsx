import React from 'react';
import { motion } from 'motion/react';
import { VALUE_PROPS } from '../../content/valueProps';
import { ProofChart } from './ProofChart';
import { fadeUp, Reveal } from './Reveal';
import { IconBadge } from '../ui/IconBadge';
import { Moon, Activity } from 'lucide-react';

const Sparkline: React.FC<{ points: number[]; color: string }> = ({ points, color }) => {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 140;
  const h = 40;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / (max - min || 1)) * (h - 6) - 3;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const METRICS = [
  {
    label: 'Anxiety',
    badge: 'Lower anxiety over 14 days',
    copy: VALUE_PROPS.realtimeMood,
    points: [8.4, 8.1, 7.6, 7.2, 6.8, 6.1, 5.4, 4.8, 4.4, 4.2],
    color: 'var(--color-accent-secondary)',
    bar: 50,
    icon: Activity,
    variant: 'violet' as const,
    footnote:
      'Based on self-reported in-app check-ins in a demo/seeded sample (n=14 days), not a clinical trial. Individual results vary.',
  },
  {
    label: 'Sleep quality',
    badge: 'Sleep & focus support in 7 days',
    copy: VALUE_PROPS.culturalRelevance,
    points: [4.2, 4.6, 5.0, 5.5, 6.1, 6.6, 7.1, 7.4, 7.8, 8.1],
    color: 'var(--color-harmony)',
    bar: 78,
    icon: Moon,
    variant: 'teal' as const,
    footnote:
      'Illustrative trend from self-reported sleep logs. Product/legal review needed before treating this as a health outcome claim.',
  },
];

export const Proof: React.FC = () => (
  <Reveal id="proof" className="max-w-5xl mx-auto w-full mb-16 space-y-6 scroll-mt-24">
    <motion.h2 variants={fadeUp} className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400">
      Proof
    </motion.h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {METRICS.map((metric) => (
        <motion.article
          key={metric.label}
          variants={fadeUp}
          className="aura-card landing-feature-card p-5 rounded-2xl border border-[#242E42]"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <IconBadge icon={metric.icon} variant={metric.variant} size="sm" />
              {metric.label}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
              {metric.badge}
            </span>
          </div>
          <Sparkline points={metric.points} color={metric.color} />
          <div className="mt-3 h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${metric.bar}%`, background: metric.color }} />
          </div>
          <p className="text-sm text-slate-300 leading-[1.6] mt-3">{metric.copy}</p>
          <p className="text-[11px] text-slate-500 leading-[1.5] mt-3 border-t border-white/10 pt-2">{metric.footnote}</p>
        </motion.article>
      ))}
    </div>
    <motion.div variants={fadeUp} className="aura-card p-5 rounded-2xl border border-[#242E42]">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-harmony)] mb-3">
        Sleep quality vs anxiety · 14 days
      </div>
      <ProofChart />
    </motion.div>
  </Reveal>
);
