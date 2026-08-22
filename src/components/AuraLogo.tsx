import React from 'react';
import { Activity, Sparkles, Heart } from 'lucide-react';

interface AuraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
  onClick?: () => void;
  className?: string;
}

export const AuraLogo: React.FC<AuraLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText = 'Daily Wellness & Community Adherence',
  onClick,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Modern Gradient Aura Icon Container */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-400 p-0.5 shadow-lg shadow-rose-500/25 group-hover:shadow-rose-500/40 transition-all duration-300 group-hover:scale-105 ${
          size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
        }`}
      >
        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle glowing halo inside */}
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 via-amber-500/10 to-emerald-400/20 blur-sm" />
          
          {/* Central Logo Symbol */}
          <div className="relative flex items-center justify-center text-white">
            <Activity className={`text-rose-400 stroke-[2.5] ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
            <Sparkles className={`absolute -top-1 -right-1 text-amber-300 fill-amber-300 ${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
          </div>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-current group-hover:text-rose-500 transition-colors ${titleSizes[size]}`}>
            Aura<span className="bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">Health</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        {showSubtitle && (
          <p className="text-[11px] text-slate-400 font-medium tracking-normal mt-0.5 leading-none hidden sm:block">
            {subtitleText}
          </p>
        )}
      </div>
    </div>
  );
};
