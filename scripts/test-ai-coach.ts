import path from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { shouldSearch } from '../src/server/coachTurn.ts';

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const eq = trimmed.indexOf('=');
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] == null) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), 'src', '.env'));
loadEnvFile(path.join(process.cwd(), '.env'));

const SCENARIOS = [
  {
    name: 'micro-session (must not search)',
    userMessage: 'Start a 5-minute stress reset',
    expectSearch: false,
    history: [],
  },
  {
    name: 'streak help (must not search)',
    userMessage: 'How do I boost my streak?',
    expectSearch: false,
    history: [],
  },
  {
    name: 'factual water question (may search)',
    userMessage: 'How much water should an adult drink per day?',
    expectSearch: true,
    history: [],
  },
  {
    name: 'follow-up after a short night',
    userMessage: 'What should I do tonight then?',
    expectSearch: false,
    history: [
      { sender: 'user', text: 'I only slept 4 hours and I have a long workday.' },
      { sender: 'astra', text: 'That is a short night. We can protect tonight with a simple wind-down.' },
    ],
  },
] as const;

async function main() {
  console.log('Search heuristics:');
  for (const scenario of SCENARIOS) {
    const searched = shouldSearch(scenario.userMessage);
    const mark = searched === scenario.expectSearch ? 'ok' : 'mismatch';
    console.log(`  ${mark}  ${scenario.name}: shouldSearch=${searched}`);
  }

  if (!process.env.GEMINI_API_KEY?.trim()) {
    console.log('\nSkipping live Gemini turns: GEMINI_API_KEY is not set.');
    console.log('Add it to src/.env, then re-run npm run test:coach:live.');
    return;
  }

  const { generateCoachReply } = await import('../src/server/ai.ts');
  const companionState = { stage: 'Hatchling', level: 2, streakDays: 4, mood: 'joyful' as const };
  for (const scenario of SCENARIOS) {
    process.stdout.write(`\n== ${scenario.name} ==\n`);
    const result = await generateCoachReply({
      userMessage: scenario.userMessage,
      history: [...scenario.history],
      companionState,
      language: 'sw',
      latestAnxiety: null,
    });
    console.log(`searched=${result.searched} sources=${result.sources.length}`);
    console.log(result.reply);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
