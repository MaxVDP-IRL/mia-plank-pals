// Celebrate: result tier → Pup trick → treat bowl → sticker pick (or Double day) → at most one big moment → buttons.
import { app, getState, setState, update } from '../store.js';
import { go } from '../router.js';
import { claimSticker, pickBigMoment, stageForXp } from '../logic/rewards.js';
import { weekPaws } from '../logic/streak.js';
import { toLocalDateStr } from '../logic/dates.js';
import { CATALOG, STICKER_NAME, PET_STAGES, MILESTONE_STICKERS } from '../catalog.js';
import { sounds } from '../platform/audio.js';
import { stopSpeech } from '../platform/speech.js';
import { speakLine, startExercise, hideBubbles } from '../ui/flow.js';
import { mountPup, playTrick, setStage, mountExercisePic } from '../ui/pup.js';
import { confettiBurst, emojiFloat, GOLD } from '../ui/fx.js';
import { stickerEl, rosetteEl } from '../ui/stickerArt.js';
import { $, el, clear, wait } from '../ui/dom.js';
import { renderPaws } from './home.js';

let section, resultEl, pupWrap, bowlEl, rewardEl, noteEl, actionsEl;
let seq = 0;
let overlay = null;

const TIER_BADGE = ['❤️', '🦴', '🏆'];

function setBowl(fill) { bowlEl.style.setProperty('--fill', String(Math.max(0, Math.min(1, fill)))); }

async function run(r) {
  const token = ++seq;
  const alive = () => token === seq;
  const st = getState();
  clear(resultEl); clear(rewardEl); clear(noteEl); clear(actionsEl);
  section.classList.toggle('is-record', !r.pickOnly && r.tier === 2);

  const stageNow = stageForXp(st.pet.xp);
  const stageShown = r.pickOnly ? stageNow.index + 1 : (r.grew ? r.stageBefore.index + 1 : r.stageAfter.index + 1);
  const pup = mountPup(pupWrap, stageShown, 'idle');

  if (r.pickOnly) {
    setBowl(stageNow.progress);
  } else {
    // 1) Result row + tier
    const chip = el('div', { class: 'cel-chip ex-' + r.exercise });
    const value = r.exercise === 'plank'
      ? el('div', { class: 'cel-value' }, String(Math.floor(r.value / 1000)), el('small', {}, 's'))
      : el('div', { class: 'cel-value' }, String(r.value));
    resultEl.append(chip, value, el('div', { class: `tier-badge tier-${r.tier}` }, TIER_BADGE[r.tier]));
    mountExercisePic(chip, r.exercise, stageShown).style.width = '64px';

    const xpBefore = r.xpTotal - r.xpGained;
    setBowl(stageForXp(xpBefore).progress);
    setTimeout(() => { if (alive()) setBowl(r.grew ? 1 : r.stageAfter.progress); }, 600);

    const ex = r.exercise;
    const n = ex === 'plank' ? Math.floor(r.value / 1000) : r.value;
    if (r.tier === 2) {
      sounds.fanfare(); confettiBurst(120, GOLD); setTimeout(() => confettiBurst(60), 300);
      speakLine(ex === 'plank' ? 'plankBest' : 'squatBest', { n });
      playTrick(pup, 'jump');
    } else if (r.tier === 1) {
      sounds.chime(); confettiBurst(60);
      speakLine(ex === 'plank' ? 'plankGoal' : 'squatGoal', { n });
      playTrick(pup, PET_STAGES[stageShown - 1].trick);
    } else {
      sounds.soft(); emojiFloat('❤️', 10);
      speakLine(ex === 'plank' ? 'plankBelowGoal' : 'squatBelowGoal', { n });
      playTrick(pup, 'wag');
    }
    await wait(2600); if (!alive()) return;

    if (r.goalChange?.change === 'raised') {
      const to = ex === 'plank' ? `${Math.round(r.goalChange.to / 1000)}s` : String(r.goalChange.to);
      noteEl.textContent = `New 🦴 ${to}`;
      noteEl.className = 'cel-note fade-in';
    }
  }

  // 2) Reward: sticker cards, or the Double-day scene
  let claim = null;
  const pending = getState().pendingStickerPick;
  if (pending && (r.pickOnly || r.stickerOffer)) {
    claim = await showCards(pending, alive);
    if (!alive()) return;
  } else if (!r.pickOnly && r.doubleDay) {
    await showDoubleDay(pup, alive);
    if (!alive()) return;
  }
  if (!r.pickOnly && r.stickerUpgraded) {
    sounds.sticker();
    const today = getState().stickers.find((x) => x.date === toLocalDateStr());
    const art = today ? stickerEl(today.id, { gold: true, size: 56 }) : el('span', {}, '✨');
    const note = el('div', { class: 'gold-note' }, art, '✨');
    if (r.doubleDay) noteEl.replaceChildren(note); else rewardEl.replaceChildren(note);
    await wait(1200); if (!alive()) return;
  }

  // 3) At most one big moment
  const candidates = r.pickOnly ? [] : [...r.bigMoments];
  if (claim?.bookCompleted) candidates.push({ type: 'bookFull', book: claim.book });
  else if (claim?.pageCompleted) candidates.push({ type: 'pageFull', book: claim.book, pageIndex: claim.pageIndex, prize: claim.prize });
  const pick = pickBigMoment(candidates, getState().pendingBigMoments);
  update((s) => { s.pendingBigMoments = pick.queue; });
  if (pick.show) {
    await showBigMoment(pick.show, pup, alive);
    if (!alive()) return;
  } else if (!r.pickOnly && r.showOff) {
    speakLine('showOff'); emojiFloat('💖', 14);
    await playTrick(pup, PET_STAGES[Math.floor(Math.random() * PET_STAGES.length)].trick);
  }
  if (!r.pickOnly && r.grew) {
    setStage(pup, r.stageAfter.index + 1);
    bowlEl.style.setProperty('--fill', '0');                 // new stage: the bowl starts filling again
    setTimeout(() => { if (alive()) setBowl(r.stageAfter.progress); }, 400);
  }

  // 4) Buttons
  showActions(r);
}

function showActions(r) {
  clear(actionsEl);
  const home = el('button', { class: 'btn btn-big fade-in', type: 'button', 'aria-label': 'Home', onclick: () => go('home') }, '🏠');
  if (!r.pickOnly && r.canTryExtra && r.attempt === 'main') {
    const again = el('button', { class: 'btn btn-big btn-big--soft fade-in', type: 'button', 'aria-label': 'One more try',
      onclick: () => startExercise(r.exercise, 'extra') }, '🔁');
    actionsEl.append(again, home);
    speakLine('oneMoreTry');
  } else {
    actionsEl.append(home);
  }
}

// ---------- Sticker pick: 1 of up to 3 face-down cards ----------
function showCards(pending, alive) {
  return new Promise((resolve) => {
    const cards = el('div', { class: 'cards' });
    const buttons = pending.choices.map((id) => {
      const front = el('div', { class: 'card-face card-front' });          // filled only when picked: zero leakage
      const b = el('button', { class: 'card', type: 'button', 'aria-label': 'Sticker card' },
        el('div', { class: 'card-inner' }, el('div', { class: 'card-face card-back' }, '🐾'), front));
      b.addEventListener('click', () => pickCard(b, id, front));
      return b;
    });
    cards.append(...buttons);
    rewardEl.replaceChildren(cards);
    speakLine(pending.choices.length === 1 ? 'stickerLast' : 'stickerPick');

    function pickCard(cardEl, id, front) {
      if (cards.classList.contains('is-picked')) return;
      const res = claimSticker(getState(), id);
      if (!res.claimed) return;
      setState(res.state);
      front.appendChild(stickerEl(id, { gold: pending.gold, size: 88 }));
      cards.classList.add('is-picked');
      const cr = cards.getBoundingClientRect(), rr = cardEl.getBoundingClientRect();
      cardEl.style.setProperty('--to-center', (cr.left + cr.width / 2) - (rr.left + rr.width / 2) + 'px');
      cardEl.classList.add('is-chosen');
      sounds.sticker();
      setTimeout(() => { if (alive()) { confettiBurst(60); speakLine('stickerReveal', { sticker: STICKER_NAME[id] || 'sticker' }); } }, 650);
      setTimeout(() => {
        if (!alive()) return;
        const r2 = cardEl.getBoundingClientRect();
        cardEl.style.setProperty('--fly-x', (window.innerWidth - 48 - r2.right) + 'px');
        cardEl.style.setProperty('--fly-y', (-r2.top) + 'px');
        cardEl.classList.add('is-flying');
        const catcher = el('div', { class: 'book-catch' }, '📖');
        document.body.appendChild(catcher);
        setTimeout(() => catcher.remove(), 1400);
      }, 2800);
      setTimeout(() => resolve({ ...res, book: pending.book, pageIndex: pending.pageIndex }), 3600);
    }
  });
}

// ---------- Double day ----------
async function showDoubleDay(pup, alive) {
  const paws = el('div', { class: 'paws paws--big' });
  const card = el('div', { class: 'double-card' }, paws, el('div', { class: 'title' }, 'Double day!'));
  rewardEl.replaceChildren(card);
  const today = toLocalDateStr();
  renderPaws(paws, weekPaws(getState().sessions, today), today);
  speakLine('doubleDay');
  emojiFloat('🐾', 12);
  sounds.chime();
  await playTrick(pup, 'sit'); if (!alive()) return;
  await playTrick(pup, 'spin');
}

// ---------- Big moments (tier 3) ----------
function closeOverlay() { if (overlay) { overlay.remove(); overlay = null; } }

async function showBigMoment(m, pup, alive) {
  closeOverlay();
  const stageBox = el('div', { class: 'bm-stage' }, el('div', { class: 'sunburst' }));
  const subject = el('div', { class: 'bm-subject' });
  stageBox.appendChild(subject);
  const title = el('div', { class: 'bm-title' });
  const ok = el('button', { class: 'btn btn-big', type: 'button', 'aria-label': 'OK', hidden: true }, '✅');
  overlay = el('div', { class: 'overlay big-moment' }, el('div', { class: 'spot' }), stageBox, title, ok);
  document.body.appendChild(overlay);
  let closeReady = null;
  const closed = new Promise((res) => { closeReady = res; });
  const enableClose = () => {
    if (!alive()) return;
    ok.hidden = false;
    ok.onclick = () => closeReady();
    overlay.onclick = (e) => { if (e.target !== ok) closeReady(); };
  };

  if (m.type === 'stageUp') {
    const wrap = el('div', { class: 'pup-wrap', style: { '--pup-size': '280px' } });
    subject.appendChild(wrap);
    // m.stage is the NEW 0-based index, so the stage before, 1-based, is m.stage; the new one is m.stage + 1.
    const big = mountPup(wrap, m.stage, 'idle');
    wrap.classList.add('shake');
    sounds.drumroll();
    await wait(1300); if (!alive()) return closeOverlay();
    wrap.classList.remove('shake'); wrap.classList.add('glow');
    setStage(big, m.stage + 1);
    if (pup) setStage(pup, m.stage + 1);
    sounds.grow(); confettiBurst(100);
    title.textContent = speakLine('stageUp', {}, { bubbleOnly: false, silentBubble: true });
    await wait(700); if (!alive()) return closeOverlay();
    await playTrick(big, PET_STAGES[m.stage].trick);
  } else if (m.type === 'pageFull') {
    const ids = CATALOG.pages[m.pageIndex].ids;
    const owned = getState().stickers.filter((x) => x.book === m.book);
    const page = el('div', { class: 'mini-page' + (m.book >= 2 ? ' book-2' : '') },
      ids.map((id) => stickerEl(id, { gold: owned.some((x) => x.id === id && x.gold), size: 72 })),
      el('div', { class: 'stamp-check' }, '✅'));
    subject.appendChild(page);
    sounds.fanfare(); confettiBurst(100);
    title.textContent = speakLine(m.prize ? 'pagePrize' : 'pageFull', {}, { silentBubble: true });
    if (m.prize) subject.appendChild(el('div', { class: 'prize-gift' }, m.prize.emoji));
  } else if (m.type === 'bookFull') {
    subject.appendChild(el('div', { class: 'book-cover' }, el('div', { class: 'e' }, '📖'), el('div', { class: 'n' }, String((m.book || 1) + 1))));
    sounds.fanfare(); confettiBurst(140, GOLD);
    title.textContent = speakLine('bookFull', {}, { silentBubble: true });
  } else if (m.type === 'milestone') {
    const days = MILESTONE_STICKERS.find((x) => x.id === m.id)?.days || 0;
    const ros = rosetteEl(days, { big: true });
    ros.classList.add('drop-in');
    subject.appendChild(ros);
    sounds.fanfare(); confettiBurst(100, GOLD);
    title.textContent = speakLine('milestone', { n: days }, { silentBubble: true });
  }
  setTimeout(enableClose, 1500);
  await closed;
  closeOverlay();
}

export default {
  id: 'celebrate',
  mount(sectionEl) {
    section = sectionEl;
    resultEl = $('#cel-result', section);
    pupWrap = $('#cel-pup', section);
    bowlEl = $('#cel-bowl', section);
    rewardEl = $('#cel-reward', section);
    noteEl = $('#cel-note', section);
    actionsEl = $('#cel-actions', section);
  },
  canEnter() { return !!app.lastResult; },
  show() { run(app.lastResult); },
  hide() {
    seq++;                               // cancels any running sequence
    closeOverlay();
    hideBubbles();
    stopSpeech();
    document.querySelectorAll('.book-catch').forEach((n) => n.remove());
    app.lastResult = null;
    app.cameFromCelebrate = true;
  },
};
