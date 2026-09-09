import path from 'node:path';
import dotenv from 'dotenv';
import { shouldSearch } from '../src/server/coachTurn';
import { generateCoachReply, hasGeminiKey } from '../src/server/ai';

dotenv.config({ path: path.join(process.cwd(), 'src', '.env') });
dotenv.config();

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
  if (!hasGeminiKey()) {
    console.log('Skipping live Gemini turns: GEMINI_API_KEY is not set.');
    console.log('Unit heuristics:');
    for (const scenario of SCENARIOS) {
      const searched = shouldSearch(scenario.userMessage);
      const mark = searched === scenario.expectSearch ? 'ok' : 'mismatch';
      console.log(`  ${mark}  ${scenario.name}: shouldSearch=${searched}`);
    }
    process.exit(0);
  }

  const companionState = { stage: 'Hatchling', level: 2, streakDays: 4, mood: 'joyful' as const };
  for (const scenario of SCENARIOS) {
    process.stdout.write(`\n== ${scenario.name} ==\n`);
    const searched = shouldSearch(scenario.userMessage);
    console.log(`shouldSearch=${searched} (expected ${scenario.expectSearch})`);
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
