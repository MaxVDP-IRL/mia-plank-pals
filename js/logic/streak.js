import { daysBetween, addDays, weekStart, isValidDateStr } from './dates.js';
import { STREAK } from '../config.js';

/** Map date → { plank: bool, squat: bool } */
export function activeDates(sessions) {
  const m = new Map();
  for (const s of sessions) {
    const e = m.get(s.date) || { plank: false, squat: false };
    e[s.exercise] = true;
    m.set(s.date, e);
  }
  return m;
}
export const totalActiveDays = (sessions) => activeDates(sessions).size;

/** Dad-only streak numbers. ONE function, all the rules. */
export function computeStreak(dates, todayStr, rules = STREAK) {
  const days = [...new Set(dates)].filter(isValidDateStr).sort();
  if (days.length === 0) return { current: 0, best: 0, totalDays: 0, activeToday: false, daysSinceLast: null };
  const maxGap = rules.restDaysAllowed + 1;             // 1 = consecutive days; 2 = one rest day allowed
  let run = 1, best = 1;
  for (let i = 1; i < days.length; i++) {
    run = daysBetween(days[i - 1], days[i]) <= maxGap ? run + 1 : 1;
    if (run > best) best = run;
  }
  const daysSinceLast = Math.max(0, daysBetween(days[days.length - 1], todayStr)); // clock set back → 0
  const alive = daysSinceLast <= maxGap;
  return { current: alive ? run : 0, best, totalDays: days.length, activeToday: daysSinceLast === 0, daysSinceLast };
}

/** 7 circles Mon..Sun for the week containing today. paws: 0, 1 or 2 (double day). */
export function weekPaws(sessions, todayStr, rules = STREAK) {
  const act = activeDates(sessions);
  const mon = weekStart(todayStr, rules.weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(mon, i);
    const a = act.get(date);
    const paws = a ? (a.plank && a.squat ? 2 : 1) : 0;
    return { date, paws, isToday: date === todayStr, isFuture: daysBetween(todayStr, date) > 0 };
  });
}
/** Monday dates of weeks with ≥ starWeekMinDays exercise days (double days count once). */
export function starWeeks(sessions, rules = STREAK) {
  const perWeek = new Map();
  for (const date of activeDates(sessions).keys()) {
    const w = weekStart(date, rules.weekStartsOn);
    perWeek.set(w, (perWeek.get(w) || 0) + 1);
  }
  return [...perWeek].filter(([, n]) => n >= rules.starWeekMinDays).map(([w]) => w).sort();
}
