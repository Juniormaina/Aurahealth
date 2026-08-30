import React from 'react';
import { Sparkles, Menu, Search } from 'lucide-react';
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
}) => {
  return (
    <header className="navbar-gradient sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 text-white hover:text-[var(--color-harmony)]"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <span className="font-display text-sm sm:text-base font-semibold text-white/80 truncate lg:hidden">
              Aura Health
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-end">
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
