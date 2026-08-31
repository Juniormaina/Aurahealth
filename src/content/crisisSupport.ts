export type CrisisResource = {
  name: string;
  href: string;
  detail: string;
};

/** Kenya-first numbers plus an international finder. Shown on the coach at all times. */
export const CRISIS_RESOURCES: CrisisResource[] = [
  { name: 'Kenya emergency services', href: 'tel:999', detail: 'Call 999 or 112' },
  { name: 'Kenya Red Cross', href: 'tel:1199', detail: 'Call 1199' },
  { name: 'Befrienders Kenya', href: 'tel:+254722178177', detail: '+254 722 178 177' },
  {
    name: 'Find a local helpline',
    href: 'https://www.iasp.info/suicidalthoughts/',
    detail: 'IASP directory for your country',
  },
];

export const CRISIS_REPLY =
  "I'm really glad you reached out. I'm Astra, an AI companion — not a clinician, and I can't help in an emergency. If you might hurt yourself or feel unsafe, please contact a helpline or emergency services now. You don't have to handle this alone.";

const CRISIS_PATTERN =
  /\b(suicid(?:e|al)?|kill(?:ing)? myself|want to die|end(?:ing)? my life|end it all|self[- ]harm|hurt myself|don'?t want to (?:live|be alive)|no reason to live|better off dead|kujiua|nataka kufa)\b/i;

export function looksLikeCrisis(text: string): boolean {
  return CRISIS_PATTERN.test(String(text || ''));
}
