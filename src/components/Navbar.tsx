import React from 'react';
import { Sparkles, Menu } from 'lucide-react';
import { AuraLogo } from './AuraLogo';

interface NavbarProps {
  onOpenCheckin: () => void;
  onToggleMobileMenu?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  theme?: 'midnight' | 'morning';
  onToggleTheme?: () => void;
  [key: string]: unknown;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCheckin,
  onToggleMobileMenu,
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'companion', label: 'Habits' },
    { id: 'coach', label: 'Coach' },
    { id: 'wheel', label: 'Missions' },
  ];

  return (
    <header className="navbar-gradient sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 text-[#FFFAF4] hover:text-sunlight"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <AuraLogo showSubtitle={false} size="md" inverted />
          </div>

          {setActiveTab && (
            <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-sm font-semibold pb-1 transition-colors ${
                    activeTab === tab.id
                      ? 'text-sunlight border-b-2 border-sunlight'
                      : 'text-[#FFFAF4]/75 hover:text-[#FFFAF4] border-b-2 border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          )}

          <button
            type="button"
            onClick={onOpenCheckin}
            className="flex items-center gap-2 btn-primary"
          >
            <Sparkles className="w-4 h-4" />
            + Check-In
          </button>
        </div>
      </div>
    </header>
  );
};
