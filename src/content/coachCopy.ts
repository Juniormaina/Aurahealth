const ENGLISH_CHIPS = [
  'I have a headache after poor sleep',
  'How much water should I drink today?',
  'Start a 5-minute stress reset',
];

const ENGLISH_GREETING =
  "Hi, I'm Astra — your AI health companion for medical and wellness questions only (not a doctor). Ask about sleep, stress, nutrition, movement, recovery, or symptoms to take to a clinician.";

/** Prompt chips for Astra — English only. */
export function coachPromptChips(_language?: string): string[] {
  return ENGLISH_CHIPS;
}

/** Astra greeting — English only. */
export function coachGreeting(_language?: string, latestAnxiety?: number | null): string {
  const n =
    typeof latestAnxiety === 'number' && Number.isFinite(latestAnxiety)
      ? Math.min(10, Math.max(1, Math.round(latestAnxiety)))
      : null;
  const extra = n == null ? '' : ` Last anxiety check-in: ${n}/10.`;
  return `${ENGLISH_GREETING}${extra}`;
}
