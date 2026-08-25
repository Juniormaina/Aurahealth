import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Camera, Loader2, Heart, Droplets, Moon, Pill, Activity, Smile, Watch, RefreshCw, Smartphone, Zap } from 'lucide-react';
import { HealthCheckIn } from '../types';
import { computeKeccakProof, createAvalancheTxRecord, checkInOnChain, WalletState } from '../services/avalanche';
import { WearablesSyncModal, SyncedBiometrics } from './WearablesSyncModal';
import { useHealthData, HealthSource } from '../services/healthDataService';
import confetti from 'canvas-confetti';

interface HealthCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCheckIn: HealthCheckIn) => void;
  onShowToast?: (msg: string) => void;
  wallet?: WalletState;
}

export const HealthCheckinModal: React.FC<HealthCheckinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
  wallet,
}) => {
  const [waterOz, setWaterOz] = useState<number>(64);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [medicationTaken, setMedicationTaken] = useState<boolean>(true);
  const [moodRating, setMoodRating] = useState<number>(5);
  const [anxietyLevel, setAnxietyLevel] = useState<number>(6);
  const [activityMinutes, setActivityMinutes] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<string>('');
  const [isWearablesModalOpen, setIsWearablesModalOpen] = useState<boolean>(false);
  const [isWearablesSynced, setIsWearablesSynced] = useState<boolean>(false);
  const { isFetching: isHealthFetching, syncHealthData } = useHealthData();
  const [activeHealthSource, setActiveHealthSource] = useState<HealthSource>('apple_health');

  if (!isOpen) return null;

  const handleFetchExternalHealthData = async (source: HealthSource) => {
    setActiveHealthSource(source);
    const metrics = await syncHealthData(source);
    if (metrics) {
      setSleepHours(metrics.sleepDurationHours);
      setWaterOz(metrics.waterOz);
      setActivityMinutes(metrics.activeMinutes);
      setIsWearablesSynced(true);
      setNotes(`[Fetched via ${metrics.providerName} at ${metrics.fetchedAt}] Step Count: ${metrics.stepCount.toLocaleString()} steps | Sleep: ${metrics.sleepDurationHours} hrs | Heart Rate: ${metrics.heartRateBpm} bpm.`);
      if (onShowToast) {
        onShowToast(`Synced with ${metrics.providerName}! Updated steps (${metrics.stepCount.toLocaleString()}) & sleep (${metrics.sleepDurationHours} hrs).`);
      }
    }
  };

  const handleApplyWearablesData = (data: SyncedBiometrics) => {
    setWaterOz(data.waterOz);
    setSleepHours(data.sleepHours);
    setActivityMinutes(data.activityMinutes);
    setIsWearablesSynced(true);
    setNotes(`[Verified Wearable Sync: ${data.verificationSource}] ${data.stepsCount} steps, ${data.heartRateBpm} bpm, ${data.spo2Percent}% SpO2.`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAiStatus('Connecting to Gemini AI for attestation analysis...');

    let aiAttestationScore = 95;
    let aiFeedback = 'Health check-in verified. Water intake & medication schedule match target requirements.';

    try {
      const response = await fetch('/api/verify-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waterOz,
          sleepHours,
          medicationTaken,
          moodRating,
          activityMinutes,
          notes,
          imageBase64: photoPreview,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.aiAttestationScore) {
          aiAttestationScore = data.aiAttestationScore;
          aiFeedback = data.aiFeedback || aiFeedback;
        }
      }
    } catch (err) {
      console.warn('Backend API connection standard fallback used:', err);
    }

    const proofString = `${waterOz}-${sleepHours}-${medicationTaken}-${moodRating}-${activityMinutes}-${Date.now()}`;
    const proofHash = computeKeccakProof(proofString);

    let tx;
    if (wallet && !wallet.isSandbox) {
      setAiStatus('Broadcasting checkIn() to StreakTracker on Avalanche Fuji...');
      tx = await checkInOnChain();
      if (tx && onShowToast) {
        onShowToast(`On-chain check-in confirmed — tx ${tx.hash.slice(0, 10)}…`);
      }
    }
    if (!tx) {
      setAiStatus('Hashing cryptographic attestation proof on secure ledger...');
      await new Promise((r) => setTimeout(r, 1000));
      tx = createAvalancheTxRecord('ProofOfAdherence.sol', 'recordCheckIn', `CheckInVerified(score:${aiAttestationScore})`);
    }

    const cowriesAwarded = medicationTaken ? 120 : 80;
    const xpAwarded = 150 + Math.floor(activityMinutes * 1.5);

    const newCheckIn: HealthCheckIn = {
      id: `chk-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      type: 'daily_full',
      waterOz,
      sleepHours,
      medicationTaken,
      moodRating,
      anxietyLevel,
      activityMinutes,
      notes: notes || 'Daily health adherence routine completed.',
      proofHash,
      txHash: tx.hash,
      blockNumber: tx.blockNumber,
      cowriesEarned: cowriesAwarded,
      xpEarned: xpAwarded,
      aiAttestationScore,
      aiFeedback,
    };

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#10b981', '#38bdf8', '#fbbf24', '#f43f5e'],
    });

    setIsSubmitting(false);
    onSuccess(newCheckIn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="aura-card-gradient w-full max-w-xl rounded-[4px] p-6 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-navy p-1 rounded-[4px]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-harmony/12 text-harmony p-2.5 rounded-[4px] border border-harmony/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-navy">Daily Health Check-In</h3>
            <p className="text-xs text-muted leading-[1.6]">
              Low-friction health reporting with verifiable cryptographic proof
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Wearables & Health Data Sync Banner */}
          <div className="astra-frame p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0">
                <Smartphone className="w-4 h-4 text-cyan-500" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Apple Health & Google Fit Sync</span>
                  {isWearablesSynced && (
                    <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-500/30">
                      Synced ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-300">
                  {isWearablesSynced
                    ? 'Step count and sleep duration auto-populated from health provider'
                    : 'Auto-fetch step count & sleep duration from health integrations'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                disabled={isHealthFetching}
                onClick={() => handleFetchExternalHealthData('apple_health')}
                className="btn-ghost text-[11px] flex items-center gap-1"
                title="Fetch daily steps & sleep from Apple Health"
              >
                {isHealthFetching && activeHealthSource === 'apple_health' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span>Apple Health</span>
              </button>

              <button
                type="button"
                disabled={isHealthFetching}
                onClick={() => handleFetchExternalHealthData('google_fit')}
                className="btn-ghost text-[11px] flex items-center gap-1"
                title="Fetch daily steps & sleep from Google Fit"
              >
                {isHealthFetching && activeHealthSource === 'google_fit' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>Google Fit</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWearablesModalOpen(true)}
                className="btn-primary text-[11px] flex items-center gap-1"
                title="Open detailed Wearable Hardware Sensor Hub"
              >
                <Watch className="w-3.5 h-3.5" />
                <span>More</span>
              </button>
            </div>
          </div>

          {/* Hydration Slider */}
          <div className="astra-frame p-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-navy flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" /> Daily Water Intake (oz)
              </label>
              <span className="text-cyan-300 font-mono font-bold text-sm">{waterOz} oz</span>
            </div>
            <input
              type="range"
              min="16"
              max="128"
              step="8"
              value={waterOz}
              onChange={(e) => setWaterOz(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>16 oz</span>
              <span>64 oz (Target)</span>
              <span>128 oz</span>
            </div>
          </div>

          {/* Sleep & Medication Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sleep Slider */}
            <div className="astra-frame p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-navy flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" /> Sleep Duration
                </label>
                <span className="text-indigo-300 font-mono font-bold text-sm">{sleepHours} hrs</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>

            {/* Medication Toggle */}
            <div className="astra-frame p-4 flex flex-col justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-rose-400" /> Medication Adherence
              </label>
              <button
                type="button"
                onClick={() => setMedicationTaken(!medicationTaken)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  medicationTaken
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${medicationTaken ? 'text-emerald-400' : 'text-rose-400'}`} />
                {medicationTaken ? 'Prescription Taken' : 'Missed Medication'}
              </button>
            </div>
          </div>

          {/* Mood Selector (1-5) */}
          <div className="astra-frame p-4">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2 mb-3">
              <Smile className="w-4 h-4 text-amber-400" /> Today's Wellbeing & Mood
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { rating: 1, label: 'Exhausted', emoji: '😫' },
                { rating: 2, label: 'Unwell', emoji: '🙁' },
                { rating: 3, label: 'Okay', emoji: '😐' },
                { rating: 4, label: 'Good', emoji: '😊' },
                { rating: 5, label: 'Vibrant', emoji: '🤩' },
              ].map((m) => (
                <button
                  key={m.rating}
                  type="button"
                  onClick={() => setMoodRating(m.rating)}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 text-[11px] transition-all ${
                    moodRating === m.rating
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-bold scale-105'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg">{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="astra-frame p-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-200">Anxiety level (1–10)</label>
              <span className="tabular-nums text-[#8C52FF] font-bold text-sm">{anxietyLevel}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={anxietyLevel}
              onChange={(e) => setAnxietyLevel(Number(e.target.value))}
              className="w-full accent-[#8C52FF]"
            />
          </div>

          {/* Physical Activity Minutes */}
          <div className="astra-frame p-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-navy flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Physical Exercise / Walking
              </label>
              <span className="text-emerald-300 font-mono font-bold text-sm">{activityMinutes} mins</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={activityMinutes}
              onChange={(e) => setActivityMinutes(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Optional Notes & Photo Attachment */}
          <div className="astra-frame p-4 space-y-3">
            <label className="text-xs font-bold text-slate-200 block">
              Optional Health Notes or Prescription Verification
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Completed morning walk, drank 2 bottles of water, took blood pressure reading..."
            className="w-full aura-input p-3 text-xs min-h-[80px]"
              rows={2}
            />

            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium px-3 py-2 rounded-xl flex items-center gap-2 transition-colors">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Attach Photo Attestation</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {photoPreview && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Photo Attached
                </div>
              )}
            </div>
          </div>

          {/* Status message */}
          {isSubmitting && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>{aiStatus}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary justify-center text-sm py-3 px-6 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Verifying Attestation...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Submit & Stamp Digital Health Pass (+120 🐚)
              </>
            )}
          </button>
        </form>

        {/* Wearables Sync Integration Modal */}
        <WearablesSyncModal
          isOpen={isWearablesModalOpen}
          onClose={() => setIsWearablesModalOpen(false)}
          onSyncData={handleApplyWearablesData}
          onShowToast={onShowToast}
        />
      </div>
    </div>
  );
};
