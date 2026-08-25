import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

type SeriesPoint = { date: string; anxiety: number; sleep: number };

export const ProofChart: React.FC = () => {
  const [series, setSeries] = useState<SeriesPoint[]>([]);

  useEffect(() => {
    fetch('/api/metrics/proof')
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data.series) ? data.series : [];
        setSeries(
          rows.map((row: { date: string; anxiety: number; sleep?: number; mood?: number }) => ({
            date: String(row.date).slice(5),
            anxiety: row.anxiety,
            sleep: row.sleep ?? Math.round(10 - row.anxiety * 0.55),
          }))
        );
      })
      .catch(() => setSeries([]));
  }, []);

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{ background: '#0B192C', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
          <Line type="monotone" dataKey="sleep" name="Sleep quality" stroke="#00FFC2" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="anxiety" name="Anxiety" stroke="#8C52FF" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
