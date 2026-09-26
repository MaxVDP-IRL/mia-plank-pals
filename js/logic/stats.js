import { addDays, weekStart } from './dates.js';
import { computeStreak, activeDates } from './streak.js';

export const sessionValue = (s) => (s.exercise === 'plank' ? s.durationMs : s.reps);
export const sessionGoal  = (s) => (s.exercise === 'plank' ? s.goalMs : s.goalReps);

export function bestValue(sessions, ex) {
  let best = null;
  for (const s of sessions) if (s.exercise === ex && (best === null || sessionValue(s) > best)) best = sessionValue(s);
  return best;
}
/** For the Parent Corner 30-day charts. One entry per day, oldest first. */
export function dailySeries(sessions, ex, todayStr, days = 30) {
  const byDate = new Map();
  for (const s of sessions) {
    if (s.exercise !== ex) continue;
    const e = byDate.get(s.date) || { main: null, best: null, goal: null, extraPb: false };
    const v = sessionValue(s);
    if (s.attempt === 'main') { e.main = v; e.goal = sessionGoal(s); }
    if (e.best === null || v > e.best) e.best = v;
    if (s.attempt === 'extra' && s.beatBest) e.extraPb = true;
    byDate.set(s.date, e);
  }
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(todayStr, i - (days - 1));
    return { date, ...(byDate.get(date) || { main: null, best: null, goal: null, extraPb: false }) };
  });
}
/** Numbers for Parent Corner (03 §7). */
export function dadStats(state, todayStr) {
  const S = state.sessions;
  const streak = computeStreak(S.map((s) => s.date), todayStr);
  const act = activeDates(S);
  const month = todayStr.slice(0, 7);
  const doubleDaysThisMonth = [...act].filter(([d, a]) => d.startsWith(month) && a.plank && a.squat).length;
  const mon = weekStart(todayStr);
  const thisWeek = [...act.keys()].filter((d) => d >= mon && d <= todayStr).length;
  const avg7 = (ex) => {
    const vals = dailySeries(S, ex, todayStr, 7).map((d) => d.main).filter((v) => v !== null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  };
  const daysThisMonth = (ex) => [...act].filter(([d, a]) => d.startsWith(month) && a[ex]).length;
  return {
    totalDays: act.size, thisWeek, streakCurrent: streak.current, streakBest: streak.best, doubleDaysThisMonth,
    plank: { best: bestValue(S, 'plank'), goal: state.settings.goals.plank.current, avg7: avg7('plank'), month: daysThisMonth('plank') },
    squat: { best: bestValue(S, 'squat'), goal: state.settings.goals.squat.current, avg7: avg7('squat'), month: daysThisMonth('squat') },
  };
}
