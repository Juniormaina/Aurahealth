import React from 'react';
import { Droplets, Sparkles, Gift, Building2 } from 'lucide-react';

const FEATURES = [
  {
    icon: Droplets,
    title: 'Track daily wellness',
    copy: 'Log water, sleep, mood, and medication in seconds — or sync a wearable.',
  },
  {
    icon: Sparkles,
    title: 'Evolve Astra',
    copy: 'Your companion grows with consistent check-ins so staying on track feels like play.',
  },
  {
    icon: Gift,
    title: 'Earn real rewards',
    copy: 'Unlock clinic vouchers and gym passes. Cowries and the Loot Wheel live in Rewards after you sign in.',
  },
  {
    icon: Building2,
    title: 'Corporate wellness',
    copy: 'Bulk signups for teams — culturally relevant sessions and shared impact reports.',
  },
];

export const Features: React.FC = () => (
  <section className="max-w-5xl mx-auto w-full mb-16">
    <h2 className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-6">Features</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {FEATURES.map((item) => (
        <div key={item.title} className="aura-card p-5 rounded-2xl border border-[#242E42] flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FFB800] shrink-0">
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
            <p className="text-sm text-slate-400 leading-[1.6]">{item.copy}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);
