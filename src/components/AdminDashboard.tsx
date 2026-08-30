import React, { useState } from 'react';
import { CommunitySponsorPools } from './CommunitySponsorPools';
import { FeedbackDashboard } from './FeedbackDashboard';
import { SmartContractsViewer } from './SmartContractsViewer';
import {
  HealthCompanion,
  SponsorPool,
  SoulboundBadge,
  HealthCheckIn,
  EconomyStats,
  TxRecord,
} from '../types';
import {
  ShieldCheck,
  Coins,
  BarChart3,
  Cpu,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

type AdminTab = 'sponsors' | 'analytics' | 'contracts';

interface AdminDashboardProps {
  pools: SponsorPool[];
  onClaimReward: (poolId: string) => void;
  onAddSponsorPool: (newPool: SponsorPool) => void;
  companion: HealthCompanion;
  stats: EconomyStats;
  badges: SoulboundBadge[];
  checkIns: HealthCheckIn[];
  txLogs: TxRecord[];
  userStreak: number;
  userName: string;
  userCowries: number;
  onOpenCheckin: () => void;
  onShowToast: (msg: string) => void;
  onBackToLanding: () => void;
  onSignOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  pools,
  onClaimReward,
  onAddSponsorPool,
  companion,
  stats,
  badges,
  checkIns,
  txLogs,
  userStreak,
  userName,
  userCowries,
  onOpenCheckin,
  onShowToast,
  onBackToLanding,
  onSignOut,
}) => {
  const [adminTab, setAdminTab] = useState<AdminTab>('sponsors');

  const adminNavItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'sponsors', label: 'Sponsors', icon: Coins },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'contracts', label: 'Contracts', icon: Cpu },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-rose-500/40 bg-canvas text-white admin-shell">
      {/* Admin Header */}
      <header className="border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-white leading-tight">AuraHealth Admin</h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">Sponsors • Analytics • Contracts Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToLanding}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Landing</span>
            </button>

            <button
              onClick={onSignOut}
              className="bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Admin Sub-Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-3">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                      : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Admin Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {adminTab === 'sponsors' && (
          <CommunitySponsorPools
            pools={pools}
            onClaimReward={onClaimReward}
            onAddSponsorPool={onAddSponsorPool}
            userStreak={userStreak}
            userName={userName}
            userCowries={userCowries}
            onOpenCheckin={onOpenCheckin}
            onShowToast={onShowToast}
          />
        )}

        {adminTab === 'analytics' && (
          <FeedbackDashboard
            companion={companion}
            stats={stats}
            badges={badges}
            checkIns={checkIns}
            onOpenCheckin={onOpenCheckin}
            onOpenSponsors={() => setAdminTab('sponsors')}
            userName={userName}
            onShowToast={onShowToast}
          />
        )}

        {adminTab === 'contracts' && <SmartContractsViewer txLogs={txLogs} />}
      </main>
    </div>
  );
};
