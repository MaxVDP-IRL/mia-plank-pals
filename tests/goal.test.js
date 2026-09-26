import { test, eq } from './harness.js';
import { nextGoalAfterMain, setGoalManually, stepFor, clampGoal } from '../js/logic/goal.js';
import { defaultState } from '../js/storage.js';

const rules = { raiseAfterHits: 3, lowerAfterMisses: 0 };
function runSeq(ex, start, cap, results, r = rules, mode = 'auto') {
  let goal = { mode, current: start }, progress = { hits: 0, misses: 0, lastChangedDate: null };
  const changes = [];
  for (const beatGoal of results) {
    const out = nextGoalAfterMain({ ex, goal, progress, rules: r, cap, beatGoal, date: '2026-09-26' });
    goal = out.goal; progress = out.progress; changes.push(out.change);
  }
  return { goal, progress, changes };
}

test('goal plank: 3 hits → 10 s to 12 s; counters reset', () => {
  const r = runSeq('plank', 10000, 60000, [true, true, true]);
  eq(r.goal.current, 12000); eq(r.progress.hits, 0); eq(r.changes, [null, null, 'raised']);
});
test('goal plank: hits need not be consecutive (misses in between)', () => {
  eq(runSeq('plank', 10000, 60000, [true, false, true, false, true]).goal.current, 12000);
});
test('goal plank: +3 s once at or above 30 s', () => {
  eq(runSeq('plank', 30000, 60000, [true, true, true]).goal.current, 33000);
  eq(runSeq('plank', 28000, 60000, [true, true, true]).goal.current, 30000);
});
test('goal plank: never above the cap', () => {
  eq(runSeq('plank', 59000, 60000, [true, true, true]).goal.current, 60000);
  eq(runSeq('plank', 60000, 60000, [true, true, true]).changes, [null, null, null]);
});
test('goal: misses never lower when lowerAfterMisses = 0', () => {
  eq(runSeq('plank', 20000, 60000, [false, false, false, false, false]).goal.current, 20000);
});
test('goal: with lowerAfterMisses = 3 → −2 s, min 5 s', () => {
  const r2 = { raiseAfterHits: 3, lowerAfterMisses: 3 };
  eq(runSeq('plank', 12000, 60000, [false, false, false], r2).goal.current, 10000);
  eq(runSeq('plank', 6000, 60000, [false, false, false], r2).goal.current, 5000);
});
test('goal: manual mode never changes', () => {
  eq(runSeq('plank', 10000, 60000, [true, true, true, true], rules, 'manual').goal.current, 10000);
});
test('goal squats: 5 → 6 after 3 hits, cap 20', () => {
  eq(runSeq('squat', 5, 20, [true, true, true]).goal.current, 6);
  eq(runSeq('squat', 20, 20, [true, true, true]).goal.current, 20);
});
test('goal: stepFor and clampGoal', () => {
  eq(stepFor(10000, [{ below: 30000, step: 2000 }, { below: null, step: 3000 }]), 2000);
  eq(clampGoal('plank', 12345, 60000), 12000);
  eq(clampGoal('plank', 1000, 60000), 5000);
  eq(clampGoal('squat', 40, 20), 20);
  eq(clampGoal('squat', 1, 20), 3);
});
test('goal: setGoalManually clamps and resets counters', () => {
  const s = defaultState();
  s.goalProgress.plank.hits = 2;
  const out = setGoalManually(s, 'plank', 99000, 'manual', '2026-09-26');
  eq(out.settings.goals.plank, { mode: 'manual', current: 60000 });
  eq(out.goalProgress.plank, { hits: 0, misses: 0, lastChangedDate: '2026-09-26' });
  eq(s.goalProgress.plank.hits, 2, 'input not mutated');
});
