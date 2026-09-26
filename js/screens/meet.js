// Meet Pup (first launch, for the child): wiggling basket → puppy pops out → pick a name from picture cards.
import { getState, update } from '../store.js';
import { go } from '../router.js';
import { PET_NAMES } from '../catalog.js';
import { sounds, unlockAudio } from '../platform/audio.js';
import { say, unlockSpeech } from '../platform/speech.js';
import { speakLine, lineVars } from '../ui/flow.js';
import { pickLine } from '../strings.js';
import { mountPup, playTrick } from '../ui/pup.js';
import { confettiBurst } from '../ui/fx.js';
import { $, el, clear, wait } from '../ui/dom.js';

let section, basket, chosen = 'Pup', opened = false, meetPup = null;

function renderGrid() {
  const grid = clear($('#meet-grid', section));
  const names = PET_NAMES.some((p) => p.name === chosen) ? PET_NAMES : [...PET_NAMES.slice(0, 5), { name: chosen, emoji: '✏️' }];
  for (const p of names) {
    const card = el('button', { class: 'name-card', type: 'button', 'aria-pressed': String(p.name === chosen) },
      el('span', { class: 'emoji' }, p.emoji), el('span', {}, p.name));
    card.addEventListener('click', () => {
      chosen = p.name;
      grid.querySelectorAll('.name-card').forEach((c) => c.setAttribute('aria-pressed', String(c === card)));
      sounds.tap();
      say(p.name + '?');
      if (meetPup) playTrick(meetPup, 'sit', 900);
    });
    grid.appendChild(card);
  }
}

async function openBasket() {
  if (opened) return;
  opened = true;
  unlockAudio(); unlockSpeech();
  basket.classList.remove('is-wiggling');
  basket.classList.add('is-open');
  sounds.grow();
  const pup = mountPup($('#meet-basket-pup', section), 1, 'idle');
  $('#meet-bubble', section).hidden = true;
  await wait(1000);
  section.classList.add('is-lit');
  confettiBurst(60);
  playTrick(pup, 'sneeze');
  const b = $('#meet-bubble', section);
  b.textContent = pickLine('meetHello', lineVars());
  b.hidden = false;
  say(b.textContent);
  await wait(3200);
  $('#meet-basket-phase', section).hidden = true;
  $('#meet-names-phase', section).hidden = false;
  meetPup = mountPup($('#meet-pup', section), 1, 'idle');
  renderGrid();
  speakLine('meetPickName');
}

export default {
  id: 'meet',
  mount(sectionEl) {
    section = sectionEl;
    basket = $('#meet-basket', section);
    basket.addEventListener('click', openBasket);
    $('#meet-ok', section).addEventListener('click', async () => {
      update((s) => { s.settings.petName = chosen; s.meta.metPup = true; });
      sounds.fanfare(); confettiBurst(100);
      speakLine('meetNamed');
      if (meetPup) await playTrick(meetPup, 'jump');
      go('home');
    });
    $('#meet-type', section).addEventListener('click', () => {
      $('#meet-type-row', section).hidden = false;
      $('#meet-type-input', section).focus();
    });
    $('#meet-type-ok', section).addEventListener('click', () => {
      const v = $('#meet-type-input', section).value.trim().slice(0, 12);
      if (!v) return;
      chosen = v;
      $('#meet-type-input', section).blur();
      $('#meet-type-row', section).hidden = true;
      renderGrid();
      say(v + '?');
    });
  },
  canEnter() { const m = getState().meta; return m.onboarded && !m.metPup; },
  show() {
    opened = false;
    chosen = getState().settings.petName || 'Pup';
    section.classList.remove('is-lit');
    basket.classList.add('is-wiggling'); basket.classList.remove('is-open');
    clear($('#meet-basket-pup', section));
    $('#meet-basket-phase', section).hidden = false;
    $('#meet-names-phase', section).hidden = true;
    const b = $('#meet-bubble', section);
    b.textContent = pickLine('meetBasket', lineVars());
    b.hidden = false;
    setTimeout(() => say(b.textContent), 500);
  },
};
