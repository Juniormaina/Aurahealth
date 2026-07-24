import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Clock,
  ShieldAlert,
  Sparkles,
  Flame,
  Heart,
  CheckCircle2,
  Volume2,
  X,
  Smartphone,
  Send,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReminderSchedule {
  id: string;
  title: string;
  time: string;
  category: 'Hydration' | 'Vitals' | 'Streak Protection';
  enabled: boolean;
  message: string;
}

interface StreakReminderManagerProps {
  currentStreak: number;
  companionName: string;
  companionHealth: number;
  onOpenCheckin: () => void;
  onShowToast?: (msg: string) => void;
}

export const StreakReminderManager: React.FC<StreakReminderManagerProps> = ({
  currentStreak,
  companionName,
  companionHealth,
  onOpenCheckin,
  onShowToast,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('default');

  const [reminders, setReminders] = useState<ReminderSchedule[]>([
    {
      id: 'rem-1',
      title: 'Morning Hydration & Vitality',
      time: '08:00 AM',
      category: 'Hydration',
      enabled: true,
      message: `🌅 Good morning! Log your water intake to boost ${companionName}'s Vitality.`,
    },
    {
      id: 'rem-2',
      title: 'Mid-Day Adherence & Dosage',
      time: '01:00 PM',
      category: 'Vitals',
      enabled: true,
      message: `☀️ Mid-day check-in: Verify your adherence log to earn +100 🐚 Cowries.`,
    },
    {
      id: 'rem-3',
      title: 'Evening Streak Preservation Shield',
      time: '08:30 PM',
      category: 'Streak Protection',
      enabled: true,
      message: `🔥 Don't lose your ${currentStreak}-day streak! ${companionName} is waiting for your evening vitals.`,
    },
  ]);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const handleTogglePushNotifications = async () => {
    if (!('Notification' in window)) {
      if (onShowToast) onShowToast('Web Notifications not supported in this browser environment. Using in-app notifications!');
      setNotificationsEnabled(!notificationsEnabled);
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(!notificationsEnabled);
      if (onShowToast) onShowToast(notificationsEnabled ? 'Push notifications paused.' : 'Push notifications active!');
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#38bdf8'],
        });
        if (onShowToast) onShowToast('Browser Push Notifications Enabled! You will receive gentle streak alerts.');
      } else {
        if (onShowToast) onShowToast('Notification permission denied by browser.');
      }
    } else {
      if (onShowToast) onShowToast('Notifications are blocked in browser settings. Enable them in site permissions.');
    }
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = !r.enabled;
          if (onShowToast) onShowToast(`${r.title} ${updated ? 'activated' : 'disabled'}.`);
          return { ...r, enabled: updated };
        }
        return r;
      })
    );
  };

  const handleTestTriggerNudge = (rem: ReminderSchedule) => {
    if ('Notification' in window && Notification.permission === 'granted' && notificationsEnabled) {
      try {
        new Notification(`✨ ${companionName} Reminder: ${rem.title}`, {
          body: rem.message,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Native notification failed:', e);
      }
    }

    if (onShowToast) {
      onShowToast(`🔔 [GENTLE REMINDER] ${rem.message}`);
    }

    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#fbbf24'],
    });
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-500/20 text-rose-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-rose-500/30 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400 fill-rose-400" /> Retention & Companion Wellbeing
            </span>
            <span className="text-xs text-slate-400">Gentle Reminder Protocol</span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Streak Preservation & Push Reminders</span>
            <BellRing className="w-5 h-5 text-amber-400 animate-bounce" />
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Never miss a daily vitals log! Set gentle reminders to preserve your <strong>{currentStreak}-day health streak</strong> and keep {companionName} glowing with optimal health integrity.
          </p>
        </div>

        {/* Master Toggle */}
        <button
          onClick={handleTogglePushNotifications}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-md ${
            notificationsEnabled
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{notificationsEnabled ? 'Push Alerts: ACTIVE ✓' : 'Enable Gentle Push Alerts'}</span>
        </button>
      </div>

      {/* Companion Wellbeing Warning Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-950 to-rose-950/60 p-4 rounded-xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-lg shrink-0">
            🛡️
          </div>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-2">
              <span>{companionName}'s Streak Protection Status</span>
              <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.2 rounded-full font-bold">
                {currentStreak} Days Active
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Logging before midnight prevents a -15% drop in {companionName}'s Harmony and preserves your Cowrie earning multiplier!
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCheckin}
          className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Log Vitals Now</span>
        </button>
      </div>

      {/* Scheduled Reminders List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Daily Schedule & Gentle Nudges</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                rem.enabled
                  ? 'bg-slate-950/80 border-slate-800'
                  : 'bg-slate-950/40 border-slate-800/50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-amber-300 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {rem.time}
                  </span>
                  <button
                    onClick={() => handleToggleReminder(rem.id)}
                    className={`w-8 h-4 rounded-full transition-colors relative ${
                      rem.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        rem.enabled ? 'transform translate-x-4' : ''
                      }`}
                    />
                  </button>
                </div>

                <h5 className="text-xs font-bold text-white mb-1">{rem.title}</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{rem.message}</p>
              </div>

              <div className="pt-2 border-t border-slate-900 flex justify-end">
                <button
                  onClick={() => handleTestTriggerNudge(rem)}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                  title="Simulate sending this reminder push notification now"
                >
                  <Send className="w-3 h-3" />
                  <span>Test Nudge</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
