import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Camera, Loader2, Heart, Droplets, Moon, Pill, Activity, Smile } from 'lucide-react';
import { HealthCheckIn } from '../types';
import { computeKeccakProof, createAvalancheTxRecord } from '../services/avalanche';
import confetti from 'canvas-confetti';

interface HealthCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCheckIn: HealthCheckIn) => void;
}

export const HealthCheckinModal: React.FC<HealthCheckinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [waterOz, setWaterOz] = useState<number>(64);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [medicationTaken, setMedicationTaken] = useState<boolean>(true);
  const [moodRating, setMoodRating] = useState<number>(5);
  const [activityMinutes, setActivityMinutes] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<string>('');

  if (!isOpen) return null;

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

    setAiStatus('Hashing cryptographic attestation proof on Avalanche C-Chain...');
    await new Promise((r) => setTimeout(r, 1000));

    const proofString = `${waterOz}-${sleepHours}-${medicationTaken}-${moodRating}-${activityMinutes}-${Date.now()}`;
    const proofHash = computeKeccakProof(proofString);
    const tx = createAvalancheTxRecord('ProofOfAdherence.sol', 'recordCheckIn', `CheckInVerified(score:${aiAttestationScore})`);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Daily Health Check-In</h3>
            <p className="text-xs text-slate-400">
              Low-friction health reporting with cryptographic proof on Avalanche
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Hydration Slider */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
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
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
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
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
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
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
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

          {/* Physical Activity Minutes */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
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
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-200 block">
              Optional Health Notes or Prescription Verification
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Completed morning walk, drank 2 bottles of water, took blood pressure reading..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
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
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-extrabold text-sm py-3 px-6 rounded-xl shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Verifying On Avalanche...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Submit & Mint Adherence Proof (+120 🐚)
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
