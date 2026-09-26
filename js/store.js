import { loadState, saveState } from './storage.js';

let state = null;

// Session-only context (never saved)
export const app = {
  request: null,        // { exercise: 'plank'|'squat', attempt: 'main'|'extra' } set by the Start tap
  lastResult: null,     // result object from applySession(), consumed by Celebrate
  parentUntil: 0,       // performance.now() until which Parent Corner is unlocked
  updateReady: false,   // a new service worker took over; reload at the next Home visit
  loadStatus: 'new',
};

export function initStore() {
  const r = loadState();
  state = r.state;
  app.loadStatus = r.status;
  return r;
}
export function getState() { return state; }
export function setState(next) {
  state = next;
  const ok = saveState(next);
  if (!ok) document.dispatchEvent(new CustomEvent('storage-failed'));
  return ok;
}
/** Convenience: update(s => { s.settings.soundOn = false; }) */
export function update(mutator) {
  const draft = structuredClone(state);
  mutator(draft);
  return setState(draft);
}
