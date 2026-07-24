import React from 'react';
import { WalletState } from '../services/avalanche';
import { EconomyStats } from '../types';
import { Sparkles, Shield, Wallet, Flame, RefreshCw, Trophy, Coins, Award, Cpu, MessageSquare } from 'lucide-react';

interface NavbarProps {
  wallet: WalletState;
  stats: EconomyStats;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onConnectWallet: () => void;
  onOpenCheckin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  stats,
  activeTab,
  setActiveTab,
  onConnectWallet,
  onOpenCheckin,
}) => {
  const navItems = [
    { id: 'companion', label: 'Companion & Log', icon: Sparkles },
    { id: 'feedback', label: 'Feedback Surface', icon: Trophy },
    { id: 'sponsors', label: 'Sponsor Pools', icon: Coins },
    { id: 'wheel', label: 'Loot Wheel', icon: Award },
    { id: 'contracts', label: 'Avalanche Verification', icon: Cpu },
    { id: 'coach', label: 'AI Health Coach', icon: MessageSquare },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & Quest Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-rose-500 to-red-600 p-2 rounded-xl text-white shadow-lg shadow-rose-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-300 bg-clip-text text-transparent">
                  AvaHealth
                </span>
                <span className="bg-rose-500/20 text-rose-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-rose-500/30">
                  Quest No. 05
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Health & Community Adherence on Avalanche</p>
            </div>
          </div>

          {/* Economy Counters & Wallet */}
          <div className="flex items-center gap-3">
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

            {/* Wallet Button */}
            <button
              onClick={onConnectWallet}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                wallet.isConnected
                  ? 'bg-red-950/40 border-red-500/40 text-red-200 hover:bg-red-900/40'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-red-400" />
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-white leading-tight">{wallet.shortAddress}</div>
                <div className="text-[10px] text-red-300">{wallet.avaxBalance}</div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping sm:hidden" />
            </button>
          </div>
        </div>

        {/* Network & Subnet Indicator Banner */}
        <div className="bg-slate-950/60 py-1 px-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>Network: <strong className="text-slate-200">{wallet.networkName}</strong></span>
            <span className="text-slate-600">|</span>
            <span>Proof Engine: <strong className="text-slate-200">ProofOfAdherence.sol</strong></span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-slate-400">
            <span>AVAX Gas: <strong className="text-emerald-400">0.00105 AVAX</strong></span>
            <span>Sponsor Yield: <strong className="text-amber-300">80.0 AVAX Funded</strong></span>
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
