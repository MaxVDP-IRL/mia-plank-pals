import { toLocalDateStr } from './dates.js';
import { nextGoalAfterMain } from './goal.js';
import { computeStreak, totalActiveDays } from './streak.js';
import { makeStickerOffer, claimSticker, computeXp, stageForXp, crossedShowOff, milestonesDue } from './rewards.js';
import { bestValue } from './stats.js';
import { REWARDS } from '../config.js';

export function attemptKindFor(sessions, exercise, date) {
  return sessions.some((s) => s.exercise === exercise && s.date === date) ? 'extra' : 'main';
}
/** Offer "One more try?" only after the main attempt and while extras remain. */
export function canTryExtra(sessions, exercise, date, R = REWARDS) {
  const n = sessions.filter((s) => s.exercise === exercise && s.date === date).length;
  return n >= 1 && n < 1 + R.maxExtraPerExercisePerDay;
}
/** Home button state per exercise: 'fresh' | 'done' (main done) | 'rested' (main + all extras done). */
export function exerciseDayState(sessions, exercise, date, R = REWARDS) {
  const n = sessions.filter((s) => s.exercise === exercise && s.date === date).length;
  return n === 0 ? 'fresh' : n < 1 + R.maxExtraPerExercisePerDay ? 'done' : 'rested';
}

/**
 * @param state  current app state (not mutated)
 * @param input  plank: { exercise:'plank', durationMs, autoFinished }
 *               squat: { exercise:'squat', reps, countedReps, beatMs, elapsedMs }
 * @param now    Date of finishing
 * @param rng    () => [0,1)
 * @returns { state, result }
 */
export function applySession(state, input, now = new Date(), rng = Math.random) {
  let s = structuredClone(state);
  const ex = input.exercise;
  const date = toLocalDateStr(now);
  const prev = s.sessions;
  const todays = prev.filter((x) => x.date === date);
  const sameExToday = todays.filter((x) => x.exercise === ex);
  const attempt = sameExToday.length === 0 ? 'main' : 'extra';
  const extraIndex = sameExToday.filter((x) => x.attempt === 'extra').length;
  const goalValue = s.settings.goals[ex].current;
  const value = ex === 'plank' ? Math.round(input.durationMs) : Math.round(input.reps);
  const prevBest = bestValue(prev, ex);                    // null if never done
  const beatGoal = value >= goalValue;
  const beatBest = prevBest !== null && value > prevBest;
  const id = 's' + now.getTime().toString(36) + Math.floor(rng() * 1e6).toString(36);

  const session = ex === 'plank'
    ? { id, exercise: 'plank', date, startedAt: new Date(now.getTime() - value).toISOString(), attempt,
        durationMs: value, goalMs: goalValue, beatGoal, beatBest, autoFinished: !!input.autoFinished }
    : { id, exercise: 'squat', date, startedAt: new Date(now.getTime() - (input.elapsedMs || 0)).toISOString(), attempt,
        reps: value, goalReps: goalValue, beatGoal, beatBest,
        countedReps: Math.round(input.countedReps ?? value), beatMs: input.beatMs };

  const firstExerciseOfDay = todays.length === 0;
  const doubleDay = attempt === 'main' && todays.some((x) => x.exercise !== ex);
  const goalBonusAvailable = !sameExToday.some((x) => x.beatGoal);
  s.sessions = [...prev, session];

  // 1) Goal (main attempts only)
  let goalChange = { change: null, from: goalValue, to: goalValue };
  if (attempt === 'main') {
    const cap = ex === 'plank' ? s.settings.plank.capMs : s.settings.squat.capReps;
    const r = nextGoalAfterMain({ ex, goal: s.settings.goals[ex], progress: s.goalProgress[ex],
      rules: s.settings.goalRules[ex], cap, beatGoal, date });
    s.settings.goals[ex] = r.goal;
    s.goalProgress[ex] = r.progress;
    goalChange = r;
  }

  // 2) Sticker: first session of the day → offer 3 cards; later PB → gold upgrade
  let stickerOffer = null;
  let stickerUpgraded = false;
  if (firstExerciseOfDay) {
    if (s.pendingStickerPick) {                            // an old unpicked offer: auto-claim its first card, never lose it
      s = claimSticker(s, s.pendingStickerPick.choices[0]).state;
    }
    const offer = makeStickerOffer(s.stickers, rng);
    s.pendingStickerPick = { date, ...offer, gold: beatBest };
    stickerOffer = s.pendingStickerPick;
  } else if (beatBest) {
    if (s.pendingStickerPick && s.pendingStickerPick.date === date) { s.pendingStickerPick.gold = true; stickerUpgraded = true; }
    else {
      const t = s.stickers.find((x) => x.date === date);
      if (t && !t.gold) { t.gold = true; stickerUpgraded = true; }
    }
  }

  // 3) Milestones on total exercise days
  const totalDays = totalActiveDays(s.sessions);
  const newMilestones = milestonesDue(totalDays, s.milestones);
  for (const mid of newMilestones) s.milestones.push({ id: mid, date });

  // 4) Treats & Pup
  const xpBefore = s.pet.xp;
  const xpGained = computeXp({ attempt, extraIndex, firstExerciseOfDay, doubleDay, beatGoal, goalBonusAvailable, beatBest });
  s.pet.xp = xpBefore + xpGained;
  const stageBefore = stageForXp(xpBefore);
  const stageAfter = stageForXp(s.pet.xp);

  const bigMoments = [];
  if (stageAfter.index > stageBefore.index) bigMoments.push({ type: 'stageUp', stage: stageAfter.index });
  for (const mid of newMilestones) bigMoments.push({ type: 'milestone', id: mid });

  const result = {
    session, exercise: ex, attempt, value, goalValue, prevBest,
    firstEver: prevBest === null,
    beatGoal, beatBest,
    tier: beatBest ? 2 : beatGoal ? 1 : 0,                 // highest of tiers 0–2 (03 §3.4)
    doubleDay,
    goalChange,                                            // {change:'raised'|'lowered'|null, from, to}
    stickerOffer,                                          // non-null → show the 3 face-down cards
    stickerUpgraded,                                       // today's sticker turned gold
    newMilestones,
    xpGained, xpTotal: s.pet.xp, stageBefore, stageAfter,
    grew: stageAfter.index > stageBefore.index,
    showOff: crossedShowOff(xpBefore, s.pet.xp),
    bigMoments,                                            // candidates; Celebrate adds page/book-full after the pick
    canTryExtra: canTryExtra(s.sessions, ex, date),
    streak: computeStreak(s.sessions.map((x) => x.date), date),
    totalDays,
  };
  return { state: s, result };
}
