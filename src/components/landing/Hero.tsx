import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { VALUE_PROPS } from '../../content/valueProps';

interface HeroProps {
  onStartTrial: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartTrial }) => {
  const [pop, setPop] = useState(false);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center max-w-6xl mx-auto mb-16">
      <div className="text-center lg:text-left space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display leading-tight">
          {VALUE_PROPS.microSessions}
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-[1.6]">{VALUE_PROPS.heroSubtext}</p>
        <div className="pt-2 flex justify-center lg:justify-start">
          <button type="button" onClick={onStartTrial} className="btn-primary text-sm px-6 py-3">
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="aura-card astra-hero p-5 rounded-2xl border border-[#242E42]">
        <button
          type="button"
          className="w-full flex items-center gap-4 text-left"
          aria-label="Astra companion"
          onClick={() => {
            setPop(true);
            window.setTimeout(() => setPop(false), 500);
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80"
            alt="Astra"
            className={`w-16 h-16 rounded-full object-cover border-2 border-[#8C52FF]/50 shadow-[0_0_24px_rgba(140,82,255,0.3)] ${pop ? 'scale-105' : ''} transition-transform`}
          />
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white font-display">Astra</h2>
            <p className="text-sm text-slate-400 truncate">Your companion · 5-minute sessions that match how you feel</p>
          </div>
        </button>
      </div>
    </section>
  );
};
