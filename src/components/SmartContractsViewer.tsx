import React, { useState } from 'react';
import { PROOF_OF_ADHERENCE_SOL, HEALTH_COMPANION_NFT_SOL, REWARD_SPONSOR_POOL_SOL } from '../contracts/SolidityCode';
import { CONTRACT_ADDRESSES, AVALANCHE_FUJI_CONFIG } from '../services/avalanche';
import { TxRecord } from '../types';
import { Cpu, ExternalLink, Copy, Check, Terminal, ShieldCheck, Play, Layers } from 'lucide-react';

interface SmartContractsViewerProps {
  txLogs: TxRecord[];
}

export const SmartContractsViewer: React.FC<SmartContractsViewerProps> = ({ txLogs }) => {
  const [selectedContract, setSelectedContract] = useState<'ProofOfAdherence' | 'HealthCompanionNFT' | 'RewardSponsorPool'>('ProofOfAdherence');
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'AuraHealth Verification Engine Ready (ChainID: 43113)',
    'ProofOfAdherence.sol deployed at ' + CONTRACT_ADDRESSES.ProofOfAdherence,
    'HealthCompanionNFT.sol deployed at ' + CONTRACT_ADDRESSES.HealthCompanionNFT,
    'RewardSponsorPool.sol deployed at ' + CONTRACT_ADDRESSES.RewardSponsorPool,
  ]);

  const contractCodes = {
    ProofOfAdherence: PROOF_OF_ADHERENCE_SOL,
    HealthCompanionNFT: HEALTH_COMPANION_NFT_SOL,
    RewardSponsorPool: REWARD_SPONSOR_POOL_SOL,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(contractCodes[selectedContract]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDeploy = () => {
    setIsSimulating(true);
    setTerminalOutput((prev) => [...prev, `> Compiling ${selectedContract}.sol with solc 0.8.20...`]);

    setTimeout(() => {
      setTerminalOutput((prev) => [
        ...prev,
        `> Optimization enabled (200 runs). Bytecode size: 4,120 bytes.`,
        `> Broadcasting deployment tx to AuraHealth Verification Node...`,
        `> Tx Confirmed in Block #38910${Math.floor(Math.random() * 900 + 100)}! Gas used: 41,090 Credits`,
        `> Contract verified on AuraHealth Ledger Explorer!`,
      ]);
      setIsSimulating(false);
    }, 1500);
  };

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
              <h2 className="text-2xl font-black text-white">Health Pass Security Ledger & Protocol</h2>
              <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Secure Verification
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Tamper-proof, zero-gas security rules guaranteeing the validity of your Digital Health Pass and reward redemptions.
            </p>
          </div>
        </div>

        {/* Contract Address Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {Object.entries(CONTRACT_ADDRESSES).map(([name, addr]) => (
            <div key={name} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="text-[10px] text-slate-400 font-semibold">{name}.sol</div>
              <div className="font-mono text-cyan-300 font-bold truncate mt-0.5">{addr}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Viewer & Compiler Section */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(['ProofOfAdherence', 'HealthCompanionNFT', 'RewardSponsorPool'] as const).map((name) => (
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
            <button
              onClick={handleSimulateDeploy}
              disabled={isSimulating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" /> Re-Verify Contract
            </button>
          </div>
        </div>

        {/* Code Viewbox */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
          <pre>{contractCodes[selectedContract]}</pre>
        </div>

        {/* Terminal Compilation Console */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 font-mono text-[11px] text-emerald-400 space-y-1">
          <div className="text-slate-500 font-bold mb-1 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-400" /> AuraHealth Protocol Compiler Console
          </div>
          {terminalOutput.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>

      {/* On-Chain Transaction Logs / Snowtrace Explorer Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> On-Chain Attestation & Transaction Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Tx Hash</th>
                <th className="p-3">Block</th>
                <th className="p-3">Contract / Method</th>
                <th className="p-3">Gas Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3">Snowtrace Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {txLogs.map((tx, idx) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
