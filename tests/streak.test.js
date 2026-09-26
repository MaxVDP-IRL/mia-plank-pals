import { test, eq } from './harness.js';
import { computeStreak, weekPaws, starWeeks, totalActiveDays } from '../js/logic/streak.js';

test('streak: consecutive days', () => {
  eq(computeStreak(['2026-09-24', '2026-09-25', '2026-09-26'], '2026-09-26').current, 3);
});
test('streak: one rest day keeps it alive', () => {
  eq(computeStreak(['2026-09-22', '2026-09-24', '2026-09-26'], '2026-09-26').current, 3);
});
test('streak: two missed days start a new run', () => {
  const r = computeStreak(['2026-09-20', '2026-09-21', '2026-09-24'], '2026-09-24');
  eq([r.current, r.best], [1, 2]);
});
test('streak: yesterday still alive, 3 days ago dead', () => {
  eq(computeStreak(['2026-09-25'], '2026-09-26').current, 1);
  eq(computeStreak(['2026-09-23'], '2026-09-26').current, 0);
});
test('streak: empty and duplicates', () => {
  eq(computeStreak([], '2026-09-26').current, 0);
  eq(computeStreak(['2026-09-26', '2026-09-26'], '2026-09-26').totalDays, 1);
  eq(computeStreak(['2026-09-20'], '2026-09-26').daysSinceLast, 6);
});
test('weekPaws: Mon-Sun with a double day', () => {
  const S = [{ date: '2026-09-21', exercise: 'plank' }, { date: '2026-09-21', exercise: 'squat' }, { date: '2026-09-23', exercise: 'squat' }];
  eq(weekPaws(S, '2026-09-26').map((d) => d.paws), [2, 0, 1, 0, 0, 0, 0]);   // 2026-09-21 is a Monday
  eq(weekPaws(S, '2026-09-26').map((d) => d.isToday), [false, false, false, false, false, true, false]);
  eq(weekPaws(S, '2026-09-26')[6].isFuture, true);
});
test('starWeeks: 5+ days in a week; double days count once', () => {
  const S = ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25']
    .flatMap((d) => [{ date: d, exercise: 'plank' }, { date: d, exercise: 'squat' }]);
  eq(starWeeks(S), ['2026-09-21']);
  eq(starWeeks(S.slice(0, 8)), []);
  eq(totalActiveDays(S), 5);
});
