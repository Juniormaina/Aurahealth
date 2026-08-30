import React from 'react';
import { Layers, Coins, ShieldCheck, Trophy, ExternalLink, Sparkles } from 'lucide-react';

export const JiweEconomyDiagram: React.FC = () => {
  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm min-w-0">
      <div className="flex items-start sm:items-center gap-3 mb-6 min-w-0">
        <div className="bg-amber-500/20 text-amber-300 p-2.5 rounded-xl border border-amber-500/30 shrink-0">
          <Layers className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">5-Layer Sustainable Circular Health Economy</h2>
          <p className="text-xs text-slate-400">
            Sustainable ecosystem preventing hyperinflation through sponsor sinks & health utility
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Formula Banner */}
        <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 text-xs text-slate-300 italic">
          <strong className="text-rose-400 not-italic font-bold">One-Sentence Economy Formula:</strong> "Users perform verified daily health check-ins because they receive XP and Health Cowries, which evolve their digital companion and unlock sponsor-backed reward pools funded by health grants."
        </div>

        {/* 5 Layer Cards Stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {[
            {
              layer: 'Layer 1: Progression',
              type: 'App Core',
              desc: 'XP, Streak Levels, Health Logs, Daily Check-in records & Habit tracking',
              bg: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300',
              icon: '📈',
            },
            {
              layer: 'Layer 2: Utility Currency',
              type: 'Health Rewards',
              desc: 'Health Cowries 🐚 earned via verified logs, spent on boosts & treats',
              bg: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
              icon: '🐚',
            },
            {
              layer: 'Layer 3: External Funding',
              type: 'Sponsor Grants',
              desc: 'Clinics, NGOs & Grants fund care pools and clinic vouchers',
              bg: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
              icon: '🏦',
            },
            {
              layer: 'Layer 4: Digital Assets',
              type: 'Verifiable Proof',
              desc: 'Dynamic Digital Companion Avatars & Verified Health Milestone Badges',
              bg: 'border-purple-500/30 bg-purple-950/20 text-purple-300',
              icon: '💎',
            },
            {
              layer: 'Layer 5: Claimable Value',
              type: 'Care Rewards',
              desc: 'Clinic care vouchers, health kits, or claimable wellness grants',
              bg: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
              icon: '✨',
            },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between ${item.bg}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60">
                    {item.type}
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-xs mb-1">{item.layer}</h4>
                <p className="text-[11px] text-slate-300 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
