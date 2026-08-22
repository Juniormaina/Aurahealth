import React, { useId } from 'react';

interface AuraMarkProps {
  className?: string;
  title?: string;
}

/** Standalone circular mark — scalable as app icon or wordmark glyph. */
export const AuraMark: React.FC<AuraMarkProps> = ({ className = '', title }) => {
  const rawId = useId().replace(/:/g, '');
  const ring = `${rawId}-ring`;
  const aura = `${rawId}-aura`;
  const glow = `${rawId}-glow`;
  const beatGlow = `${rawId}-beat`;
  const core = `${rawId}-core`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={`aura-logo-mark overflow-visible ${className}`}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={ring} x1="8%" y1="0%" x2="92%" y2="100%">
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="38%" stopColor="#3B82F6" />
          <stop offset="72%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <radialGradient id={aura} cx="50%" cy="50%" r="50%">
          <stop offset="42%" stopColor="#60A5FA" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#A78BFA" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={core} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0B1224" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#07101F" stopOpacity="1" />
        </radialGradient>
        <filter id={glow} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={beatGlow} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="32" cy="32" r="30" fill={`url(#${aura})`} className="aura-logo-halo" />
      <circle cx="32" cy="32" r="21.5" fill={`url(#${core})`} />

      <g filter={`url(#${glow})`}>
        <circle
          cx="32"
          cy="32"
          r="22"
          fill="none"
          stroke={`url(#${ring})`}
          strokeWidth="3.25"
          strokeLinecap="round"
        />
        <circle
          cx="32"
          cy="32"
          r="22"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.35"
          strokeWidth="3.25"
          strokeDasharray="18 52"
          strokeLinecap="round"
          className="aura-logo-shimmer"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 32 32"
            to="360 32 32"
            dur="7s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      <path
        d="M12.5 32 H21.2 L23.4 32 L25.1 26.2 L27.4 36.8 L30.2 32 H32.2 L34.4 14.8 L37.2 49.2 L40.1 32 H41.8 L43.4 28.6 L45.2 32 H51.5"
        fill="none"
        stroke="#FF2D55"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
        filter={`url(#${beatGlow})`}
        className="aura-logo-beat-glow"
      />
      <path
        d="M12.5 32 H21.2 L23.4 32 L25.1 26.2 L27.4 36.8 L30.2 32 H32.2 L34.4 14.8 L37.2 49.2 L40.1 32 H41.8 L43.4 28.6 L45.2 32 H51.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.05"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="aura-logo-beat"
      />
      <circle cx="34.4" cy="14.8" r="1.35" fill="#FFFFFF" className="aura-logo-peak" />
    </svg>
  );
};

interface AuraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
  onClick?: () => void;
  className?: string;
  inverted?: boolean;
  markOnly?: boolean;
}

export const AuraLogo: React.FC<AuraLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText = 'Daily Wellness & Community Adherence',
  onClick,
  className = '',
  inverted = false,
  markOnly = false,
}) => {
  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const markSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';

  const mark = <AuraMark className={`${markSize} shrink-0`} title={markOnly ? 'Aura Health' : undefined} />;

  if (markOnly) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        {mark}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {mark}

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-bold tracking-tight ${titleSizes[size]} ${
              inverted ? 'text-[#FFFAF4]' : 'text-navy'
            }`}
          >
            Aura<span className={inverted ? 'text-sunlight' : 'text-gold'}>Health</span>
          </span>
        </div>
        {showSubtitle && (
          <p
            className={`text-[11px] font-medium tracking-normal mt-0.5 leading-[1.6] hidden sm:block ${
              inverted ? 'text-[#FFFAF4]/70' : 'text-muted'
            }`}
          >
            {subtitleText}
          </p>
        )}
      </div>
    </div>
  );
};
