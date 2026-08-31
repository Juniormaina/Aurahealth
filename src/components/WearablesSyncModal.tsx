import React, { useState } from 'react';
import {
  Watch,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  X,
  ShieldCheck,
  Zap,
  Activity,
  Heart,
  Moon,
  Droplets,
  Award,
  Sparkles,
  Link2,
  Lock
} from 'lucide-react';

export interface WearableDevice {
  id: string;
  name: string;
  provider: 'google_fit' | 'apple_health' | 'fitbit' | 'garmin' | 'oura';
  icon: string;
  connected: boolean;
  lastSynced: string;
  accuracyRating: string;
  accentColor: string;
}

export interface SyncedBiometrics {
  stepsCount: number;
  sleepHours: number;
  waterLiters: number;
  heartRateBpm: number;
  activeCalories: number;
  activityMinutes: number;
  spo2Percent: number;
  timestamp: string;
  verificationSource: string;
}

interface WearablesSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncData: (data: SyncedBiometrics) => void;
  onShowToast?: (msg: string) => void;
}

export const WearablesSyncModal: React.FC<WearablesSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncData,
  onShowToast,
}) => {
  const [devices, setDevices] = useState<WearableDevice[]>([
    {
      id: 'dev-gfit',
      name: 'Google Fit',
      provider: 'google_fit',
      icon: '🌐',
      connected: false,
      lastSynced: 'Not connected',
      accuracyRating: 'Simulated preview',
      accentColor: 'from-blue-500 to-emerald-500',
    },
    {
      id: 'dev-awatch',
      name: 'Apple Watch / HealthKit',
      provider: 'apple_health',
      icon: '⌚',
      connected: false,
      lastSynced: 'Not connected',
      accuracyRating: 'Simulated preview',
      accentColor: 'from-rose-500 to-indigo-600',
    },
    {
      id: 'dev-fitbit',
      name: 'Fitbit',
      provider: 'fitbit',
      icon: '⌚',
      connected: false,
      lastSynced: 'Not connected',
      accuracyRating: 'Simulated preview',
      accentColor: 'from-teal-500 to-cyan-600',
    },
    {
      id: 'dev-garmin',
      name: 'Garmin',
      provider: 'garmin',
      icon: '🏃',
      connected: false,
      lastSynced: 'Not connected',
      accuracyRating: 'Simulated preview',
      accentColor: 'from-amber-500 to-orange-600',
    },
  ]);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedData, setLastSyncedData] = useState<SyncedBiometrics>({
    stepsCount: 8420,
    sleepHours: 7.8,
    waterLiters: 2.25,
    heartRateBpm: 68,
    activeCalories: 410,
    activityMinutes: 45,
    spo2Percent: 99,
    timestamp: 'Just now',
    verificationSource: 'Simulated preview',
  });

  if (!isOpen) return null;

  const handleToggleConnect = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextState = !d.connected;
          if (nextState) {
            if (onShowToast) onShowToast(`${d.name} preview enabled. No live API is connected.`);
          }
          return {
            ...d,
            connected: nextState,
            lastSynced: nextState ? 'Using simulated sample' : 'Not connected',
          };
        }
        return d;
      })
    );
  };

  const handleSyncTelemetry = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const freshData: SyncedBiometrics = {
        stepsCount: Math.floor(7500 + Math.random() * 3000),
        sleepHours: Number((7.0 + Math.random() * 1.5).toFixed(1)),
        waterLiters: Number((1.5 + Math.random() * 1.5).toFixed(2)),
        heartRateBpm: Math.floor(64 + Math.random() * 10),
        activeCalories: Math.floor(350 + Math.random() * 150),
        activityMinutes: Math.floor(35 + Math.random() * 25),
        spo2Percent: 98 + Math.floor(Math.random() * 2),
        timestamp: 'Just now',
        verificationSource: 'Simulated preview',
      };

      setLastSyncedData(freshData);
      setIsSyncing(false);
      onSyncData(freshData);

      if (onShowToast) onShowToast('Loaded a simulated wearable sample. HealthKit and Fit are not connected.');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative my-8">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-cyan-500/20 text-cyan-400 p-2.5 rounded-xl border border-cyan-500/30">
            <Watch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white">Wearable preview</h3>
              <span className="bg-white/10 text-[#D5E4DC] font-bold text-[10px] px-2 py-0.5 rounded-full border border-white/15">
                Simulated
              </span>
            </div>
            <p className="text-xs text-slate-400">
              HealthKit, Google Fit, Fitbit, and Garmin are not wired yet. Numbers below are demo samples.
            </p>
          </div>
        </div>

        {/* Sync Telemetry Banner */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Latest simulated readings</span>
            </div>
            <button
              onClick={handleSyncTelemetry}
              disabled={isSyncing}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Loading sample…' : 'Load sample'}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900 text-center">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                <Moon className="w-3 h-3 text-indigo-400" /> Sleep
              </div>
              <div className="text-sm font-black text-indigo-300">{lastSyncedData.sleepHours} hrs</div>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" /> Water
              </div>
              <div className="text-sm font-black text-cyan-300">{lastSyncedData.waterLiters} L</div>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 text-rose-400" /> Heart Rate
              </div>
              <div className="text-sm font-black text-rose-300">{lastSyncedData.heartRateBpm} bpm</div>
            </div>
          </div>
        </div>

        {/* Connected Health API Services */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Available previews
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  dev.connected
                    ? 'bg-slate-950 border-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{dev.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{dev.name}</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">
                      {dev.accuracyRating}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleConnect(dev.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    dev.connected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
                  }`}
                >
                  {dev.connected ? 'Preview on' : 'Use preview'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Verification Note */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Demo data only — HealthKit and Google Fit are not connected.
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
