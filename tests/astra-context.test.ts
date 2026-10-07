import assert from 'node:assert/strict';
import type { DailySummary } from '../src/types/lifestyle';
import {
  buildAstraContextFromLogs,
  buildDailyBrief,
  localAstraReply,
  selectCoachingMode,
  seriesTrend,
  wellnessSafety,
} from '../src/lib/astraContext';

function check(name: string, fn: () => void) {
  try {
    fn();
    console.log('ok ', name);
  } catch (err) {
    console.error('FAIL', name);
    throw err;
  }
}

const emptyToday: DailySummary = {
  date: '2026-09-28',
  activeMinutes: 0,
  movementPoints: 0,
  estimatedCaloriesBurned: 0,
  nutrition: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
  mealCount: 0,
  recovery: null,
  hydrationGlasses: 0,
};

check('seriesTrend needs enough points in each calendar half', () => {
  assert.equal(seriesTrend([1, 2, 3], 0.5), undefined);
  assert.equal(seriesTrend([7, 7.2, 5, 4.8], 0.6), 'down');
  assert.equal(seriesTrend([4, 4.2, 6.5, 7], 0.6), 'up');
  assert.equal(seriesTrend([5, 5.1, 5.2, 5.15], 0.6), 'stable');
  assert.equal(seriesTrend([8, 8, null, null, null, null, 5], 0.6), undefined);
  assert.equal(seriesTrend([40, null, null, null, null, null, null], 8), undefined);
});

check('coaching modes', () => {
  assert.equal(
    selectCoachingMode({
      activeMinutes: 8,
      movementPoints: 10,
      meals: 1,
      calories: 500,
      protein: 20,
      recoveryScore: 80,
      energy: 4,
      sleepHours: 7.5,
    }).mode,
    'move'
  );
  assert.equal(
    selectCoachingMode({
      activeMinutes: 40,
      movementPoints: 40,
      meals: 0,
      calories: 0,
      protein: 0,
      recoveryScore: 78,
      energy: 4,
    }).mode,
    'eat'
  );
  assert.equal(
    selectCoachingMode({
      activeMinutes: 10,
      movementPoints: 10,
      meals: 1,
      calories: 600,
      protein: 25,
      recoveryScore: 40,
      sleepHours: 4.5,
      energy: 2,
      stress: 4,
    }).mode,
    'recover'
  );
  assert.equal(
    selectCoachingMode({
      activeMinutes: 0,
      movementPoints: 0,
      meals: 0,
      calories: 0,
      protein: 0,
    }).mode,
    'balanced'
  );
  assert.equal(
    selectCoachingMode(
      {
        activeMinutes: 50,
        movementPoints: 80,
        meals: 2,
        calories: 900,
        protein: 40,
        recoveryScore: 42,
        energy: 4,
        sleepHours: 8,
      },
      240
    ).mode,
    'recover'
  );
});

check('empty context does not invent metrics', () => {
  const ctx = buildAstraContextFromLogs({
    today: emptyToday,
    activities: [],
    meals: [],
    checks: [],
  });
  assert.equal(ctx.recommendations.mode, 'balanced');
  assert.equal(ctx.trends.insufficient, true);
  assert.match(buildDailyBrief(ctx).body, /No Uko Sawa/i);
});

check('yesterday check-in is not treated as today', () => {
  const ctx = buildAstraContextFromLogs({
    today: emptyToday,
    activities: [],
    meals: [],
    checks: [
      {
        id: 'old',
        feeling: 'tired',
        sleepHours: 4,
        energyLevel: 1,
        stressLevel: 5,
        timestamp: '2026-09-20T12:00:00',
      },
    ],
  });
  assert.equal(ctx.today.sleepHours, undefined);
  assert.equal(ctx.today.energy, undefined);
  assert.equal(ctx.today.stress, undefined);
  assert.equal(ctx.recommendations.mode, 'balanced');
});

check('safety bands', () => {
  assert.equal(wellnessSafety('How much water today?'), 'green');
  assert.equal(wellnessSafety('I feel dizzy after stairs'), 'yellow');
  assert.equal(wellnessSafety('I have chest pain and cannot breathe'), 'red');
  assert.match(localAstraReply(
    buildAstraContextFromLogs({ today: emptyToday, activities: [], meals: [], checks: [] }),
    'chest pain'
  ), /clinician/i);
});

console.log('\nAll Astra context tests passed.');
