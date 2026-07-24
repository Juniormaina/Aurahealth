import React, { useState } from 'react';
import {
  Coins,
  Sparkles,
  Trophy,
  Gift,
  Award,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  HeartPulse,
  Smartphone,
  Droplets,
  HelpCircle,
  TrendingUp,
  Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RewardsHubProps {
  cowriesBalance: number;
  totalXp: number;
  currentStreak: number;
  onShowToast?: (msg: string) => void;
  onClaimBenefit?: (cowriesCost: number, benefitTitle: string) => void;
}

export interface BenefitItem {
  id: string;
  title: string;
  category: 'voucher' | 'airtime' | 'care' | 'perk';
  description: string;
  cowriesCost: number;
  realValue: string;
  icon: any;
  accentColor: string;
  claimed?: boolean;
}

export interface MilestoneLevel {
  level: number;
  title: string;
  xpRequired: number;
  perks: string[];
  unlocked: boolean;
  icon: string;
}

export const RewardsHub: React.FC<RewardsHubProps> = ({
  cowriesBalance,
  totalXp,
  currentStreak,
  onShowToast,
  onClaimBenefit,
}) => {
  const [activeTab, setActiveTab] = useState<'conversion' | 'milestones' | 'redeem'>('conversion');
  const [calculatorCowries, setCalculatorCowries] = useState<number>(cowriesBalance || 250);
  const [claimedBenefits, setClaimedBenefits] = useState<string[]>([]);

  // Conversion rates calculations
  const usdValue = (calculatorCowries * 0.01).toFixed(2);
  const clinicVoucherUsd = (calculatorCowries * 0.01).toFixed(2);
  const mobileDataMb = calculatorCowries * 5; // 100 cowries = 500MB

  const milestones: MilestoneLevel[] = [
    {
      level: 1,
      title: 'Cosmic Egg (Baseline)',
      xpRequired: 0,
      perks: ['Basic Hydration & Vitals Logging', '1x Cowrie Earning Speed'],
      unlocked: totalXp >= 0,
      icon: '🥚',
    },
    {
      level: 2,
      title: 'Hatchling Luminary',
      xpRequired: 100,
      perks: ['Unlocks Daily Wheel Lootbox Spins', 'Unlocks Regional Health Squads', 'Free +50 🐚 Welcome Bonus'],
      unlocked: totalXp >= 100,
      icon: '🐣',
    },
    {
      level: 3,
      title: 'Guardian Astra',
      xpRequired: 300,
      perks: ['1.2x Cowries Multiplier on Vitals Check-in', 'Sponsor Grant Voting Rights', '$5 Clinic Voucher Eligibility'],
      unlocked: totalXp >= 300,
      icon: '🛡️',
    },
    {
      level: 4,
      title: 'Celestial Sentinel',
      xpRequired: 600,
      perks: ['1.5x Cowries Streak Shield', 'Soulbound Badge Minting', 'Priority Sponsor Care Grant Pool Allocation'],
      unlocked: totalXp >= 600,
      icon: '✨',
    },
  ];

  const benefitsList: BenefitItem[] = [
    {
      id: 'b-1',
      title: '$2.50 Clinic Medication Voucher',
      category: 'voucher',
      description: 'Redeemable at participating partner health clinics & pharmacies for essential prescriptions.',
      cowriesCost: 250,
      realValue: '$2.50 USD Prescription Subsidy',
      icon: HeartPulse,
      accentColor: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'b-2',
      title: '1.25 GB Mobile Health Data Top-Up',
      category: 'airtime',
      description: 'Receive instant mobile airtime & data bundle to maintain continuous health logs without data barriers.',
      cowriesCost: 250,
      realValue: '1.25 GB Data / $2.00 Airtime',
      icon: Smartphone,
      accentColor: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'b-3',
      title: 'Clean Water Care Grant Token',
      category: 'care',
      description: 'Directly fund 10 gallons of purified water for sub-Saharan community water distribution points.',
      cowriesCost: 200,
      realValue: '10 Gallons Clean Water Grant',
      icon: Droplets,
      accentColor: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'b-4',
      title: '7-Day Streak Insurance Shield',
      category: 'perk',
      description: 'Protects your streak counter for 1 missed log day so your multiplier stays active.',
      cowriesCost: 150,
      realValue: 'Streak Protection Item',
      icon: ShieldCheck,
      accentColor: 'from-amber-500 to-rose-500',
    },
  ];

  const handleRedeemBenefit = (item: BenefitItem) => {
    if (claimedBenefits.includes(item.id)) return;

    if (cowriesBalance < item.cowriesCost) {
      if (onShowToast) onShowToast(`Insufficient Cowries! You need ${item.cowriesCost} 🐚 (Current: ${cowriesBalance} 🐚).`);
      return;
    }

    setClaimedBenefits((prev) => [...prev, item.id]);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#38bdf8', '#fbbf24'],
    });

    if (onClaimBenefit) {
      onClaimBenefit(item.cowriesCost, item.title);
    } else if (onShowToast) {
      onShowToast(`Successfully redeemed "${item.title}"! Voucher code sent to your wallet.`);
    }
  };

  return (
    <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/20 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" /> Transparent Economy Guide
            </span>
            <span className="text-xs text-slate-400">Verifiable Health Value</span>
          </div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <span>AuraHealth Rewards Hub</span>
            <span className="text-2xl">🐚</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Understand how daily health logs generate <strong>Cowries 🐚 & XP</strong>, convert them into real-world clinic vouchers and mobile data, and unlock higher tier multipliers!
          </p>
        </div>

        {/* User Balance Bar */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-4 shrink-0">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Your Balance</div>
            <div className="text-base font-black text-amber-300 font-mono flex items-center gap-1">
              <span>{cowriesBalance} 🐚</span>
              <span className="text-xs text-slate-400 font-normal">(${(cowriesBalance * 0.01).toFixed(2)})</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Total XP</div>
            <div className="text-base font-black text-cyan-400 font-mono">
              {totalXp} XP
            </div>
          </div>
        </div>
      </div>

      {/* Mode Sub-Tabs */}
      <div className="flex items-center justify-start gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('conversion')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'conversion'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Cowries Conversion Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'milestones'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>XP & Level Milestones</span>
        </button>

        <button
          onClick={() => setActiveTab('redeem')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'redeem'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Redeem Real Benefits</span>
        </button>
      </div>

      {/* Tab 1: Cowries Conversion Calculator */}
      {activeTab === 'conversion' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interactive Calculator Slider Card */}
            <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-5 space-y-4">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span>Interactive Benefit Calculator</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h4>
              <p className="text-xs text-slate-400">
                Adjust the Cowries amount below to see exact real-world equivalence:
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">Amount: {calculatorCowries} Cowries 🐚</span>
                  <span className="text-amber-300 font-mono">${usdValue} USD Est.</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={2000}
                  step={50}
                  value={calculatorCowries}
                  onChange={(e) => setCalculatorCowries(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>50 🐚</span>
                  <span>500 🐚</span>
                  <span>1,000 🐚</span>
                  <span>2,000 🐚</span>
                </div>
              </div>

              {/* Equivalence breakdown */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-900">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400">Clinic Prescription Subsidy</div>
                  <div className="text-base font-black text-emerald-400">${clinicVoucherUsd}</div>
                  <div className="text-[10px] text-slate-500">Partner Health Network</div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400">Mobile Data Allowance</div>
                  <div className="text-base font-black text-cyan-400">{mobileDataMb} MB</div>
                  <div className="text-[10px] text-slate-500">Instant Airtime Transfer</div>
                </div>
              </div>
            </div>

            {/* How Cowries are Earned Rules */}
            <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-5 space-y-3">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span>How to Earn Daily Cowries</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </h4>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 font-bold">1</span>
                  <div>
                    <span className="font-bold text-white">Daily Vitals & Hydration Check-In</span>
                    <p className="text-[11px] text-slate-400">+80 to +120 Cowries 🐚 per verified log.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="p-1 rounded bg-amber-500/10 text-amber-400 font-bold">2</span>
                  <div>
                    <span className="font-bold text-white">Adherence Wheel of Health</span>
                    <p className="text-[11px] text-slate-400">Free daily spin wins up to +300 Cowries or rare items.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 font-bold">3</span>
                  <div>
                    <span className="font-bold text-white">Streak Multipliers (7+ Days)</span>
                    <p className="text-[11px] text-slate-400">Maintained streaks boost all habit earnings by up to +50%.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: XP & Level Milestones */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((m) => (
              <div
                key={m.level}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                  m.unlocked
                    ? 'bg-slate-950/80 border-emerald-500/40 shadow-md'
                    : 'bg-slate-950/40 border-slate-800 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{m.icon}</span>
                    {m.unlocked ? (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Unlocked
                      </span>
                    ) : (
                      <span className="bg-slate-900 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Lock ({m.xpRequired} XP)
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-white mb-1">
                    Level {m.level}: {m.title}
                  </h4>
                  <div className="text-[11px] text-cyan-400 font-mono font-bold mb-3">
                    {m.xpRequired} XP Requirement
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Perks Unlocked:</span>
                    {m.perks.map((perk, i) => (
                      <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-[10px] text-slate-500 italic">
                  {m.unlocked ? 'Active on your account' : `Reach ${m.xpRequired} XP to activate`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Redeem Real Benefits */}
      {activeTab === 'redeem' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefitsList.map((item) => {
              const IconComp = item.icon;
              const isClaimed = claimedBenefits.includes(item.id);
              const canAfford = cowriesBalance >= item.cowriesCost;

              return (
                <div
                  key={item.id}
                  className="bg-slate-950/80 rounded-xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${item.accentColor} text-white shadow-md`}>
                        <IconComp className="w-5 h-5" />
                      </div>

                      <span className="bg-amber-500/10 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-500/20 font-mono">
                        {item.cowriesCost} 🐚
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">{item.description}</p>

                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs font-bold text-emerald-400 flex items-center justify-between mb-4">
                      <span>Value:</span>
                      <span>{item.realValue}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeemBenefit(item)}
                    disabled={isClaimed || !canAfford}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 ${
                      isClaimed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : !canAfford
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : `bg-gradient-to-r ${item.accentColor} text-white hover:scale-[1.02] active:scale-[0.98]`
                    }`}
                  >
                    {isClaimed ? (
                      <span>Redeemed & Code Issued ✓</span>
                    ) : !canAfford ? (
                      <span>Need {item.cowriesCost - cowriesBalance} More Cowries</span>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        <span>Redeem Benefit ({item.cowriesCost} 🐚)</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
