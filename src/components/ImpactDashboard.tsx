import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { VALUE_PROPS } from '../content/valueProps';
import { fetchImpact } from '../services/commerce';

interface ImpactDashboardProps {
  userId: string;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({ userId }) => {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchImpact>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchImpact()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <section className="aura-module-card p-5" aria-busy="true">
        <div className="h-3 w-36 rounded bg-white/10 animate-pulse mb-4" />
        <div className="h-32 rounded-xl bg-white/[0.05] animate-pulse" />
        <span className="sr-only">Loading your 14-day trend</span>
      </section>
    );
  }

  const series = data?.series || [];
  if (!data || series.length < 2) {
    return (
      <section className="aura-module-card p-5 space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-harmony)]">Your trend</div>
        <p className="text-sm text-slate-300 leading-[1.6]">Log 2+ days to see your trend.</p>
        <p className="text-xs text-slate-500">Grid and labels appear once Astra has enough check-ins to plot.</p>
      </section>
    );
  }

  return (
    <section className="aura-module-card p-5 space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-harmony)]">Proof of impact</div>
      <h3 className="text-lg font-bold text-white leading-snug">{data.headline}</h3>
      <p className="text-xs text-slate-400 leading-[1.6]">{VALUE_PROPS.realtimeMood}</p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white/5 rounded-xl p-3 border border-[#242E42]">
          <div className="text-[10px] text-slate-400 uppercase">Start</div>
          <div className="tabular-nums text-white font-bold">{data.anxietyStart}/10</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-[#242E42]">
          <div className="text-[10px] text-slate-400 uppercase">Now</div>
          <div className="tabular-nums text-[var(--color-harmony)] font-bold">{data.anxietyNow}/10</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-[#242E42]">
          <div className="text-[10px] text-slate-400 uppercase">Change</div>
          <div className="tabular-nums text-[var(--color-accent-secondary)] font-bold">-{data.dropPct}%</div>
        </div>
      </div>
      <div className="h-40 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="anxietyGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent-secondary)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-accent-secondary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 6" />
            <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} domain={[0, 10]} width={28} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#141A26', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff' }} />
            <Area type="monotone" dataKey="anxiety" stroke="var(--color-accent-secondary)" strokeWidth={2} fill="url(#anxietyGlow)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
