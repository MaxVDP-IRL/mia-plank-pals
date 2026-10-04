// Meet Pup (first launch, for the child): wiggling basket → puppy pops out → pick a name from picture cards.
// Tapping a card (or a grown-up typed name) asks "Call me {name}?" before anything is saved.
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

let section, basket, opened = false, meetPup = null;
let pendingName = null, committing = false;

function paintPressed(name) {
  section.querySelectorAll('.name-card').forEach((c) => {
    c.setAttribute('aria-pressed', String(!!name && c.dataset.name === name));
  });
}

function renderGrid() {
  const grid = clear($('#meet-grid', section));
  for (const p of PET_NAMES) {
    const card = el('button', {
      class: 'name-card', type: 'button', 'aria-pressed': 'false', dataset: { name: p.name },
    }, el('span', { class: 'emoji' }, p.emoji), el('span', {}, p.name));
    card.addEventListener('click', () => {
      sounds.tap();
      if (meetPup) playTrick(meetPup, 'sit', 900);
      openAsk(p.name, p.emoji);
    });
    grid.appendChild(card);
  }
}

/** Show the yes/no popup. Does not write the pet name. */
function openAsk(name, emoji) {
  if (pendingName || committing) return;
  const clean = String(name || '').trim().slice(0, 12);
  if (!clean) return;
  pendingName = clean;
  $('#meet-ask-emoji', section).textContent = emoji || '🐾';
  $('#meet-ask-q', section).textContent = speakLine('meetAsk', { pup: clean }, { silentBubble: true });
  $('#meet-ask-yes', section).disabled = false;
  $('#meet-ask-no', section).disabled = false;
  $('#meet-ask', section).hidden = false;
  paintPressed(clean);
}

function closeAsk() {
  pendingName = null;
  const ask = $('#meet-ask', section);
  if (ask) ask.hidden = true;
  if (section) paintPressed(null);
}

async function confirmAsk() {
  if (!pendingName || committing) return;
  committing = true;
  const name = pendingName;
  pendingName = null;
  $('#meet-ask-yes', section).disabled = true;
  $('#meet-ask-no', section).disabled = true;
  $('#meet-ask', section).hidden = true;
  paintPressed(null);
  update((s) => { s.settings.petName = name; s.meta.metPup = true; });
  sounds.fanfare();
  confettiBurst(100);
  speakLine('meetNamed');
  if (meetPup) await playTrick(meetPup, 'jump');
  go('home');
}

function cancelAsk() {
  if (committing) return;
  sounds.tap();
  closeAsk();
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
    $('#meet-ask-yes', section).addEventListener('click', confirmAsk);
    $('#meet-ask-no', section).addEventListener('click', cancelAsk);
    $('#meet-ask', section).addEventListener('click', (e) => {
      if (e.target === e.currentTarget) cancelAsk();
    });
    $('#meet-type', section).addEventListener('click', () => {
      $('#meet-type-row', section).hidden = false;
      $('#meet-type-input', section).focus();
    });
    $('#meet-type-ok', section).addEventListener('click', () => {
      const v = $('#meet-type-input', section).value.trim().slice(0, 12);
      if (!v) return;
      $('#meet-type-input', section).blur();
      $('#meet-type-row', section).hidden = true;
      const known = PET_NAMES.find((p) => p.name === v);
      openAsk(v, known ? known.emoji : '✏️');
    });
  },
  canEnter() { const m = getState().meta; return m.onboarded && !m.metPup; },
  show() {
    opened = false;
    committing = false;
    closeAsk();
    $('#meet-ask-yes', section).disabled = false;
    $('#meet-ask-no', section).disabled = false;
    $('#meet-type-row', section).hidden = true;
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
