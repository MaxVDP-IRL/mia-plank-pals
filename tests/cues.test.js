import { test, eq, ok } from './harness.js';
import { plankCuesBetween, plankVisualState, squatCuesBetween, squatCountsToSpeak, squatDepth, repsCompleted, clampCorrection } from '../js/logic/cues.js';

const types = (cs) => cs.map((c) => c.type);

test('cues plank: boop at 5 s', () => {
  eq(types(plankCuesBetween(4990, 5010, { goalMs: 30000 })), ['boop']);
  eq(types(plankCuesBetween(5010, 5100, { goalMs: 30000 })), []);
});
test('cues plank: midway at goal/2, nearGoal at goal−3 s, goal at goal', () => {
  eq(types(plankCuesBetween(7990, 8010, { goalMs: 16000 })), ['midway']);
  eq(types(plankCuesBetween(12990, 13010, { goalMs: 16000 })), ['nearGoal']);
  eq(types(plankCuesBetween(15990, 16000, { goalMs: 16000 })), ['goal']);
});
test('cues plank: no midway for tiny goals; boop suppressed when a cue fires', () => {
  eq(types(plankCuesBetween(2990, 3010, { goalMs: 6000 })), []);            // 6 s goal: no midway, near=3000 not > 3000
  eq(types(plankCuesBetween(9990, 10010, { goalMs: 10000 })), ['goal']);    // boop at 10 s is dropped
});
test('cues plank: best only when crossing above the best', () => {
  eq(types(plankCuesBetween(12000, 12050, { goalMs: 30000, bestMs: 12000 })), ['best']);
  eq(types(plankCuesBetween(12050, 12100, { goalMs: 30000, bestMs: 12000 })), []);
});
test('cues plank: a big frame jump returns every crossed cue once', () => {
  eq(types(plankCuesBetween(0, 12000, { goalMs: 10000, bestMs: 11000 })), ['midway', 'nearGoal', 'goal', 'best']);
});
test('cues plank: visual state', () => {
  eq(plankVisualState(5000, 10000, null), 'blue');
  eq(plankVisualState(10000, 10000, null), 'green');
  eq(plankVisualState(12001, 10000, 12000), 'gold');
});
test('cues squat: reps at n×beat with down after each', () => {
  const c = squatCuesBetween(2400, 2600, { beatMs: 2500, goalReps: 5, capReps: 20 });
  eq(types(c), ['rep', 'down']);
  eq(c[0].n, 1); eq(c[1].n, 2);
});
test('cues squat: twoMore / oneMore / goal / sparkle on the right reps', () => {
  const all = squatCuesBetween(0, 5 * 2500, { beatMs: 2500, goalReps: 5, capReps: 20 });
  const find = (t) => all.filter((c) => c.type === t).map((c) => c.n);
  eq(find('twoMore'), [3]); eq(find('oneMore'), [4]); eq(find('goal'), [5]); eq(find('sparkle'), [5]);
});
test('cues squat: best at bestReps+1; no down at the cap', () => {
  const all = squatCuesBetween(0, 20 * 1000, { beatMs: 1000, goalReps: 5, bestReps: 7, capReps: 20 });
  eq(all.filter((c) => c.type === 'best').map((c) => c.n), [8]);
  ok(!all.some((c) => c.type === 'down' && c.n === 21), 'no down past cap');
});
test('cues squat: squatCountsToSpeak with a 200 ms lead', () => {
  eq(squatCountsToSpeak(2200, 2310, 2500, 200), [1]);
  eq(squatCountsToSpeak(2310, 2490, 2500, 200), []);
  eq(squatCountsToSpeak(0, 5400, 2500, 200), [1, 2]);
});
test('cues squat: squatDepth and repsCompleted', () => {
  eq(squatDepth(0, 2500), 0);
  eq(squatDepth(1250, 2500), 1);
  ok(squatDepth(2499, 2500) < 0.01, 'near 0 at the end');
  eq(repsCompleted(7499, 2500), 2);
  eq(repsCompleted(7500, 2500), 3);
});
test('cues squat: clampCorrection bounds', () => {
  eq(clampCorrection(-1, 5, 20), 0);
  eq(clampCorrection(11, 5, 20), 10);
  eq(clampCorrection(25, 18, 20), 20);
  eq(clampCorrection(7, 5, 20), 7);
});
