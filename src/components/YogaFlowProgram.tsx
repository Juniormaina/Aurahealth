import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Flower2,
  Play,
  Pause,
  CheckCircle2,
  ChevronLeft,
  Timer,
  Wind,
  Sparkles,
} from 'lucide-react';
import {
  YOGA_FLOWS,
  YogaFlow,
  YogaFlowStep,
  flowTotalSeconds,
  getAsana,
} from '../content/yogaFlows';
import { AnimatedYogaTrainer } from './AnimatedYogaTrainer';

interface YogaFlowProgramProps {
  storageKey: string;
  onFlowCompleted?: (sessionId: string, minutes: number) => void;
  onShowToast?: (message: string) => void;
}

type BreathPhase = 'inhale' | 'hold_top' | 'exhale' | 'hold_bottom' | 'idle';

function loadCompleted(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { completedSessionIds?: string[] };
    return Array.isArray(parsed.completedSessionIds) ? parsed.completedSessionIds : [];
  } catch {
    return [];
  }
}

function phaseLabel(phase: BreathPhase): string {
  switch (phase) {
    case 'inhale':
      return 'Inhale';
    case 'hold_top':
      return 'Hold';
    case 'exhale':
      return 'Exhale';
    case 'hold_bottom':
      return 'Hold';
    default:
      return 'Breathe naturally';
  }
}

export const YogaFlowProgram: React.FC<YogaFlowProgramProps> = ({
  storageKey,
  onFlowCompleted,
  onShowToast,
}) => {
  const [completedIds, setCompletedIds] = useState(() => loadCompleted(storageKey));
  const [activeFlow, setActiveFlow] = useState<YogaFlow | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepLeft, setStepLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('idle');
  const [breathLeft, setBreathLeft] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ completedSessionIds: completedIds }));
  }, [completedIds, storageKey]);

  const step: YogaFlowStep | undefined = activeFlow?.steps[stepIndex];
  const progressPct = useMemo(() => {
    if (!activeFlow) return 0;
    const done = activeFlow.steps.slice(0, stepIndex).reduce((s, x) => s + x.duration_seconds, 0);
    const total = flowTotalSeconds(activeFlow);
    const currentElapsed = step ? step.duration_seconds - stepLeft : 0;
    return Math.min(100, Math.round(((done + currentElapsed) / Math.max(1, total)) * 100));
  }, [activeFlow, stepIndex, stepLeft, step]);

  useEffect(() => {
    if (!running || !step) return;

    const pattern = step.breath_pattern;
    const cycle: Array<{ phase: BreathPhase; seconds: number }> = (
      [
        { phase: 'inhale' as const, seconds: pattern.inhale },
        { phase: 'hold_top' as const, seconds: pattern.hold_top },
        { phase: 'exhale' as const, seconds: pattern.exhale },
        { phase: 'hold_bottom' as const, seconds: pattern.hold_bottom },
      ] as Array<{ phase: BreathPhase; seconds: number }>
    ).filter((x) => x.seconds > 0);

    let phaseIdx = 0;
    let phaseRemain = cycle[0]?.seconds ?? 0;
    setBreathPhase(cycle[0]?.phase ?? 'idle');
    setBreathLeft(phaseRemain);

    tickRef.current = setInterval(() => {
      setStepLeft((left) => {
        if (left <= 1) {
          return 0;
        }
        return left - 1;
      });

      phaseRemain -= 1;
      if (phaseRemain <= 0 && cycle.length) {
        phaseIdx = (phaseIdx + 1) % cycle.length;
        phaseRemain = cycle[phaseIdx]!.seconds;
        setBreathPhase(cycle[phaseIdx]!.phase);
      }
      setBreathLeft(Math.max(0, phaseRemain));
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [running, stepIndex, activeFlow?.session_id]);

  useEffect(() => {
    if (!activeFlow || !running) return;
    if (stepLeft > 0) return;
    // Guard: wait until a step is actually loaded
    if (!step) return;
    if (stepIndex + 1 < activeFlow.steps.length) {
      const next = activeFlow.steps[stepIndex + 1]!;
      setStepIndex((i) => i + 1);
      setStepLeft(next.duration_seconds);
      return;
    }
    finishFlow(activeFlow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepLeft, running, activeFlow, stepIndex, step]);

  const startFlow = (flow: YogaFlow) => {
    setActiveFlow(flow);
    setStepIndex(0);
    setStepLeft(flow.steps[0]?.duration_seconds ?? 0);
    setRunning(true);
    setBreathPhase('inhale');
  };

  const finishFlow = (flow: YogaFlow) => {
    setRunning(false);
    setActiveFlow(null);
    const minutes = Math.max(1, Math.round(flowTotalSeconds(flow) / 60));
    if (!completedIds.includes(flow.session_id)) {
      setCompletedIds((ids) => [...ids, flow.session_id]);
      onFlowCompleted?.(flow.session_id, minutes);
      onShowToast?.(`${flow.flow_name} complete · ~${minutes} min`);
    } else {
      onShowToast?.(`${flow.flow_name} finished. Nice recovery.`);
    }
  };

  if (activeFlow && step) {
    const asana = getAsana(step.pose_id);
    const sideNote =
      step.side === 'left' ? ' · Left side' : step.side === 'right' ? ' · Right side' : '';

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => {
                setRunning(false);
                setActiveFlow(null);
              }}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Exit
            </button>
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wide">
              {activeFlow.flow_name}
            </span>
          </div>

          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[var(--color-harmony)] transition-all" style={{ width: `${progressPct}%` }} />
          </div>

          <AnimatedYogaTrainer
            animationAssetId={step.animation_asset_id}
            isBreathing={asana?.type === 'Breathwork' || breathPhase !== 'idle'}
            breathPhase={breathPhase}
            label={`Coach Aura · ${phaseLabel(breathPhase)}${breathLeft ? ` ${breathLeft}s` : ''}`}
          />

          <div>
            <p className="text-[11px] text-muted font-semibold uppercase tracking-wide mb-1">
              Step {step.sequence_order}/{activeFlow.steps.length}
              {sideNote}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">{step.pose_name}</h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{step.audio_cue}</p>
            {asana && (
              <p className="text-[11px] text-slate-500 mt-2 uppercase tracking-wide">{asana.type}</p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--color-harmony)]/35 bg-[var(--color-harmony)]/10 p-4 flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-[var(--color-harmony)] text-xs font-semibold">
                <Timer className="w-3.5 h-3.5" /> Hold
              </div>
              <div className="text-3xl font-bold tabular-nums text-white mt-1">{stepLeft}s</div>
              <div className="text-[11px] text-slate-400 mt-1 inline-flex items-center gap-1">
                <Wind className="w-3 h-3" />
                {phaseLabel(breathPhase)}
                {breathLeft > 0 ? ` · ${breathLeft}s` : ''}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="btn-ghost text-xs justify-center"
                onClick={() => setRunning((r) => !r)}
              >
                {running ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Resume
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-primary text-xs justify-center"
                onClick={() => setStepLeft(0)}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="glass-panel rounded-2xl p-5 sm:p-6">
        <p className="view-kicker inline-flex items-center gap-1.5">
          <Flower2 className="w-3.5 h-3.5" /> Yoga & Breathwork
        </p>
        <h2 className="view-title !text-2xl mt-1">Recovery flows for athletes</h2>
        <p className="view-copy mt-2">
          Sequence-ready sessions for joint mobility, nervous-system reset, and post-calisthenics wind-down — with guided breath pacing.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        {YOGA_FLOWS.map((flow) => {
          const done = completedIds.includes(flow.session_id);
          const secs = flowTotalSeconds(flow);
          return (
            <article
              key={flow.session_id}
              className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col gap-3 border border-white/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{flow.flow_name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {flow.target_duration_minutes} min · {flow.difficulty_tier} · {Math.round(secs / 60)} min paced
                  </p>
                </div>
                {done && (
                  <span className="text-[10px] font-semibold text-emerald-300 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Done
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {flow.focus_areas.map((area) => (
                  <span
                    key={area}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-slate-300"
                  >
                    {area}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                {flow.steps[0]?.audio_cue}
              </p>
              <button type="button" className="btn-primary text-xs justify-center mt-auto" onClick={() => startFlow(flow)}>
                <Play className="w-3.5 h-3.5" /> Start flow
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
};
