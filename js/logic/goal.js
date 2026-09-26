import { EXERCISES, GOAL_POLICY } from '../config.js';

export function stepFor(current, steps) {
  const s = steps.find((x) => x.below === null || current < x.below);
  return s.step;
}
export function clampGoal(ex, value, cap, E = EXERCISES) {
  const c = E[ex];
  return Math.min(cap, Math.max(c.minGoal, Math.round(value / c.goalRoundTo) * c.goalRoundTo));
}
/**
 * Call ONLY for MAIN attempts.
 * @returns {goal, progress, change: 'raised'|'lowered'|null, from, to}
 */
export function nextGoalAfterMain({ ex, goal, progress, rules, cap, beatGoal, date }, E = EXERCISES, P = GOAL_POLICY) {
  const c = E[ex];
  const from = goal.current;
  let hits = progress.hits;
  let misses = progress.misses;
  if (beatGoal) { hits += 1; misses = 0; }
  else { misses += 1; if (P.hitsMustBeConsecutive) hits = 0; }
  const same = { goal: { ...goal }, progress: { ...progress, hits, misses }, change: null, from, to: from };
  if (goal.mode !== 'auto') return same;

  if (beatGoal && hits >= rules.raiseAfterHits && from < cap) {
    const to = Math.min(cap, from + stepFor(from, c.goalSteps));
    return { goal: { ...goal, current: to }, progress: { hits: 0, misses: 0, lastChangedDate: date }, change: 'raised', from, to };
  }
  if (!beatGoal && rules.lowerAfterMisses > 0 && misses >= rules.lowerAfterMisses && from > c.minGoal) {
    const to = Math.max(c.minGoal, from - c.lowerBy);
    return { goal: { ...goal, current: to }, progress: { hits: 0, misses: 0, lastChangedDate: date }, change: 'lowered', from, to };
  }
  return same;
}
/** Parent override. mode 'manual' freezes the goal; 'auto' lets it grow again from this value. Resets counters. */
export function setGoalManually(state, ex, value, mode, date) {
  const s = structuredClone(state);
  const cap = ex === 'plank' ? s.settings.plank.capMs : s.settings.squat.capReps;
  s.settings.goals[ex] = { mode, current: clampGoal(ex, value, cap) };
  s.goalProgress[ex] = { hits: 0, misses: 0, lastChangedDate: date };
  return s;
}
