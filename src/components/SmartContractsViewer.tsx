import React, { useEffect, useState } from 'react';
import LoyaltyPointsSource from '../contracts/LoyaltyPoints.sol?raw';
import AchievementBadgesSource from '../contracts/AchievementBadges.sol?raw';
import StreakTrackerSource from '../contracts/StreakTracker.sol?raw';
import TierSystemSource from '../contracts/TierSystem.sol?raw';
import IncentiveTokenSource from '../contracts/IncentiveToken.sol?raw';
import { CONTRACT_ADDRESSES, AVALANCHE_FUJI_CONFIG, EXPLORER_BASE, getReadOnlyContracts } from '../services/avalanche';
import { TxRecord } from '../types';
import { Cpu, ExternalLink, Copy, Check, ShieldCheck, Layers, RefreshCw, Archive, ChevronDown, ChevronUp } from 'lucide-react';

interface SmartContractsViewerProps {
  txLogs: TxRecord[];
}

type ContractName = keyof typeof CONTRACT_ADDRESSES;

const CONTRACT_SOURCES: Record<ContractName, string> = {
  LoyaltyPoints: LoyaltyPointsSource,
  AchievementBadges: AchievementBadgesSource,
  StreakTracker: StreakTrackerSource,
  TierSystem: TierSystemSource,
  IncentiveToken: IncentiveTokenSource,
};

const CONTRACT_NAMES = Object.keys(CONTRACT_ADDRESSES) as ContractName[];

// Logs beyond this count (txLogs is newest-first) are tucked behind the
// "Show Archived" toggle so the table stays focused on recent activity.
const RECENT_LOG_COUNT = 8;

export const SmartContractsViewer: React.FC<SmartContractsViewerProps> = ({ txLogs }) => {
  const [selectedContract, setSelectedContract] = useState<ContractName>('LoyaltyPoints');
  const [copied, setCopied] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [liveStats, setLiveStats] = useState<{ label: string; value: string }[] | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const loadLiveStats = async () => {
    setIsLoadingStats(true);
    try {
      const { loyaltyPoints, achievementBadges, incentiveToken } = getReadOnlyContracts();
      const [outstanding, badgeCount, totalSupply, remainingBudget] = await Promise.all([
        loyaltyPoints.outstandingLiability(),
        achievementBadges.badgeCount(),
        incentiveToken.totalSupply(),
        incentiveToken.remainingBudget(),
      ]);
      setLiveStats([
        { label: 'LoyaltyPoints outstanding liability', value: outstanding.toString() },
        { label: 'AchievementBadges badge types defined', value: badgeCount.toString() },
        { label: 'IncentiveToken totalSupply (wei)', value: totalSupply.toString() },
        { label: 'IncentiveToken remaining budget (wei)', value: remainingBudget.toString() },
      ]);
    } catch (e) {
      console.warn('Live on-chain read failed:', e);
      setLiveStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadLiveStats();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CONTRACT_SOURCES[selectedContract]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recentLogs = txLogs.slice(0, RECENT_LOG_COUNT);
  const archivedLogs = txLogs.slice(RECENT_LOG_COUNT);

  const renderTxRow = (tx: TxRecord, idx: number) => (
    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
      <td className="p-3 font-bold text-cyan-300 truncate max-w-[140px]">{tx.hash}</td>
      <td className="p-3 text-slate-400">#{tx.blockNumber}</td>
      <td className="p-3">
        <span className="text-slate-200 font-bold">{tx.contractName}</span>
        <div className="text-[10px] text-slate-500">{tx.method}</div>
      </td>
      <td className="p-3 text-emerald-400">{tx.nAvaxFee}</td>
      <td className="p-3">
        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-500/30">
          {tx.status}
        </span>
      </td>
      <td className="p-3">
        <a
          href={tx.explorersUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-bold"
        >
          Explorer <ExternalLink className="w-3 h-3" />
        </a>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-cyan-500/20 text-cyan-300 p-2.5 rounded-xl border border-cyan-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">On-Chain Gamification Contracts</h2>
              <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Live on {AVALANCHE_FUJI_CONFIG.chainName}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Deployed and verified on Avalanche Fuji testnet (chain ID 43113). Source, address, and
              live state are all real — pulled straight from the chain, not simulated.
            </p>
          </div>
        </div>

        {/* Contract Address Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {CONTRACT_NAMES.map((name) => (
            <a
              key={name}
              href={`${EXPLORER_BASE}/address/${CONTRACT_ADDRESSES[name]}#code`}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs hover:border-cyan-500/50 transition-colors"
            >
              <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                {name}.sol <ExternalLink className="w-2.5 h-2.5" />
              </div>
              <div className="font-mono text-cyan-300 font-bold truncate mt-0.5">{CONTRACT_ADDRESSES[name]}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Code Viewer Section */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {CONTRACT_NAMES.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedContract(name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedContract === name
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {name}.sol
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
            <a
              href={`${EXPLORER_BASE}/address/${CONTRACT_ADDRESSES[selectedContract]}#code`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Verified Source
            </a>
          </div>
        </div>

        {/* Code Viewbox */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
          <pre>{CONTRACT_SOURCES[selectedContract]}</pre>
        </div>

        {/* Live On-Chain Reads */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 font-mono text-[11px] text-emerald-400 space-y-1">
          <div className="text-slate-500 font-bold mb-1 flex items-center justify-between gap-1.5">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Live On-Chain Reads (Fuji RPC)
            </span>
            <button
              onClick={loadLiveStats}
              disabled={isLoadingStats}
              className="text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingStats ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
          {liveStats ? (
            liveStats.map((s) => (
              <div key={s.label}>
                {s.label}: <span className="text-cyan-300">{s.value}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-500">{isLoadingStats ? 'Reading from chain…' : 'Unable to reach Fuji RPC.'}</div>
          )}
        </div>
      </div>

      {/* On-Chain Transaction Logs / Explorer Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> On-Chain Attestation & Transaction Log
          </h3>
          {archivedLogs.length > 0 && (
            <button
              onClick={() => setShowArchived((v) => !v)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 shrink-0"
            >
              <Archive className="w-3.5 h-3.5" />
              {showArchived ? 'Hide' : 'Show'} Archived ({archivedLogs.length})
              {showArchived ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Tx Hash</th>
                <th className="p-3">Block</th>
                <th className="p-3">Contract / Method</th>
                <th className="p-3">Gas Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3">Explorer Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {recentLogs.map((tx, idx) => renderTxRow(tx, idx))}
            </tbody>
          </table>
        </div>

        {showArchived && archivedLogs.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
              <Archive className="w-3 h-3" /> Archived — older than the {RECENT_LOG_COUNT} most recent entries
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-400">
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {archivedLogs.map((tx, idx) => renderTxRow(tx, idx))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
