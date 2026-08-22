import React from 'react';
import { Sparkles } from 'lucide-react';
import { AuraLogo } from './AuraLogo';

interface NavbarProps {
  onOpenCheckin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCheckin,
}) => {
  return (
    <header className="navbar-gradient text-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & Name */}
          <div className="flex items-center">
            <AuraLogo showSubtitle={false} size="md" />
          </div>

          {/* Check-In Button */}
          <button
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
