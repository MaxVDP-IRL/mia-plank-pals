import { test, eq } from './harness.js';
import { bestValue, dailySeries, dadStats, sessionValue } from '../js/logic/stats.js';
import { defaultState } from '../js/storage.js';

const S = [
  { exercise: 'plank', date: '2026-09-25', attempt: 'main', durationMs: 12000, goalMs: 10000 },
  { exercise: 'plank', date: '2026-09-26', attempt: 'main', durationMs: 9000, goalMs: 10000 },
  { exercise: 'plank', date: '2026-09-26', attempt: 'extra', durationMs: 14000, goalMs: 10000, beatBest: true },
  { exercise: 'squat', date: '2026-09-26', attempt: 'main', reps: 6, goalReps: 5 },
];

test('stats: bestValue per exercise', () => {
  eq(bestValue(S, 'plank'), 14000); eq(bestValue(S, 'squat'), 6); eq(bestValue([], 'plank'), null);
  eq(sessionValue(S[3]), 6);
});
test('stats: dailySeries length 30, oldest first, main vs best', () => {
  const d = dailySeries(S, 'plank', '2026-09-26');
  eq(d.length, 30); eq(d[29].date, '2026-09-26'); eq(d[0].date, '2026-08-28');
  eq([d[29].main, d[29].best, d[29].extraPb], [9000, 14000, true]);
  eq(d[28].main, 12000); eq(d[27].main, null);
});
test('stats: dadStats', () => {
  const st = defaultState(); st.sessions = S;
  const r = dadStats(st, '2026-09-26');
  eq(r.doubleDaysThisMonth, 1); eq(r.totalDays, 2); eq(r.plank.best, 14000); eq(r.squat.avg7, 6);
  eq(r.plank.avg7, 10500); eq(r.thisWeek, 2); eq(r.streakCurrent, 2);
});
