import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  setLogLevel,
  updateDoc,
} from 'firebase/firestore';

const PROJECT_ID = 'demo-aurahealth';
const RULES = readFileSync(resolve('firestore.rules'), 'utf8');

function freshUser(uid: string) {
  return {
    uid,
    email: `${uid}@example.com`,
    displayName: uid,
    photoURL: '',
    cowriesBalance: 0,
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCheckInDate: null as string | null,
    completedRewardKeys: [] as string[],
    habitClaims: {} as Record<string, string>,
  };
}

function companion(uid: string) {
  return {
    uid,
    tokenId: 1,
    name: 'Astra',
    stage: 'Egg',
    level: 1,
    xp: 0,
    xpToNextLevel: 500,
    health: 100,
    vitality: 100,
    harmony: 100,
    mood: 'joyful',
    streakDays: 0,
    totalCheckIns: 0,
    imageUrl: 'https://example.com/astra.png',
    element: 'Aether',
    equippedCosmetics: [] as string[],
  };
}

function healthLog(uid: string) {
  return {
    uid,
    id: 'chk-1',
    timestamp: '2026-08-31',
    type: 'daily_full',
    waterLiters: 2,
    sleepHours: 7,
    medicationTaken: true,
    moodRating: 4,
    anxietyLevel: 5,
    activityMinutes: 30,
    notes: 'ok',
    cowriesEarned: 80,
    xpEarned: 150,
    aiAttestationScore: 90,
  };
}

let failed = 0;

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`ok    ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL  ${name}`);
    console.error(err);
  }
}

async function main() {
  setLogLevel('error');
  const host = process.env.FIRESTORE_EMULATOR_HOST?.split(':')[0] || '127.0.0.1';
  const port = Number(process.env.FIRESTORE_EMULATOR_HOST?.split(':')[1] || 8080);

  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: RULES, host, port },
  });

  try {
    await testEnv.clearFirestore();

    await check('unauthenticated cannot read a user doc', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(db, 'users', 'alice')));
    });

    await check('owner can create a zeroed user profile', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertSucceeds(setDoc(doc(db, 'users', 'alice'), freshUser('alice')));
    });

    await check('owner cannot create a user profile with Cowries', async () => {
      const db = testEnv.authenticatedContext('bob').firestore();
      await assertFails(setDoc(doc(db, 'users', 'bob'), { ...freshUser('bob'), cowriesBalance: 50 }));
    });

    await check('owner cannot mint Cowries on update', async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), 'users', 'carol'), {
          ...freshUser('carol'),
          cowriesBalance: 40,
          totalXp: 10,
        });
      });
      const db = testEnv.authenticatedContext('carol').firestore();
      await assertFails(updateDoc(doc(db, 'users', 'carol'), { cowriesBalance: 999999 }));
      await assertSucceeds(updateDoc(doc(db, 'users', 'carol'), { displayName: 'Carol' }));
    });

    await check('owner cannot change uid or delete the user doc', async () => {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), 'users', 'dave'), freshUser('dave'));
      });
      const db = testEnv.authenticatedContext('dave').firestore();
      await assertFails(updateDoc(doc(db, 'users', 'dave'), { uid: 'eve' }));
      await assertFails(deleteDoc(doc(db, 'users', 'dave')));
    });

    await check('another user cannot read a profile', async () => {
      const db = testEnv.authenticatedContext('eve').firestore();
      await assertFails(getDoc(doc(db, 'users', 'alice')));
    });

    await check('health log create requires own uid', async () => {
      const alice = testEnv.authenticatedContext('alice').firestore();
      await assertSucceeds(addDoc(collection(alice, 'healthLogs'), healthLog('alice')));
      await assertFails(addDoc(collection(alice, 'healthLogs'), healthLog('eve')));
    });

    await check('health log uid cannot be rewritten', async () => {
      let logId = '';
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const ref = await addDoc(collection(ctx.firestore(), 'healthLogs'), healthLog('alice'));
        logId = ref.id;
      });
      const alice = testEnv.authenticatedContext('alice').firestore();
      await assertFails(updateDoc(doc(alice, 'healthLogs', logId), { uid: 'eve' }));
      await assertFails(updateDoc(doc(alice, 'healthLogs', logId), { aiAttestationScore: 100 }));
      await assertFails(deleteDoc(doc(alice, 'healthLogs', logId)));
      const eve = testEnv.authenticatedContext('eve').firestore();
      await assertFails(getDoc(doc(eve, 'healthLogs', logId)));
    });

    await check('owner can write companion; stranger cannot; delete denied', async () => {
      const alice = testEnv.authenticatedContext('alice').firestore();
      await assertSucceeds(setDoc(doc(alice, 'companion', 'alice'), companion('alice')));
      await assertFails(deleteDoc(doc(alice, 'companion', 'alice')));
      const eve = testEnv.authenticatedContext('eve').firestore();
      await assertFails(setDoc(doc(eve, 'companion', 'alice'), companion('alice')));
    });
  } finally {
    await testEnv.cleanup();
  }

  if (failed) {
    console.error(`${failed} Firestore rules check(s) failed.`);
    process.exit(1);
  }
  console.log('Firestore rules checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
