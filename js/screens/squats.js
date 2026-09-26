// Squats screen: tips → countdown → Squat-along (Pup keeps the beat, the app counts) → tap to finish → count check.
import { TIMING } from '../config.js';
import { createStopwatch } from '../logic/stopwatch.js';
import { squatCuesBetween, squatCountsToSpeak, repsCompleted, clampCorrection } from '../logic/cues.js';
import { bestValue } from '../logic/stats.js';
import { getState, update, app } from '../store.js';
import { go } from '../router.js';
import { acquireWakeLock, releaseWakeLock } from '../platform/wakelock.js';
import { sounds } from '../platform/audio.js';
import { say, speechSupported, stopSpeech } from '../platform/speech.js';
import { speakLine, saveAndCelebrate, hideBubbles, lineVars } from '../ui/flow.js';
import { createShell } from '../ui/exercise.js';
import { mountPup, stageNumForXp, startSquatAnimation, stopSquatAnimation } from '../ui/pup.js';
import { confettiBurst } from '../ui/fx.js';
import { pickLine, numberWord } from '../strings.js';
import { $, retrigger } from '../ui/dom.js';

const sq = { phase: 'idle', rafId: 0, sw: null, stopArmedAt: 0, lastMs: 0, beatMs: 2500, goal: 5, best: null, cap: 20,
             counted: 0, value: 0, elapsedMs: 0, speakCounts: true, speechOn: true, color: null };
let section, shell, countEl, checkEl, ringFill, ringC = 0, runPup = null, shadow;

function stage() { return stageNumForXp(getState().pet.xp); }
const line = (cat, extra) => pickLine(cat, lineVars(extra));

function setupRing() {
  ringFill = $('.ring-fill', section);
  ringC = 2 * Math.PI * Number(ringFill.getAttribute('r'));
  ringFill.style.strokeDasharray = ringC;
  setRing(0);
}
function setRing(n) { ringFill.style.strokeDashoffset = ringC * (1 - Math.min(n / sq.goal, 1)); }
function setColor(c) {
  if (c === sq.color) return;
  sq.color = c;
  shell.setColor(c);
}

export function beginIntro(withTips, firstTime = false) {
  const st = getState();
  sq.beatMs = st.settings.squat.beatMs;
  sq.goal = st.settings.goals.squat.current;
  sq.best = bestValue(st.sessions, 'squat');
  sq.cap = st.settings.squat.capReps;
  sq.speechOn = st.settings.speechOn && speechSupported;
  sq.speakCounts = sq.speechOn && st.settings.squat.countAloud && sq.beatMs >= TIMING.squat.speechMinBeatMs;
  sq.phase = 'countdown';
  acquireWakeLock();
  mountPup($('[data-pup-cd]', section), stage(), 'idle');
  shell.startIntro({
    withTips, firstTime,
    countdownSec: st.settings.countdownSec, introCategory: 'squatCountdownIntro', onGo: startRunning,
  });
}

function startRunning() {
  sq.phase = 'running';
  shell.showPhase('running');
  hideBubbles();
  runPup = mountPup($('[data-pup-run]', section), stage(), 'idle');
  countEl.textContent = '0';
  ringFill.style.transition = 'none';
  setRing(0);
  void ringFill.getBoundingClientRect();
  ringFill.style.transition = '';
  sq.color = null; setColor('blue');
  sq.sw = createStopwatch();
  sq.sw.start();
  startSquatAnimation(runPup, sq.beatMs, shadow);          // same frame as the clock's t0
  sq.lastMs = 0;
  sq.stopArmedAt = performance.now() + TIMING.stopIgnoreMs;
  sounds.go();
  sounds.boop();                                            // rep 1 starts going down now
  cancelAnimationFrame(sq.rafId);
  sq.rafId = requestAnimationFrame(frame);
}

/** Extra words said together with a spoken count, so utterances never cut each other off. */
function extraFor(n) {
  if (n === sq.goal) return line('squatGoalLive');
  if (sq.best !== null && n === sq.best + 1 && n > sq.goal) return line('plankBestLive');   // "New record!"
  if (n === sq.goal - 1) return line('squatOneMore');
  if (n === sq.goal - 2) return line('squatTwoMore');
  return '';
}

function frame() {
  if (sq.phase !== 'running') return;
  const ms = sq.sw.elapsed();
  const cues = squatCuesBetween(sq.lastMs, ms, { beatMs: sq.beatMs, goalReps: sq.goal, bestReps: sq.best, capReps: sq.cap });
  const speech = [];
  if (sq.speakCounts) {
    for (const n of squatCountsToSpeak(sq.lastMs, ms, sq.beatMs)) {
      if (n > sq.cap) continue;
      const extra = extraFor(n);
      speech.push(numberWord(n) + (extra ? ' ' + extra : ''));
    }
  }
  for (const c of cues) {
    if (c.type === 'rep')     { countEl.textContent = String(c.n); retrigger(countEl, 'tick'); setRing(c.n); sounds.up(); }
    if (c.type === 'down')    sounds.boop();
    if (c.type === 'sparkle') retrigger(countEl, 'sparkle');
    if (!sq.speakCounts && sq.speechOn) {                    // tone-only counting: still say the helper lines
      if (c.type === 'twoMore') speech.push(line('squatTwoMore'));
      if (c.type === 'oneMore') speech.push(line('squatOneMore'));
      if (c.type === 'goal')    speech.push(line('squatGoalLive'));
    }
    if (c.type === 'goal')    { sounds.chime(); confettiBurst(30); if (!(sq.best !== null && c.n > sq.best)) setColor('green'); }
    if (c.type === 'best')    { sounds.fanfare(); setColor('gold'); }
  }
  if (speech.length) say(speech.join(' '));                  // ONE utterance per frame
  sq.lastMs = ms;
  if (repsCompleted(ms, sq.beatMs) >= sq.cap) { toCountCheck(sq.cap, ms, true); return; }
  sq.rafId = requestAnimationFrame(frame);
}

function toCountCheck(counted, ms, capped) {
  cancelAnimationFrame(sq.rafId);
  releaseWakeLock();
  stopSquatAnimation(runPup, shadow);
  sq.phase = 'countCheck'; sq.counted = counted; sq.value = counted; sq.elapsedMs = ms;
  shell.showPhase('countCheck');
  mountPup($('[data-pup-check]', section), stage(), 'idle');
  renderCountCheck(false);
  if (capped) { sounds.chime(); speakLine('capReached'); }
  else speakLine('countCheck', { n: counted });
}
function renderCountCheck(bump) {
  checkEl.textContent = String(sq.value);
  if (bump) retrigger(checkEl, 'tick');
  const maxV = clampCorrection(Infinity, sq.counted, sq.cap);
  $('[data-act="minus"]', section).disabled = sq.value <= 0;
  $('[data-act="plus"]', section).disabled = sq.value >= maxV;
  $('[data-act="ok"]', section).disabled = sq.value < TIMING.squat.minValidReps;
}

function cancelToReady() {
  shell.cancelIntro();
  cancelAnimationFrame(sq.rafId);
  releaseWakeLock();
  stopSpeech();
  hideBubbles();
  stopSquatAnimation(runPup, shadow);
  sq.phase = 'ready';
  shell.showPhase('ready');
  mountPup($('[data-pup-ready]', section), stage(), 'pose-squat');
}

function stopRunning() {
  const ms = sq.sw.stop();
  toCountCheck(Math.min(sq.cap, repsCompleted(ms, sq.beatMs)), ms, false);
}

function onScreenPointerDown(e) {
  if (e.target.closest('[data-own-tap]')) return;
  if (sq.phase === 'countdown') {
    e.preventDefault();
    if (shell.tipsActive) shell.skipTips(); else cancelToReady();
  } else if (sq.phase === 'running' && performance.now() >= sq.stopArmedAt) {
    e.preventDefault();
    sounds.stop();
    stopSpeech();
    stopRunning();
  }
}

function onAction(act) {
  if (act === 'home') { go('home'); return; }
  if (act === 'go' || act === 'redo') { acquireWakeLock(); beginIntro(false); return; }
  if (act === 'tip') { acquireWakeLock(); beginIntro(true); return; }
  if (sq.phase !== 'countCheck') return;
  if (act === 'minus' || act === 'plus') {
    sq.value = clampCorrection(sq.value + (act === 'plus' ? 1 : -1), sq.counted, sq.cap);
    sounds.tap();
    say(String(sq.value));
    renderCountCheck(true);
    return;
  }
  if (act === 'ok' && sq.value >= TIMING.squat.minValidReps) {
    sq.phase = 'idle';
    saveAndCelebrate({ exercise: 'squat', reps: sq.value, countedReps: sq.counted, beatMs: sq.beatMs, elapsedMs: sq.elapsedMs });
  }
}

export default {
  id: 'squats',
  mount(sectionEl) {
    section = sectionEl;
    shell = createShell(section, 'squat');
    countEl = $('[data-count]', section);
    checkEl = $('[data-check-count]', section);
    shadow = $('[data-shadow]', section);
    setupRing();
    section.addEventListener('pointerdown', onScreenPointerDown);
    section.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => onAction(b.dataset.act)));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'hidden') return;
      if (sq.phase === 'countdown') cancelToReady();
      else if (sq.phase === 'running') stopRunning();
    });
  },
  canEnter() { return app.request?.exercise === 'squat'; },
  show() {
    app.request = null;
    const st = getState();
    const shown = st.meta.formTipsShown.squat;
    const withTips = shown < TIMING.formTipTimes;
    if (withTips) update((s) => { s.meta.formTipsShown.squat += 1; });
    beginIntro(withTips, shown === 0);
  },
  hide() {
    shell.cancelIntro();
    if (sq.phase === 'countdown' || sq.phase === 'running') { cancelAnimationFrame(sq.rafId); releaseWakeLock(); stopSpeech(); }
    stopSquatAnimation(runPup, shadow);
    sq.phase = 'idle';
    shell.setColor(null);
  },
};
