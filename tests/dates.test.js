import { test, eq } from './harness.js';
import { toLocalDateStr, parseLocalDateStr, isValidDateStr, daysBetween, addDays, weekStart } from '../js/logic/dates.js';

test('dates: toLocalDateStr uses local fields (23:30 stays the same day)', () => {
  eq(toLocalDateStr(new Date(2026, 8, 26, 23, 30)), '2026-09-26');
  eq(toLocalDateStr(new Date(2026, 0, 1, 0, 5)), '2026-01-01');
});
test('dates: parseLocalDateStr round-trips', () => {
  eq(toLocalDateStr(parseLocalDateStr('2026-12-31')), '2026-12-31');
});
test('dates: daysBetween across DST changes', () => {
  eq(daysBetween('2026-03-28', '2026-03-30'), 2);
  eq(daysBetween('2026-10-24', '2026-10-26'), 2);
  eq(daysBetween('2026-09-26', '2026-09-26'), 0);
  eq(daysBetween('2026-09-27', '2026-09-26'), -1);
});
test('dates: addDays over month and year ends', () => {
  eq(addDays('2026-01-31', 1), '2026-02-01');
  eq(addDays('2026-12-31', 1), '2027-01-01');
  eq(addDays('2026-03-01', -1), '2026-02-28');
  eq(addDays('2028-03-01', -1), '2028-02-29');
});
test('dates: isValidDateStr', () => {
  eq(isValidDateStr('2026-02-30'), false);
  eq(isValidDateStr('2026-02-28'), true);
  eq(isValidDateStr('2026-9-1'), false);
  eq(isValidDateStr(null), false);
});
test('dates: weekStart is Monday', () => {
  eq(weekStart('2026-09-27'), '2026-09-21');   // Sunday → Monday before
  eq(weekStart('2026-09-21'), '2026-09-21');   // Monday
  eq(weekStart('2026-09-26'), '2026-09-21');   // Saturday
});
