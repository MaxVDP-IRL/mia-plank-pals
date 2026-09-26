// Home: Pup, the weekly paw row, the treat bowl and the two big exercise buttons.
import { UI } from '../config.js';
import { app, getState, update } from '../store.js';
import { go } from '../router.js';
import { toLocalDateStr } from '../logic/dates.js';
import { weekPaws, computeStreak } from '../logic/streak.js';
import { stageForXp } from '../logic/rewards.js';
import { exerciseDayState } from '../logic/session.js';
import { PET_STAGES } from '../catalog.js';
import { sounds } from '../platform/audio.js';
import { speakLine, startExercise } from '../ui/flow.js';
import { mountPup, playTrick, mountExercisePic } from '../ui/pup.js';
import { openGate } from '../ui/gateModal.js';
import { $, el, clear } from '../ui/dom.js';

let section, pup = null, inviteTimer = 0;
const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Shared with Celebrate (Double day) and Progress. */
export function renderPaws(container, days, todayStr, stampToday = false) {
  clear(container);
  days.forEach((d, i) => {
    const cls = ['paw'];
    if (d.paws === 2) cls.push('is-double'); else if (d.paws === 1) cls.push('is-done');
    if (d.date === todayStr) { cls.push('is-today'); if (stampToday && d.paws) cls.push('stamp'); }
    container.appendChild(el('div', { class: cls.join(' '), 'aria-label': d.date },
      d.paws === 2 ? '🐾🐾' : d.paws === 1 ? '🐾' : LETTERS[i]));
  });
}

function goalText(ex, st) {
  const g = st.settings.goals[ex].current;
  return ex === 'plank' ? `🦴 ${Math.round(g / 1000)}s` : `🦴 ${g}`;
}

function render({ fromCelebrate = false } = {}) {
  const st = getState();
  const today = toLocalDateStr();
  const S = st.sessions;
  const stage = stageForXp(st.pet.xp);
  const pState = exerciseDayState(S, 'plank', today);
  const qState = exerciseDayState(S, 'squat', today);
  const bothDone = pState !== 'fresh' && qState !== 'fresh';
  const oneDone = !bothDone && (pState !== 'fresh' || qState !== 'fresh');
  const resting = bothDone || pState === 'rested' || qState === 'rested';   // 03 §4: both done, or one + its one more try

  renderPaws($('#home-paws', section), weekPaws(S, today), today, fromCelebrate);
  pup = mountPup($('#home-pup', section), stage.index + 1, resting ? 'sleepy' : 'idle');
  mountExercisePic($('#home-plank .ex-pic', section), 'plank', stage.index + 1);
  mountExercisePic($('#home-squat .ex-pic', section), 'squat', stage.index + 1);
  $('#home-petname', section).textContent = st.settings.petName;
  $('#home-bowl', section).style.setProperty('--fill', String(stage.progress));
  $('#home-plank-goal', section).textContent = goalText('plank', st);
  $('#home-squat-goal', section).textContent = goalText('squat', st);

  const pBtn = $('#home-plank', section), qBtn = $('#home-squat', section);
  for (const [btn, s, other] of [[pBtn, pState, qState], [qBtn, qState, pState]]) {
    btn.classList.toggle('is-done', s !== 'fresh');
    btn.classList.toggle('is-offer', s === 'fresh' && other !== 'fresh');
    btn.classList.remove('invite');
    $('.ex-badge', btn).textContent = s !== 'fresh' ? '✅' : (other !== 'fresh' ? '🎁' : '');
  }

  // Greeting (shown in the bubble; spoken once iOS allows speech after the first tap)
  let cat = null;
  if (S.length === 0) cat = 'homeFirst';
  else if (bothDone) cat = 'homeDoubleDone';
  else if (oneDone && st.meta.lastOfferOtherDate !== today) {
    cat = pState !== 'fresh' ? 'offerOtherSquats' : 'offerOtherPlank';
    update((s) => { s.meta.lastOfferOtherDate = today; });
  } else if (resting) cat = 'homeDoneForToday';
  else if (oneDone) cat = null;                                 // after the one gentle offer, Pup stays quiet
  else if ((computeStreak(S.map((x) => x.date), today).daysSinceLast ?? 0) >= UI.returningAfterDays) cat = 'homeReturning';
  else cat = 'homeHello';
  if (cat) setTimeout(() => speakLine(cat), fromCelebrate ? 700 : 400);
  if (fromCelebrate && oneDone && pup) setTimeout(() => pup && playTrick(pup, 'jump'), 300);

  clearTimeout(inviteTimer);
  if (!oneDone && !bothDone) {
    inviteTimer = setTimeout(() => { pBtn.classList.add('invite'); qBtn.classList.add('invite'); }, UI.inviteAfterMs);
  }
}

function onPupTap() {
  if (!pup) return;
  const st = getState();
  const stage = stageForXp(st.pet.xp);
  const tricks = PET_STAGES.slice(0, stage.index + 1).map((s) => s.trick);
  sounds.tap();
  speakLine('tapPup');
  if (pup.dataset.mood !== 'sleepy') playTrick(pup, tricks[Math.floor(Math.random() * tricks.length)]);
  else playTrick(pup, 'wag');
}

export default {
  id: 'home',
  mount(sectionEl) {
    section = sectionEl;
    $('#home-plank', section).addEventListener('click', () => { sounds.tap(); startExercise('plank'); });
    $('#home-squat', section).addEventListener('click', () => { sounds.tap(); startExercise('squat'); });
    $('#home-book', section).addEventListener('click', () => { sounds.tap(); go('stickers'); });
    $('#home-progress', section).addEventListener('click', () => { sounds.tap(); go('progress'); });
    $('#home-pup', section).addEventListener('click', onPupTap);
    $('#home-lock', section).addEventListener('click', () => openGate().then((ok) => ok && go('parent')));
  },
  canEnter() { const m = getState().meta; return m.onboarded && m.metPup; },
  show() {
    const st = getState();
    if (st.pendingStickerPick && !app.lastResult) {             // closed before picking: offer the cards again
      app.lastResult = { pickOnly: true };
      setTimeout(() => go('celebrate', { replace: true }), 0);
      return;
    }
    render({ fromCelebrate: app.cameFromCelebrate === true });
    app.cameFromCelebrate = false;
  },
  hide() { clearTimeout(inviteTimer); },
};
