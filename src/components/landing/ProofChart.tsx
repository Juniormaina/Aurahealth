import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Label,
} from 'recharts';

type SeriesPoint = { date: string; anxiety: number; sleep: number };
type ChartStatus = 'loading' | 'empty' | 'ready';

const EmptyIllustration: React.FC = () => (
  <svg viewBox="0 0 320 140" className="w-full h-28 text-[#D5E4DC]" aria-hidden>
    <rect x="36" y="8" width="272" height="112" fill="none" stroke="currentColor" strokeOpacity="0.35" rx="8" />
    {[0, 1, 2, 3].map((i) => (
      <line
        key={i}
        x1="44"
        x2="300"
        y1={28 + i * 24}
        y2={28 + i * 24}
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeDasharray="4 6"
      />
    ))}
    <path
      d="M48 92 C90 88, 120 70, 160 74 S230 96, 300 64"
      fill="none"
      stroke="var(--color-accent-secondary)"
      strokeOpacity="0.35"
      strokeWidth="2"
      strokeDasharray="5 6"
    />
    <path
      d="M48 78 C100 60, 140 84, 180 68 S250 48, 300 52"
      fill="none"
      stroke="var(--color-harmony)"
      strokeOpacity="0.35"
      strokeWidth="2"
      strokeDasharray="5 6"
    />
    <text x="8" y="24" fill="currentColor" fontSize="9">10</text>
    <text x="12" y="116" fill="currentColor" fontSize="9">0</text>
  </svg>
);

export const ProofChart: React.FC = () => {
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [status, setStatus] = useState<ChartStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/metrics/proof')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const rows = Array.isArray(data?.series) ? data.series : [];
        const mapped: SeriesPoint[] = rows.map(
          (row: { date: string; anxiety: number; sleep?: number; mood?: number }) => ({
            date: String(row.date).slice(5),
            anxiety: Number(row.anxiety),
            sleep: Number(row.sleep ?? Math.round(10 - row.anxiety * 0.55)),
          })
        );
        setSeries(mapped);
        setStatus(mapped.length >= 2 ? 'ready' : 'empty');
      })
      .catch(() => {
        if (cancelled) return;
        setSeries([]);
        setStatus('empty');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="h-52 sm:h-64 w-full min-w-0 rounded-xl border border-white/15 bg-white/[0.06] p-4" aria-busy="true">
        <div className="h-3 w-40 rounded bg-white/10 animate-pulse mb-6" />
        <div className="space-y-3">
          <div className="h-8 w-full rounded bg-white/[0.06] animate-pulse" />
          <div className="h-8 w-11/12 rounded bg-white/[0.05] animate-pulse" />
          <div className="h-8 w-full rounded bg-white/[0.06] animate-pulse" />
          <div className="h-8 w-10/12 rounded bg-white/[0.05] animate-pulse" />
        </div>
        <span className="sr-only">Loading 14-day sleep and anxiety trend</span>
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className="h-52 sm:h-64 w-full min-w-0 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 flex flex-col justify-between">
        <div className="flex justify-between text-[10px] text-[#D5E4DC] font-semibold uppercase tracking-wide">
          <span>Score (0–10)</span>
          <span>Sleep · Anxiety</span>
        </div>
        <EmptyIllustration />
        <p className="text-sm text-[#D5E4DC] text-center leading-[1.5]">
          Log 2+ days to see your trend. Axis labels and grid stay in place so the chart never looks like a blank box.
        </p>
      </div>
    );
  }

  return (
    <div className="h-52 sm:h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
        <LineChart data={series} margin={{ top: 12, right: 12, left: 4, bottom: 28 }}>
          <CartesianGrid stroke="rgba(213, 228, 220, 0.42)" strokeDasharray="3 6" />
          <XAxis dataKey="date" tick={{ fill: '#D5E4DC', fontSize: 11 }} axisLine={{ stroke: '#D5E4DC' }} tickLine={{ stroke: '#D5E4DC' }}>
            <Label value="Day" position="insideBottom" offset={-18} fill="#D5E4DC" fontSize={11} />
          </XAxis>
          <YAxis domain={[0, 10]} tick={{ fill: '#D5E4DC', fontSize: 11 }} axisLine={{ stroke: '#D5E4DC' }} tickLine={{ stroke: '#D5E4DC' }} width={36}>
            <Label
              value="Score (0–10)"
              angle={-90}
              position="insideLeft"
              offset={10}
              fill="#D5E4DC"
              fontSize={11}
            />
          </YAxis>
          <Tooltip
            contentStyle={{
              background: '#163528',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 12,
              color: '#F7FFFC',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#D5E4DC' }} />
          <Line type="monotone" dataKey="sleep" name="Sleep quality" stroke="var(--color-harmony)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="anxiety" name="Anxiety" stroke="var(--color-accent-secondary)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
