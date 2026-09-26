// Pup art helpers (01-design §5). Stage is 1–6 (= stageForXp(xp).index + 1).
import { stageForXp } from '../logic/rewards.js';

const STAGE_SCALE = [0.58, 0.68, 0.78, 0.87, 0.94, 1];

export const stageNumForXp = (xp) => stageForXp(xp).index + 1;

export function mountPup(container, stage = 1, mood = 'idle', tpl = 'pup-tpl') {
  const svg = document.getElementById(tpl).content.firstElementChild.cloneNode(true);
  svg.dataset.stage = String(stage);
  svg.dataset.mood = mood;
  const bubble = container.querySelector(':scope > .bubble');
  container.replaceChildren(svg);
  if (bubble) container.appendChild(bubble);
  setWrapScale(container, stage);
  return svg;
}
/** Lets the speech bubble sit just above Pup's head at any stage. */
export function setWrapScale(container, stage) {
  const fixed = container.classList.contains('fixed-size');
  container.style.setProperty('--stage-scale', fixed ? 1 : STAGE_SCALE[Math.max(0, Math.min(5, stage - 1))]);
}
export function setStage(svg, stage) {
  svg.dataset.stage = String(stage);
  if (svg.parentElement) setWrapScale(svg.parentElement, stage);
}

const TRICK_MS = { jump: 1700, flip: 1200, wag: 1300, sneeze: 1200, sit: 1300, highfive: 1300, spin: 1000 };
export function playTrick(svg, name, ms = TRICK_MS[name] || 1300) {
  const prev = svg.dataset.mood.startsWith('trick-') ? 'idle' : svg.dataset.mood;
  svg.dataset.mood = 'idle'; void svg.getBoundingClientRect();     // restart the animation if the same trick repeats
  svg.dataset.mood = 'trick-' + name;
  return new Promise((res) => setTimeout(() => { if (svg.dataset.mood === 'trick-' + name) svg.dataset.mood = prev; res(); }, ms));
}

/** Start the squat loop in the same frame as the squat clock's t0 (01 §5.5). */
export function startSquatAnimation(svg, beatMs, shadow) {
  document.documentElement.style.setProperty('--beat', beatMs + 'ms');
  svg.dataset.mood = 'idle'; void svg.getBoundingClientRect();   // force the CSS animation to restart
  svg.dataset.mood = 'squat';
  if (shadow) { shadow.classList.remove('is-squatting'); void shadow.offsetWidth; shadow.classList.add('is-squatting'); }
}
export function stopSquatAnimation(svg, shadow) {
  if (svg) svg.dataset.mood = 'idle';
  if (shadow) shadow.classList.remove('is-squatting');
}

/** Small exercise pictures (Home buttons, Setup rows, trophies, Celebrate chip). */
export function mountExercisePic(container, exercise, stage = 6) {
  container.classList.add('pup-wrap', 'fixed-size');
  return exercise === 'plank'
    ? mountPup(container, stage, 'still', 'pup-plank-tpl')
    : mountPup(container, stage, 'pose-squat');
}
