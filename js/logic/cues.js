import { TIMING } from '../config.js';

/** Plank cues crossed in (prevMs, nowMs]. Returns [{type}] in order.
 *  types: 'boop' | 'midway' | 'nearGoal' | 'goal' | 'best'. 'boop' is dropped if another cue fires in the same call. */
export function plankCuesBetween(prevMs, nowMs, { goalMs, bestMs = null }, T = TIMING.plank) {
  const crossed = (t) => t > 0 && prevMs < t && nowMs >= t;
  const cues = [];
  if (goalMs >= T.midwayMinGoalMs && crossed(goalMs / 2)) cues.push({ type: 'midway' });
  const near = goalMs - T.nearGoalLeadMs;
  if (near > goalMs / 2 && crossed(near)) cues.push({ type: 'nearGoal' });
  if (crossed(goalMs)) cues.push({ type: 'goal' });
  if (bestMs !== null && prevMs <= bestMs && nowMs > bestMs) cues.push({ type: 'best' });
  if (cues.length === 0 && Math.floor(nowMs / T.boopEveryMs) > Math.floor(Math.max(0, prevMs) / T.boopEveryMs)) {
    cues.push({ type: 'boop' });
  }
  return cues;
}
/** Background colour state for the Plank screen (03 §1): 'blue' → 'green' at goal → 'gold' at a new PB. */
export function plankVisualState(ms, goalMs, bestMs = null) {
  if (bestMs !== null && ms > bestMs) return 'gold';
  if (ms >= goalMs) return 'green';
  return 'blue';
}

/** Squat-along cues crossed in (prevMs, nowMs]. A rep n COMPLETES at t = n*beatMs (on the "up").
 *  types: 'rep' | 'twoMore' | 'oneMore' | 'goal' | 'best' | 'sparkle' | 'down' (next rep starts: low boop). */
export function squatCuesBetween(prevMs, nowMs, { beatMs, goalReps, bestReps = null, capReps }, T = TIMING.squat) {
  const cues = [];
  const from = Math.floor(Math.max(0, prevMs) / beatMs);
  const to = Math.floor(nowMs / beatMs);
  for (let n = from + 1; n <= to; n++) {
    cues.push({ type: 'rep', n });
    if (n === goalReps) cues.push({ type: 'goal', n });
    else if (n === goalReps - 1) cues.push({ type: 'oneMore', n });
    else if (n === goalReps - 2) cues.push({ type: 'twoMore', n });
    if (bestReps !== null && n === bestReps + 1) cues.push({ type: 'best', n });
    if (T.sparkleEvery && n % T.sparkleEvery === 0) cues.push({ type: 'sparkle', n });
    if (n < capReps) cues.push({ type: 'down', n: n + 1 });
  }
  return cues;
}
/** Numbers to SPEAK in (prevMs, nowMs], triggered leadMs before the rep completes. */
export function squatCountsToSpeak(prevMs, nowMs, beatMs, leadMs = TIMING.squat.speechLeadMs) {
  const out = [];
  const first = Math.floor((Math.max(0, prevMs) + leadMs) / beatMs) + 1;
  for (let n = first; n * beatMs - leadMs <= nowMs; n++) {
    if (n * beatMs - leadMs > prevMs) out.push(n);
  }
  return out;
}
/** Pup's squat depth 0 (standing) … 1 (sitting) at a moment. Tested helper only (the art uses a CSS loop). */
export function squatDepth(elapsedMs, beatMs, T = TIMING.squat) {
  const p = (elapsedMs % beatMs) / beatMs;
  const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
  const down = T.downFraction, hold = T.holdFraction;
  if (p < down) return ease(p / down);
  if (p < down + hold) return 1;
  return 1 - ease((p - down - hold) / (1 - down - hold));
}
export const repsCompleted = (elapsedMs, beatMs) => Math.floor(elapsedMs / beatMs);

/** Squat count-check bounds: 0 … min(cap, counted + maxCorrectionAbove). */
export function clampCorrection(value, counted, cap, T = TIMING.squat) {
  return Math.max(0, Math.min(value, cap, counted + T.maxCorrectionAbove));
}
