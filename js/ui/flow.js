// Glue shared by screens: starting an exercise, saving, and Pup talking.
import { unlockAudio } from '../platform/audio.js';
import { unlockSpeech, say } from '../platform/speech.js';
import { acquireWakeLock } from '../platform/wakelock.js';
import { requestPersistence } from '../platform/device.js';
import { app, getState, setState } from '../store.js';
import { go, currentRoute } from '../router.js';
import { pickLine, fill } from '../strings.js';
import { applySession } from '../logic/session.js';
import { UI } from '../config.js';

export function startExercise(exercise, attempt = 'main') {   // from the Home buttons and "One more try?"
  unlockAudio(); unlockSpeech();                              // MUST run inside the click handler
  acquireWakeLock();                                           // keep the screen on through tips + countdown
  app.request = { exercise, attempt };
  go(exercise === 'plank' ? 'plank' : 'squats');
}
export function saveAndCelebrate(input) {
  const { state, result } = applySession(getState(), input, new Date());
  setState(state);
  if (state.sessions.length === 1) requestPersistence();
  app.lastResult = result;
  go('celebrate', { replace: true });                          // back swipe can't return to a finished timer
}

export function lineVars(extra = {}) {
  const st = getState();
  return { name: st.settings.childName || 'friend', pup: st.settings.petName || 'Pup', ...extra };
}
/** Picks a random line (no immediate repeat), shows it in Pup's bubble and says it. Returns the text. */
export function speakLine(category, vars = {}, opts = {}) {
  const text = pickLine(category, lineVars(vars));
  if (!text) return '';
  if (!opts.silentBubble) showBubble(text, opts.host);
  if (!opts.bubbleOnly) say(text);
  return text;
}
/** Say an exact text (already filled). */
export function speakText(text, opts = {}) {
  if (!opts.silentBubble) showBubble(text, opts.host);
  if (!opts.bubbleOnly) say(text);
}
export const fillVars = (template, extra) => fill(template, lineVars(extra));

let bubbleTimer = 0;
/** Writes text into the visible screen's Pup bubble (01 §3.5). */
export function showBubble(text, host) {
  const route = currentRoute();
  const screen = route && document.getElementById('screen-' + route);
  const target = host || (screen && [...screen.querySelectorAll('[data-bubble]')].find((n) => n.offsetParent !== null));
  document.querySelectorAll('.bubble:not(.bubble-free)').forEach((b) => b.remove());
  clearTimeout(bubbleTimer);
  if (!target) return;
  const b = document.createElement('div');
  b.className = 'bubble';
  b.setAttribute('role', 'status');
  b.textContent = text;
  target.appendChild(b);
  const ms = text.length * UI.bubbleMsPerChar + UI.bubbleExtraMs + 600;
  bubbleTimer = setTimeout(() => { b.classList.add('is-leaving'); setTimeout(() => b.remove(), 220); }, ms);
}
export function hideBubbles() {
  clearTimeout(bubbleTimer);
  document.querySelectorAll('.bubble:not(.bubble-free)').forEach((b) => b.remove());
}
