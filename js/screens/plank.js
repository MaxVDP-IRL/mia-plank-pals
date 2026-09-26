// Plank screen: tips → countdown → stopwatch with goal ring → tap anywhere to stop.
import { TIMING } from '../config.js';
import { createStopwatch } from '../logic/stopwatch.js';
import { plankCuesBetween, plankVisualState } from '../logic/cues.js';
import { bestValue } from '../logic/stats.js';
import { getState, update, app } from '../store.js';
import { go } from '../router.js';
import { acquireWakeLock, releaseWakeLock } from '../platform/wakelock.js';
import { sounds } from '../platform/audio.js';
import { stopSpeech } from '../platform/speech.js';
import { speakLine, saveAndCelebrate, hideBubbles } from '../ui/flow.js';
import { createShell } from '../ui/exercise.js';
import { mountPup, stageNumForXp } from '../ui/pup.js';
import { confettiBurst } from '../ui/fx.js';
import { $, retrigger } from '../ui/dom.js';

const ctl = { phase: 'idle', rafId: 0, sw: null, stopArmedAt: 0, lastMs: 0, goalMs: 0, bestMs: null, capMs: 60000,
              pendingMs: 0, shownSec: -1, color: null };
let section, shell, timerEl, ringFill, ringC = 0;

function stage() { return stageNumForXp(getState().pet.xp); }

function setupRing() {
  ringFill = $('.ring-fill', section);
  ringC = 2 * Math.PI * Number(ringFill.getAttribute('r'));
  ringFill.style.strokeDasharray = ringC;
  setRing(0, 1);
}
function setRing(value, goal) { ringFill.style.strokeDashoffset = ringC * (1 - Math.min(value / goal, 1)); }
function resetRing() {
  ringFill.style.transition = 'none';
  setRing(0, 1);
  void ringFill.getBoundingClientRect();
  ringFill.style.transition = '';
}

function setElapsed(ms) {
  const sec = Math.floor(ms / 1000);
  if (sec !== ctl.shownSec) { ctl.shownSec = sec; timerEl.textContent = String(sec); if (sec > 0) retrigger(timerEl, 'tick'); }
  setRing(ms, ctl.goalMs);
}
function setColor(c) {
  if (c === ctl.color) return;
  if (c === 'green' && ctl.color === 'blue') confettiBurst(30);
  ctl.color = c;
  shell.setColor(c);
}

export function beginIntro(withTips) {
  const st = getState();
  ctl.goalMs = st.settings.goals.plank.current;
  ctl.bestMs = bestValue(st.sessions, 'plank');
  ctl.capMs = st.settings.plank.capMs;
  ctl.phase = 'countdown';
  acquireWakeLock();
  mountPup($('[data-pup-cd]', section), stage(), 'plank', 'pup-plank-tpl');
  shell.startIntro({
    withTips, firstTime: false,
    countdownSec: st.settings.countdownSec, introCategory: 'plankCountdownIntro', onGo: startRunning,
  });
}

function startRunning() {
  ctl.phase = 'running';
  ctl.sw = createStopwatch();
  ctl.sw.start();
  ctl.lastMs = 0; ctl.shownSec = -1; ctl.color = null;
  ctl.stopArmedAt = performance.now() + TIMING.stopIgnoreMs;
  sounds.go();
  shell.showPhase('running');
  mountPup($('[data-pup-run]', section), stage(), 'plank', 'pup-plank-tpl');
  speakLine('go');
  resetRing();
  setElapsed(0);
  setColor('blue');
  cancelAnimationFrame(ctl.rafId);
  ctl.rafId = requestAnimationFrame(frame);
}

function frame() {
  if (ctl.phase !== 'running') return;
  const ms = ctl.sw.elapsed();
  if (ms >= ctl.capMs) { finish(ctl.capMs, true); return; }
  const cues = plankCuesBetween(ctl.lastMs, ms, { goalMs: ctl.goalMs, bestMs: ctl.bestMs });
  playPlankCues(cues);
  ctl.lastMs = ms;
  setElapsed(ms);
  setColor(plankVisualState(ms, ctl.goalMs, ctl.bestMs));
  ctl.rafId = requestAnimationFrame(frame);
}

function playPlankCues(cues) {
  const types = cues.map((c) => c.type);
  if (types.includes('best')) { sounds.fanfare(); speakLine('plankBestLive'); }
  else if (types.includes('goal')) { sounds.chime(); speakLine('plankGoalLive'); }
  else if (types.includes('nearGoal')) speakLine('plankNearGoal');
  else if (types.includes('midway')) speakLine('plankMidway');
  else if (types.includes('boop')) sounds.boop();
}

function finish(ms, capped) {
  cancelAnimationFrame(ctl.rafId);
  releaseWakeLock();
  const P = TIMING.plank;
  if (!capped && ms < P.falseStartMs) {
    ctl.phase = 'falseStart';
    ctl.pendingMs = ms;
    shell.showPhase('falseStart');
    const svg = mountPup($('[data-pup-false]', section), stage(), 'idle');
    svg.classList.add('is-tilt');
    $('[data-act="count"]', section).hidden = ms < P.minValidMs;
    speakLine(ms < P.minValidMs ? 'tryAgain' : 'countIt');
    return;
  }
  ctl.phase = 'idle';
  if (capped) { sounds.chime(); speakLine('capReached'); }
  saveAndCelebrate({ exercise: 'plank', durationMs: ms, autoFinished: capped });
}

function cancelToReady() {
  shell.cancelIntro();
  cancelAnimationFrame(ctl.rafId);
  releaseWakeLock();
  stopSpeech();
  hideBubbles();
  ctl.phase = 'ready';
  shell.showPhase('ready');
  mountPup($('[data-pup-ready]', section), stage(), 'plank', 'pup-plank-tpl');
}

function onScreenPointerDown(e) {
  if (e.target.closest('[data-own-tap]')) return;          // real buttons (🔁 ✅ 🐾 ❓ 🏠) handle themselves
  if (ctl.phase === 'countdown') {
    e.preventDefault();
    if (shell.tipsActive) shell.skipTips(); else cancelToReady();
  } else if (ctl.phase === 'running' && performance.now() >= ctl.stopArmedAt) {
    e.preventDefault();
    sounds.stop();
    finish(ctl.sw.stop(), false);
  }
}

function onAction(act) {
  if (act === 'home') { go('home'); return; }
  if (act === 'go' || act === 'retry') { acquireWakeLock(); beginIntro(false); return; }
  if (act === 'tip') { acquireWakeLock(); beginIntro(true); return; }
  if (act === 'count') { ctl.phase = 'idle'; saveAndCelebrate({ exercise: 'plank', durationMs: ctl.pendingMs, autoFinished: false }); }
}

export default {
  id: 'plank',
  mount(sectionEl) {
    section = sectionEl;
    shell = createShell(section, 'plank');
    timerEl = $('[data-timer]', section);
    setupRing();
    section.addEventListener('pointerdown', onScreenPointerDown);
    section.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => onAction(b.dataset.act)));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'hidden') return;
      if (ctl.phase === 'countdown') cancelToReady();
      else if (ctl.phase === 'running') finish(ctl.sw.stop(), false);
    });
  },
  canEnter() { return app.request?.exercise === 'plank'; },
  show() {
    app.request = null;
    const st = getState();
    const withTips = st.meta.formTipsShown.plank < TIMING.formTipTimes;
    if (withTips) update((s) => { s.meta.formTipsShown.plank += 1; });
    beginIntro(withTips);
  },
  hide() {                                                  // the router called hide(): abort without saving
    shell.cancelIntro();
    if (ctl.phase === 'countdown' || ctl.phase === 'running') { cancelAnimationFrame(ctl.rafId); releaseWakeLock(); stopSpeech(); }
    ctl.phase = 'idle';
    shell.setColor(null);
  },
};
