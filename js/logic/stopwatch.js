// Pure: `now` is injected (performance.now in the app, a fake clock in tests).
export function createStopwatch(now = () => performance.now()) {
  let startT = null;
  let stoppedAt = null;       // elapsed ms when stopped
  return {
    start() { if (startT === null) { startT = now(); stoppedAt = null; } },
    /** Stops (idempotent) and returns the elapsed ms. `atT` lets a caller stop at a past timestamp. */
    stop(atT = now()) {
      if (startT === null) return 0;
      if (stoppedAt === null) stoppedAt = Math.max(0, atT - startT);
      return stoppedAt;
    },
    elapsed() {
      if (startT === null) return 0;
      return stoppedAt !== null ? stoppedAt : Math.max(0, now() - startT);
    },
    get running() { return startT !== null && stoppedAt === null; },
    reset() { startT = null; stoppedAt = null; },
  };
}
