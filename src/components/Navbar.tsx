import React from 'react';
import { WalletState } from '../services/avalanche';
import { EconomyStats } from '../types';
import { Sparkles, Wallet, Flame, Trophy, Coins, Award, Cpu, MessageSquare, Home, UserCheck, Play } from 'lucide-react';
import { AuraLogo } from './AuraLogo';

interface NavbarProps {
  wallet: WalletState;
  stats: EconomyStats;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onConnectWallet: () => void;
  onOpenCheckin: () => void;
  userAccount?: { name: string; email: string; isGoogle: boolean } | null;
  isDemoMode?: boolean;
  onBackToLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  stats,
  activeTab,
  setActiveTab,
  onConnectWallet,
  onOpenCheckin,
  userAccount,
  isDemoMode,
  onBackToLanding,
}) => {
  const navItems = [
    { id: 'companion', label: 'Companion & Log', icon: Sparkles },
    { id: 'feedback', label: 'Feedback Surface', icon: Trophy },
    { id: 'sponsors', label: 'Sponsor Pools', icon: Coins },
    { id: 'wheel', label: 'Loot Wheel', icon: Award },
    { id: 'contracts', label: 'Security & Verification', icon: Cpu },
    { id: 'coach', label: 'AI Health Coach', icon: MessageSquare },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & Back to Landing */}
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                title="Back to Landing Page"
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl transition-colors border border-slate-700/60"
              >
                <Home className="w-4 h-4 text-slate-200" />
              </button>
            )}

            <div className="flex items-center gap-2">
              <AuraLogo onClick={onBackToLanding} size="md" />
              {isDemoMode ? (
                <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Play className="w-3 h-3 fill-amber-300" /> Guided Demo Mode
                </span>
              ) : userAccount ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-300" /> Google Verified
                </span>
              ) : (
                <span className="bg-rose-500/20 text-rose-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-rose-500/30">
                  MVP Release
                </span>
              )}
            </div>
          </div>

          {/* Economy Counters & Wallet / User Profile */}
          <div className="flex items-center gap-3">
            {/* User Profile Badge if Google Authenticated */}
            {userAccount && (
              <div className="hidden lg:flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-base">👤</span>
                <div>
                  <div className="font-bold text-emerald-200 leading-none">{userAccount.name}</div>
                  <div className="text-[10px] text-emerald-400/80 leading-tight">{userAccount.email}</div>
                </div>
              </div>
            )}

            {/* Cowries */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors">
              <span className="text-lg">🐚</span>
              <div>
                <div className="text-xs text-slate-400 leading-none">Cowries</div>
                <div className="text-sm font-bold text-amber-300">{stats.cowriesBalance}</div>
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <div>
                <div className="text-xs text-slate-400 leading-none">Streak</div>
                <div className="text-sm font-bold text-orange-400">{stats.currentStreak} Days</div>
              </div>
            </div>

            {/* Quick Check-in CTA Button */}
            <button
              onClick={onOpenCheckin}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-md shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              + Daily Check-In
            </button>

            {/* Account / Verification ID Button */}
            <button
              onClick={onConnectWallet}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                wallet.isConnected
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 hover:bg-rose-900/40'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-rose-400" />
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-white leading-tight">{wallet.shortAddress}</div>
                <div className="text-[10px] text-rose-300">{wallet.avaxBalance}</div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping sm:hidden" />
            </button>
          </div>
        </div>

        {/* Network & Verification Indicator Banner */}
        <div className="bg-slate-950/60 py-1 px-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Ledger: <strong className="text-slate-200">AuraHealth Verification Engine</strong></span>
            <span className="text-slate-600">|</span>
            <span>Proof Protocol: <strong className="text-slate-200">ProofOfAdherence</strong></span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-slate-400">
            <span>Transaction Fee: <strong className="text-emerald-400">Zero-Friction</strong></span>
            <span>Sponsor Pool: <strong className="text-amber-300">$80,000 Care Funded</strong></span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

