import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Egg,
  Droplets,
  HeartPulse,
  Award,
  ArrowRight,
  HelpCircle,
  Zap,
  Gift,
  ShieldCheck,
  ChevronRight,
  Compass,
  Star,
  Info,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VALUE_PROPS } from '../content/valueProps';

export interface OnboardingMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  cowriesReward: number;
  completed: boolean;
  actionText: string;
  actionType: 'awaken' | 'hydrate' | 'checkin' | 'explore_grants';
  icon: any;
  accentColor: string;
}

interface OnboardingTutorialProps {
  userName: string;
  onOpenCheckin: () => void;
  onNavigateTab: (tab: string) => void;
  onMissionCompleted: (xp: number, cowries: number, missionId: string) => void;
  streakDays: number;
  autoOpenGuide?: boolean;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  userName,
  onOpenCheckin,
  onNavigateTab,
  onMissionCompleted,
  streakDays,
  autoOpenGuide = false,
}) => {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [currentModalStep, setCurrentModalStep] = useState(0);

  React.useEffect(() => {
    if (!autoOpenGuide) return;
    try {
      if (!window.localStorage.getItem('aura-onboard-guide')) {
        setShowGuideModal(true);
        window.localStorage.setItem('aura-onboard-guide', '1');
      }
    } catch {
      setShowGuideModal(true);
    }
  }, [autoOpenGuide]);

  const [missions, setMissions] = useState<OnboardingMission[]>([
    {
      id: 'm1',
      title: 'Mission 1: Awaken Astra’s Egg',
      description: 'Interact with Astra for the first time to instill vitality into her cosmic shell.',
      xpReward: 50,
      cowriesReward: 30,
      completed: false,
      actionText: 'Greet & Awaken Egg',
      actionType: 'awaken',
      icon: Egg,
      accentColor: 'from-amber-500 to-rose-500',
    },
    {
      id: 'm2',
      title: 'Mission 2: Log Initial Hydration',
      description: 'Record your first 8 oz glass of water to build your daily hydration streak.',
      xpReward: 50,
      cowriesReward: 30,
      completed: false,
      actionText: 'Log Hydration (+8 oz)',
      actionType: 'hydrate',
      icon: Droplets,
      accentColor: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'm3',
      title: 'Mission 3: Submit AI Health Check-In',
      description: 'Record daily vitals, sleep, and medication to receive AI health attestation.',
      xpReward: 120,
      cowriesReward: 80,
      completed: false,
      actionText: 'Start Vitals Check-In',
      actionType: 'checkin',
      icon: HeartPulse,
      accentColor: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'm4',
      title: 'Mission 4: Explore Sponsor Care Grants',
      description: 'Discover how daily adherence unlocks real community health grant pools.',
      xpReward: 50,
      cowriesReward: 30,
      completed: false,
      actionText: 'View Grant Pools',
      actionType: 'explore_grants',
      icon: ShieldCheck,
      accentColor: 'from-purple-500 to-indigo-600',
    },
  ]);

  const [grandRewardClaimed, setGrandRewardClaimed] = useState(false);

  const completedCount = missions.filter((m) => m.completed).length;
  const totalCount = missions.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleExecuteMission = (mission: OnboardingMission) => {
    if (mission.completed) return;

    if (mission.actionType === 'awaken') {
      // Complete awakening immediately with celebratory feedback
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#ec4899'],
      });
      markMissionComplete(mission.id, mission.xpReward, mission.cowriesReward);
    } else if (mission.actionType === 'hydrate') {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#0284c7'],
      });
      markMissionComplete(mission.id, mission.xpReward, mission.cowriesReward);
    } else if (mission.actionType === 'checkin') {
      markMissionComplete(mission.id, mission.xpReward, mission.cowriesReward);
      onOpenCheckin();
    } else if (mission.actionType === 'explore_grants') {
      markMissionComplete(mission.id, mission.xpReward, mission.cowriesReward);
      onNavigateTab('wheel');
    }
  };

  const markMissionComplete = (id: string, xp: number, cowries: number) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: true } : m))
    );
    onMissionCompleted(xp, cowries, id);
  };

  const handleClaimGrandReward = () => {
    if (grandRewardClaimed || completedCount < totalCount) return;
    setGrandRewardClaimed(true);
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#10b981', '#38bdf8', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
    onMissionCompleted(150, 100, 'grand_onboarding_completion');
  };

  const tutorialSteps = [
    {
      title: '5 minutes a day, in your language',
      icon: '✨',
      subtitle: 'First step',
      description: VALUE_PROPS.microSessions,
    },
    {
      title: 'Step 1: Hatch & Nurture Astra',
      icon: '🥚',
      subtitle: 'From Dormant Egg to Luminary Guardian',
      description:
        'Astra starts as a cosmic Egg. Every daily check-in generates XP and vitality, hatching Astra into a Hatchling and beyond while keeping your health streak alive.',
    },
    {
      title: 'Step 2: Earn Cowries 🐚 & Unlocks',
      icon: '🐚',
      subtitle: 'Verifiable Health Rewards',
      description:
        'Completing daily health habit milestones awards Cowries 🐚. Spend them in the Spin Wheel lootbox to unlock cosmetic halos, streak shields, and bonus multipliers.',
    },
    {
      title: 'Step 3: Sponsor Care Grant Impact',
      icon: '🏥',
      subtitle: 'Community Wellness Power',
      description:
        'Your verified adherence logs contribute toward real-world community healthcare pools, bringing sponsored medical care and nutrition grants to sub-Saharan initiatives.',
    },
  ];

  return (
    <div className="aura-card-gradient p-6 relative overflow-hidden">
      {/* Background Subtle Glows */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-line">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-sunlight text-navy font-bold text-[10px] px-2.5 py-0.5 rounded-[4px] uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3 fill-navy" /> First-Day Mission
            </span>
            <span className="text-xs font-bold text-muted">
              Guided Onboarding Tutorial
            </span>
          </div>
          <h3 className="text-xl font-bold text-navy flex items-center gap-2">
            <span>Welcome, {userName || 'Health Explorer'}!</span>
            <span className="text-2xl">🌱</span>
          </h3>
          <p className="text-xs text-muted mt-1 max-w-xl leading-[1.6]">
            Complete your 4 First-Day Missions below to awaken Astra, earn your first <strong className="text-ink">+210 Cowries 🐚</strong>, and establish your 1-day habit streak!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setCurrentModalStep(0);
              setShowGuideModal(true);
            }}
            className="btn-ghost text-navy font-bold text-xs"
          >
            <HelpCircle className="w-4 h-4 text-gold" />
            <span>How It Works Guide</span>
          </button>

          <div className="astra-frame p-2.5 px-3.5 flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-muted">Tutorial Progress</div>
              <div className="text-xs font-bold text-harmony">
                {completedCount} / {totalCount} Done ({progressPercent}%)
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-ivory border border-line flex items-center justify-center font-bold text-xs text-navy">
              {progressPercent}%
            </div>
          </div>
        </div>
      </div>

      <div className="mission-stepper mb-6 pb-5 border-b border-line">
        {missions.map((mission, idx) => {
          const isDone = mission.completed;
          const isActive = !isDone && missions.findIndex((m) => !m.completed) === idx;
          return (
            <div key={mission.id} className={`mission-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
              <div className="dot" aria-hidden="true">
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span className="hidden sm:block text-[11px] font-semibold text-slate-300 truncate">{mission.title.replace(/^Mission \d+: /, '')}</span>
              {idx < missions.length - 1 && <div className="rail" />}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {missions.map((mission, idx) => {
          const IconComp = mission.icon;
          return (
            <div
              key={mission.id}
              className={`aura-card p-4 transition-all ${
                mission.completed
                  ? 'border-harmony/40'
                  : ''
              }`}
            >
              {/* Mission Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2.5 rounded-[4px] bg-navy text-sunlight`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  {mission.completed ? (
                    <span className="aura-badge aura-badge-success text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  ) : (
                    <span className="aura-badge aura-badge-info text-[10px] font-mono">
                      Step {idx + 1}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-navy mb-1 leading-snug">
                  {mission.title}
                </h4>
                <p className="text-[11px] text-muted leading-[1.6] mb-3">
                  {mission.description}
                </p>
              </div>

              {/* Reward Callout & Action */}
              <div className="pt-3 border-t border-line space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Reward:</span>
                  <span className="font-bold text-gold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" /> +{mission.xpReward} XP • +{mission.cowriesReward} 🐚
                  </span>
                </div>

                <button
                  onClick={() => handleExecuteMission(mission)}
                  disabled={mission.completed}
                  className={`w-full text-xs font-bold py-2 px-3 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                    mission.completed
                      ? 'bg-harmony/12 text-harmony border-harmony/30 cursor-default'
                      : 'btn-primary border-0'
                  }`}
                >
                  {mission.completed ? (
                    <>
                      <span>Mission Claimed ✓</span>
                    </>
                  ) : (
                    <>
                      <span>{mission.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Onboarding Completion Reward Banner */}
      <div className="trust-band rounded-[4px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[4px] bg-sunlight flex items-center justify-center text-navy font-bold shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-[#FFFAF4]">
                First-Day Mastery Grand Welcome Pack
              </h4>
              <span className="bg-sunlight/20 text-sunlight text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                +150 XP • +100 🐚 • Pioneer Badge
              </span>
            </div>
            <p className="text-[11px] text-[#FFFAF4]/75 mt-0.5 leading-[1.6]">
              Complete all 4 First-Day Missions to unlock your Pioneer Badge and hatch Astra into an active Hatchling!
            </p>
          </div>
        </div>

        <button
          onClick={handleClaimGrandReward}
          disabled={completedCount < totalCount || grandRewardClaimed}
          className={`px-5 py-2.5 rounded-[4px] font-bold text-xs flex items-center gap-2 shrink-0 ${
            grandRewardClaimed
              ? 'bg-harmony/20 text-[#FFFAF4] border border-harmony/40'
              : completedCount < totalCount
              ? 'bg-[#FFFAF4]/10 text-[#FFFAF4]/50 border border-[#FFFAF4]/20 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {grandRewardClaimed ? (
            <span>Grand Welcome Pack Claimed ✓</span>
          ) : completedCount < totalCount ? (
            <span>Complete All 4 Missions ({completedCount}/4)</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Claim Grand Welcome Pack</span>
            </>
          )}
        </button>
      </div>

      {/* Guided Walkthrough Modal Overlay */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-navy/50 flex items-center justify-center p-4">
          <div className="bg-peach border border-line rounded-[4px] max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-navy p-1 rounded-[4px]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content Step */}
            <div className="text-center mb-6 pt-2">
              <div className="text-5xl mb-3">{tutorialSteps[currentModalStep].icon}</div>
              <span className="bg-ivory text-navy text-[10px] font-bold px-3 py-1 rounded-[4px] border border-line uppercase tracking-wider">
                Step {currentModalStep + 1} of {tutorialSteps.length}
              </span>
              <h3 className="text-xl font-bold text-navy mt-3">
                {tutorialSteps[currentModalStep].title}
              </h3>
              <p className="text-xs font-bold text-gold mt-1">
                {tutorialSteps[currentModalStep].subtitle}
              </p>
              <p className="text-xs text-muted mt-3 leading-[1.6]">
                {tutorialSteps[currentModalStep].description}
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center items-center gap-2 mb-6">
              {tutorialSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === currentModalStep
                      ? 'w-8 bg-sunlight'
                      : 'w-2 bg-line'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-line">
              <button
                onClick={() => setCurrentModalStep((prev) => Math.max(0, prev - 1))}
                disabled={currentModalStep === 0}
                className="text-xs font-bold text-muted hover:text-navy disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {currentModalStep < tutorialSteps.length - 1 ? (
                <button
                  onClick={() => setCurrentModalStep((prev) => prev + 1)}
                  className="btn-primary text-xs"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="btn-primary text-xs"
                >
                  <span>Start First Mission!</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
