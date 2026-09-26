// All app dates are LOCAL calendar dates as 'YYYY-MM-DD'.
export function toLocalDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
// Parse at local NOON so DST shifts (±1 h) can never move the date.
export function parseLocalDateStr(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}
export function isValidDateStr(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return toLocalDateStr(parseLocalDateStr(s)) === s;          // rejects 2026-02-30
}
/** Whole days from a to b (b - a). Same day = 0, yesterday→today = 1. */
export function daysBetween(a, b) {
  return Math.round((parseLocalDateStr(b) - parseLocalDateStr(a)) / 86400000);
}
export function addDays(s, n) {
  const d = parseLocalDateStr(s);
  d.setDate(d.getDate() + n);
  return toLocalDateStr(d);
}
/** Monday (weekStartsOn=1) of the week containing s. */
export function weekStart(s, weekStartsOn = 1) {
  const dow = parseLocalDateStr(s).getDay();                   // 0=Sun..6=Sat
  const back = (dow - weekStartsOn + 7) % 7;
  return addDays(s, -back);
}
