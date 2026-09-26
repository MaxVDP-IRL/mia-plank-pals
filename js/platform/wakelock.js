export const wakeLockSupported = 'wakeLock' in navigator;
let sentinel = null;
let wanted = false;
export let lastWakeLockError = null;
export let lastWakeLockOk = false;

export async function acquireWakeLock() {
  wanted = true;
  if (!wakeLockSupported || sentinel) return !!sentinel;
  try {
    const s = await navigator.wakeLock.request('screen');
    if (!wanted) { s.release().catch(() => {}); return false; }   // released while the request was pending
    sentinel = s;
    lastWakeLockOk = true;
    s.addEventListener('release', () => { if (sentinel === s) sentinel = null; });
    return true;
  } catch (err) {
    lastWakeLockError = String(err && err.name || err);
    return false;
  }
}
export async function releaseWakeLock() {
  wanted = false;
  const s = sentinel; sentinel = null;
  if (s) { try { await s.release(); } catch { /* already released */ } }
}
// iOS releases the lock when the page is hidden; re-acquire if we still want it.
document.addEventListener('visibilitychange', () => {
  if (wanted && document.visibilityState === 'visible' && !sentinel) acquireWakeLock();
});
