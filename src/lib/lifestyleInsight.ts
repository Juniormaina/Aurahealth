import type { DailySummary } from '../types/lifestyle';

export interface AuraInsight {
  headline: string;
  body: string;
  recommendation: string;
}

/** Deterministic local insight when Astra API is unavailable */
export function buildLocalAuraInsight(summary: DailySummary): AuraInsight {
  const { activeMinutes, recovery, nutrition, mealCount } = summary;
  const recoveryScore = recovery?.score;

  if (activeMinutes >= 45 && (recoveryScore == null || recoveryScore >= 65)) {
    return {
      headline: "You're already moving today.",
      body: `You've logged ${activeMinutes} minutes of everyday activity${
        recoveryScore != null ? ` and your recovery is ${recoveryScore}/100` : ''
      }.`,
      recommendation: 'Astra recommends a short mobility session and good hydration.',
    };
  }

  if (recoveryScore != null && recoveryScore < 55) {
    return {
      headline: 'Prioritize recovery today.',
      body: `Recovery is ${recoveryScore}/100. ${recovery?.guidance ?? ''}`.trim(),
      recommendation: 'Keep intensity low — breathwork or a gentle yoga flow fits better than a hard Train day.',
    };
  }

  if (mealCount === 0 && activeMinutes < 20) {
    return {
      headline: 'Start with one small win.',
      body: 'No meals or movement logged yet today.',
      recommendation: 'Log a walk in Shamba Fit or build a plate in Kenyan Food Lens, then ask Astra what to do next.',
    };
  }

  if (nutrition.calories >= 1800) {
    return {
      headline: 'Solid fuel logged.',
      body: `Estimated intake so far: ~${nutrition.calories} kcal across ${mealCount} meal(s).`,
      recommendation: 'Balance the afternoon with vegetables or a walk if you have been sitting a lot.',
    };
  }

  return {
    headline: 'Keep the lifestyle loop going.',
    body: `Movement ${activeMinutes} min · Est. food ~${nutrition.calories} kcal${
      recoveryScore != null ? ` · Recovery ${recoveryScore}/100` : ''
    }.`,
    recommendation: recovery?.guidance ?? 'Check in with Uko Sawa? and ask Astra for a plan that fits today.',
  };
}
