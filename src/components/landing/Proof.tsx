import React from 'react';
import { VALUE_PROPS } from '../../content/valueProps';
import { ProofChart } from './ProofChart';

export const Proof: React.FC = () => (
  <section className="max-w-5xl mx-auto w-full mb-16 space-y-6">
    <h2 className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400">Proof</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <p className="aura-card p-5 rounded-2xl border border-[#242E42] text-sm text-slate-200 leading-[1.6]">
        {VALUE_PROPS.culturalRelevance}
      </p>
      <p className="aura-card p-5 rounded-2xl border border-[#242E42] text-sm text-slate-200 leading-[1.6]">
        {VALUE_PROPS.realtimeMood}
      </p>
    </div>
    <div className="aura-card p-5 rounded-2xl border border-[#242E42]">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#00FFC2] mb-3">
        Sleep quality vs anxiety · 14 days
      </div>
      <ProofChart />
    </div>
  </section>
);
