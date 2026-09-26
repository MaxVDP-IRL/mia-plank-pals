// Grown-up gate: hold 🔒 for 2 s, then answer a times-table question on an on-screen keypad.
import { GATE } from '../config.js';
import { makeGateQuestion, checkGateAnswer } from '../logic/gate.js';
import { app } from '../store.js';
import { el, clear } from './dom.js';

/** @returns Promise<boolean> */
export function openGate() {
  const root = document.getElementById('gate');
  return new Promise((resolve) => {
    let done = false;
    const finish = (okay) => {
      if (done) return; done = true;
      root.hidden = true; clear(root);
      if (okay) app.parentUntil = performance.now() + GATE.unlockMs;
      resolve(okay);
    };
    if (performance.now() < app.parentUntil) { finish(true); return; }

    // Step 1: press and hold
    let holdTimer = 0;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 120 120'); svg.setAttribute('width', '120'); svg.setAttribute('height', '120');
    const c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('cx', '60'); c.setAttribute('cy', '60'); c.setAttribute('r', '54');
    svg.appendChild(c);
    const hold = el('button', { class: 'gate-hold', type: 'button', 'aria-label': 'Press and hold' }, svg, '🔒');
    const cancelHold = () => { clearTimeout(holdTimer); hold.classList.remove('is-holding'); };
    hold.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      hold.classList.add('is-holding');
      holdTimer = setTimeout(showQuestion, GATE.holdMs);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => hold.addEventListener(t, cancelHold));
    hold.addEventListener('contextmenu', (e) => e.preventDefault());

    const card = el('div', { class: 'gate-card' },
      hold,
      el('div', { class: 'hint' }, 'Grown-ups: press and hold'),
      el('button', { class: 'gate-cancel', type: 'button', onclick: () => finish(false) }, 'Cancel'));
    clear(root).appendChild(card);
    root.hidden = false;
    root.onclick = (e) => { if (e.target === root) finish(false); };

    // Step 2: question + keypad
    function showQuestion() {
      const q = makeGateQuestion();
      let typed = '';
      const answer = el('div', { class: 'gate-answer' }, '');
      const press = (k) => {
        if (k === '⌫') typed = typed.slice(0, -1);
        else if (k === '✓') { finish(checkGateAnswer(q, typed)); return; }
        else if (typed.length < 3) typed += k;
        answer.textContent = typed;
      };
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];
      const pad = el('div', { class: 'keypad' },
        keys.map((k) => el('button', { type: 'button', class: k === '✓' ? 'ok' : '', onclick: () => press(k) }, k)));
      clear(card).append(
        el('div', { class: 'gate-q' }, q.text), answer, pad,
        el('button', { class: 'gate-cancel', type: 'button', onclick: () => finish(false) }, 'Cancel'));
    }
  });
}
