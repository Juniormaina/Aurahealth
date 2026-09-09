import assert from 'node:assert/strict';
import { looksLikeCrisis } from '../src/content/crisisSupport';
import { coachGreeting, coachPromptChips } from '../src/content/coachCopy';
import {
  buildCoachInstruction,
  formatSearchContext,
  normalizeAnxiety,
  shouldSearch,
  toGeminiContents,
} from '../src/server/coachTurn';

function check(name: string, fn: () => void) {
  fn();
  console.log(`ok  ${name}`);
}

check('shouldSearch skips practice prompts and app talk', () => {
  assert.equal(shouldSearch('Start a 5-minute stress reset'), false);
  assert.equal(shouldSearch('Anza zoezi la dakika 5 la kupunguza msongo'), false);
  assert.equal(shouldSearch('Adapt a session to my mood'), false);
  assert.equal(shouldSearch('How do I boost my streak?'), false);
  assert.equal(shouldSearch('I feel anxious today'), false);
  assert.equal(shouldSearch('ok'), false);
});

check('shouldSearch allows factual health questions', () => {
  assert.equal(shouldSearch('How much water should an adult drink per day?'), true);
  assert.equal(shouldSearch('What is the recommended hours of sleep for adults'), true);
  assert.equal(shouldSearch('Is it safe to take melatonin every night'), true);
  assert.equal(shouldSearch('What should I do tonight then?'), false);
});

check('toGeminiContents drops greeting and starts with user', () => {
  const contents = toGeminiContents(
    [
      { sender: 'astra', kind: 'greeting', text: "Hi, I'm Astra — your AI wellness companion, not a doctor." },
      { sender: 'astra', text: "Hello! I'm Astra. Today's anxiety check-in is 7/10." },
    ],
    'Start a 5-minute stress reset'
  );
  assert.equal(contents[0].role, 'user');
  assert.equal(contents.length, 1);
  assert.equal(contents[0].parts[0].text, 'Start a 5-minute stress reset');
});

check('toGeminiContents alternates and merges same-role turns', () => {
  const contents = toGeminiContents(
    [
      { sender: 'user', text: 'I slept 4 hours' },
      { sender: 'astra', text: 'That is a short night. Want a wind-down?' },
      { sender: 'astra', text: 'We can start with breath.' },
      { sender: 'user', text: 'Yes' },
    ],
    'ready'
  );
  assert.deepEqual(
    contents.map((c) => c.role),
    ['user', 'model', 'user']
  );
  assert.match(contents[1].parts[0].text, /wind-down/);
  assert.match(contents[2].parts[0].text, /Yes\nready/);
});

check('toGeminiContents skips error bubbles', () => {
  const contents = toGeminiContents(
    [
      { sender: 'user', text: 'hello' },
      { sender: 'astra', kind: 'error', text: 'Astra AI is not configured on this server yet.' },
    ],
    'try again'
  );
  assert.equal(contents.length, 1);
  assert.match(contents[0].parts[0].text, /hello\ntry again/);
});

check('normalizeAnxiety ignores the old defaulted unknown', () => {
  assert.equal(normalizeAnxiety(null), null);
  assert.equal(normalizeAnxiety(undefined), null);
  assert.equal(normalizeAnxiety(''), null);
  assert.equal(normalizeAnxiety(7), 7);
  assert.equal(normalizeAnxiety(0), 1);
  assert.equal(normalizeAnxiety(12), 10);
});

check('buildCoachInstruction does not invent an anxiety score', () => {
  const prompt = buildCoachInstruction({
    languageName: 'Kiswahili',
    languageId: 'sw',
    hasSearch: false,
    companionState: { stage: 'Hatchling', level: 2, streakDays: 3, mood: 'joyful' },
  });
  assert.match(prompt, /No anxiety check-in yet/);
  assert.doesNotMatch(prompt, /Latest anxiety check-in \(1-10\): unknown/);
  assert.match(prompt, /Kiswahili/);
  assert.match(prompt, /Give ONLY the next step/);
});

check('formatSearchContext stays clean when there are no hits', () => {
  assert.equal(formatSearchContext('hello', []), 'hello');
});

check('crisis detector still catches Swahili and English', () => {
  assert.equal(looksLikeCrisis('I want to die'), true);
  assert.equal(looksLikeCrisis('nataka kufa'), true);
  assert.equal(looksLikeCrisis('Start a 5-minute stress reset'), false);
});

check('greeting is localized and honest about missing check-ins', () => {
  assert.match(coachGreeting('sw'), /si daktari/);
  assert.doesNotMatch(coachGreeting('sw'), /7\/10/);
  assert.match(coachGreeting('en', 4), /4\/10/);
  assert.equal(coachPromptChips('sw').length, 3);
});

console.log('\nAll AI coach tests passed.');
