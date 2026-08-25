import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { VALUE_PROPS } from '../content/valueProps';
import { fetchImpact } from '../services/commerce';

interface ImpactDashboardProps {
  userId: string;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({ userId }) => {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchImpact>> | null>(null);

  useEffect(() => {
    fetchImpact(userId).then(setData).catch(() => setData(null));
  }, [userId]);

  if (!data) {
    return (
      <section className="aura-module-card p-5">
        <p className="text-sm text-slate-400">Loading your 14-day anxiety trend…</p>
      </section>
    );
  }

  return (
    <section className="aura-module-card p-5 space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#00FFC2]">Proof of impact</div>
      <h3 className="text-lg font-bold text-white leading-snug">{data.headline}</h3>
      <p className="text-xs text-slate-400 leading-[1.6]">{VALUE_PROPS.realtimeMood}</p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white/5 rounded-xl p-3 border border-[#242E42]">
          <div className="text-[10px] text-slate-400 uppercase">Start</div>
          <div className="tabular-nums text-white font-bold">{data.anxietyStart}/10</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-[#242E42]">
          <div className="text-[10px] text-slate-400 uppercase">Now</div>
          <div className="tabular-nums text-[#00FFC2] font-bold">{data.anxietyNow}/10</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-[#242E42]">
          <div className="text-[10px] text-slate-400 uppercase">Change</div>
          <div className="tabular-nums text-[#FFB800] font-bold">-{data.dropPct}%</div>
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.series}>
            <defs>
              <linearGradient id="anxietyGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8C52FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8C52FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 10]} />
            <Tooltip contentStyle={{ background: '#0B192C', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff' }} />
            <Area type="monotone" dataKey="anxiety" stroke="#8C52FF" strokeWidth={2} fill="url(#anxietyGlow)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
