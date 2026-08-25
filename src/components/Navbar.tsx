import React from 'react';
import { Sparkles, Menu, Coins, Search } from 'lucide-react';
import { EconomyStats } from '../types';

interface NavbarProps {
  onOpenCheckin: () => void;
  onOpenSearch?: () => void;
  onToggleMobileMenu?: () => void;
  stats?: EconomyStats;
  [key: string]: unknown;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCheckin,
  onOpenSearch,
  onToggleMobileMenu,
  stats,
}) => {
  const cowries = stats?.cowriesBalance ?? 0;

  return (
    <header className="navbar-gradient sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 text-white hover:text-[#00FFC2]"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <span className="font-display text-sm sm:text-base font-semibold text-white/80 truncate lg:hidden">
              Aura Health
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0 flex-wrap justify-end">
            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                className="btn-ghost text-xs sm:text-sm"
                aria-label="Search (⌘K)"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden md:inline text-[10px] font-mono text-slate-500 border border-[#242E42] rounded px-1.5 py-0.5">
                  ⌘K
                </kbd>
              </button>
            )}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141A26] border border-[#242E42] text-[#FFB800] text-xs sm:text-sm font-bold font-display tabular-nums"
              title="Cowrie wallet"
            >
              <Coins className="w-4 h-4" />
              <span>{cowries.toLocaleString()}</span>
              <span className="hidden sm:inline text-slate-400 font-semibold">Cowries</span>
            </div>
            <button type="button" onClick={onOpenCheckin} className="flex items-center gap-2 btn-primary shrink-0">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">+ Check-In</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
