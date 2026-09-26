// Shared parts of the Plank and Squats screens: phases, colours, form-tip cards and the get-ready countdown.
import { TIMING } from '../config.js';
import { FORM_TIPS, FORM_TIP_SIDE } from '../catalog.js';
import { sounds } from '../platform/audio.js';
import { say } from '../platform/speech.js';
import { $, $$, el, clear, retrigger } from './dom.js';
import { speakLine, fillVars, hideBubbles } from './flow.js';

export function createShell(section, exercise) {
  const phases = $$('[data-phase]', section);
  const tip = $('[data-tip]', section);
  const countdownEl = $('[data-countdown]', section);
  const getReady = $('[data-getready]', section);
  let phase = null;
  let tipTimer = 0, tipsActive = false, tipIndex = 0, tipList = [], tipDone = null;
  let cdRaf = 0, cdActive = false, cdEnd = 0, cdShown = null, cdOnGo = null;

  function showPhase(name) {
    phase = name;
    phases.forEach((p) => { p.hidden = p.dataset.phase !== name; });
    const tipBtn = $('[data-act="tip"]', section);
    const redoBtn = $('[data-act="redo"]', section);
    if (tipBtn) tipBtn.hidden = !(name === 'countdown' || name === 'ready');
    if (redoBtn) redoBtn.hidden = name !== 'countCheck';
    if (name !== 'running') setColor(null);
  }
  function setColor(c) {
    section.classList.toggle('is-running', !!c);
    section.classList.toggle('is-goal', c === 'green' || c === 'gold');
    section.classList.toggle('is-record', c === 'gold');
  }

  // ---------- Form tips (PLAN §4.10) ----------
  function renderTip(i, animate) {
    const [emoji, text] = tipList[i];
    $('.emoji', tip).textContent = emoji;
    $('.text', tip).textContent = text;
    $('.side', tip).textContent = FORM_TIP_SIDE[exercise];
    const dots = clear($('.tip-dots', tip));
    tipList.forEach((_, j) => dots.appendChild(el('i', { class: j === i ? 'on' : '' })));
    if (animate) retrigger(tip, 'swap');
  }
  function playTips(firstTime, onDone) {
    tipList = [...FORM_TIPS[exercise]];
    if (exercise === 'squat' && firstTime) tipList.unshift(['📱', fillVars('Put the phone where {name} can see {pup}!')]);
    tipsActive = true; tipIndex = 0; tipDone = onDone;
    tip.hidden = false;
    countdownEl.textContent = ''; getReady.hidden = true;
    const step = () => {
      if (!tipsActive) return;
      if (tipIndex >= tipList.length) { finishTips(); return; }
      renderTip(tipIndex, tipIndex > 0);
      const text = tipList[tipIndex][1];
      say(text);
      tipIndex++;
      tipTimer = setTimeout(step, Math.max(TIMING.formTipStepMs, text.length * 65 + 350));
    };
    step();
  }
  function finishTips() {
    clearTimeout(tipTimer);
    if (!tipsActive) return;
    tipsActive = false;
    if (tipList.length) renderTip(tipList.length - 1, false);      // card stays visible, silent
    const d = tipDone; tipDone = null; d && d();
  }

  // ---------- Countdown ----------
  function startCountdown(sec, introCategory, onGo) {
    cdActive = true; cdOnGo = onGo; cdShown = null;
    cdEnd = performance.now() + sec * 1000;
    getReady.hidden = false;
    countdownEl.textContent = '';
    countdownEl.classList.toggle('small', !tip.hidden);
    speakLine(introCategory);
    cancelAnimationFrame(cdRaf);
    cdRaf = requestAnimationFrame(cdFrame);
  }
  function cdFrame() {
    if (!cdActive) return;
    const remaining = Math.ceil((cdEnd - performance.now()) / 1000);
    if (remaining <= 0) { cdActive = false; countdownEl.textContent = ''; const f = cdOnGo; cdOnGo = null; f && f(); return; }
    if (remaining !== cdShown) {
      cdShown = remaining;
      if (remaining <= TIMING.countdownTickFromSec) {
        getReady.hidden = true;
        countdownEl.textContent = String(remaining);
        retrigger(countdownEl, 'tick');
        sounds.tick();
      }
    }
    cdRaf = requestAnimationFrame(cdFrame);
  }

  /** Tips (if wanted) then countdown, then onGo(). */
  function startIntro({ withTips, firstTime, countdownSec, introCategory, onGo }) {
    cancelIntro();
    hideBubbles();
    showPhase('countdown');
    tip.hidden = true;
    const cd = () => startCountdown(countdownSec, introCategory, onGo);
    if (withTips) playTips(firstTime, cd); else cd();
  }
  function cancelIntro() {
    tipsActive = false; tipDone = null; clearTimeout(tipTimer);
    cdActive = false; cdOnGo = null; cancelAnimationFrame(cdRaf);
  }

  return {
    showPhase, setColor, startIntro, cancelIntro,
    skipTips: finishTips,
    get phase() { return phase; },
    get tipsActive() { return tipsActive; },
    get countdownActive() { return cdActive; },
  };
}
