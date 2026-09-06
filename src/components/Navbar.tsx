import React from 'react';
import { Sparkles, Menu, Search, LogOut } from 'lucide-react';
import { EconomyStats } from '../types';

interface NavbarProps {
  onOpenCheckin: () => void;
  onOpenSearch?: () => void;
  onToggleMobileMenu?: () => void;
  onSignOut?: () => void;
  userName?: string;
  stats?: EconomyStats;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCheckin,
  onOpenSearch,
  onToggleMobileMenu,
  onSignOut,
  userName,
}) => {
  return (
    <header className="navbar-gradient sticky top-0 z-30">
      <div className="layout-container">
        <div className="flex items-center justify-between min-h-16 h-16 gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden touch-target inline-flex items-center justify-center rounded-lg text-white hover:text-[var(--color-harmony)] -ml-1"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <span className="font-display text-sm sm:text-base font-semibold text-white/80 truncate lg:hidden">
              Aura Health
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 justify-end min-w-0">
            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                className="btn-ghost text-xs sm:text-sm px-2 sm:px-4"
                aria-label="Search (⌘K)"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden md:inline text-[10px] font-mono text-slate-500 border border-[#242E42] rounded px-1.5 py-0.5">
                  ⌘K
                </kbd>
              </button>
            )}
            {onSignOut && userName && (
              <button
                type="button"
                onClick={onSignOut}
                className="btn-ghost text-xs sm:text-sm px-2 sm:px-4"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            )}
            <button type="button" onClick={onOpenCheckin} className="flex items-center gap-2 btn-primary shrink-0 px-3 sm:px-5">
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
