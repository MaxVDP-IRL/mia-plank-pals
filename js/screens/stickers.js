// Sticker Book: 6 themed pages × 6 + the Pup page (milestone rosettes). Books 2+ are sparkly.
import { getState } from '../store.js';
import { go } from '../router.js';
import { currentPage } from '../logic/rewards.js';
import { CATALOG, STICKER_PAGES, STICKER_NAME, MILESTONE_STICKERS } from '../catalog.js';
import { sounds } from '../platform/audio.js';
import { say } from '../platform/speech.js';
import { stickerEl, rosetteEl } from '../ui/stickerArt.js';
import { $, el, clear, retrigger } from '../ui/dom.js';

const PUP_PAGE = STICKER_PAGES.length;       // index 6
let section, book = 1, page = 0;

function maxBook(st) {
  return Math.max(1, currentPage(st.stickers).book, ...st.stickers.map((x) => x.book));
}

function zoom(node, spoken) {
  const ov = el('div', { class: 'overlay zoom' }, node);
  ov.addEventListener('click', () => ov.remove());
  document.body.appendChild(ov);
  sounds.sticker();
  if (spoken) say(spoken);
}

function render(dir = 0) {
  const st = getState();
  const books = maxBook(st);
  const cur = currentPage(st.stickers);

  // Book chips
  const chips = clear($('#book-chips', section));
  if (books >= 2) {
    for (let b = 1; b <= books; b++) {
      chips.appendChild(el('button', { type: 'button', 'aria-pressed': String(b === book), onclick: () => { book = b; render(); } }, '📖' + b));
    }
  }

  // Page chip
  $('#book-page-emoji', section).textContent = page === PUP_PAGE ? '🐾' : STICKER_PAGES[page].emoji;
  const dots = clear($('#book-dots', section));
  for (let i = 0; i <= PUP_PAGE; i++) dots.appendChild(el('i', { class: i === page ? 'on' : '' }));

  const holder = clear($('#book-page', section));
  let grid;
  if (page === PUP_PAGE) {
    const owned = new Set(st.milestones.map((m) => m.id));
    grid = el('div', { class: 'book-grid pup-page' });
    for (const m of MILESTONE_STICKERS) {
      const have = owned.has(m.id);
      const r = rosetteEl(m.days, { locked: !have });
      const b = el('button', { type: 'button', 'aria-label': `${m.days} days` }, r);
      b.addEventListener('click', () => {
        if (have) zoom(rosetteEl(m.days, { big: true }), `${m.days} days!`);
        else retrigger(r, 'wiggle');
      });
      grid.appendChild(b);
    }
    $('#book-count', section).textContent = `${owned.size} / ${MILESTONE_STICKERS.length}`;
  } else {
    const mine = st.stickers.filter((x) => x.book === book);
    grid = el('div', { class: 'book-grid' + (book >= 2 ? ' book-2' : '') });
    let n = 0;
    for (const id of CATALOG.pages[page].ids) {
      const s = mine.find((x) => x.id === id);
      if (s) n++;
      const art = stickerEl(id, { gold: s?.gold, locked: !s });
      const b = el('button', { type: 'button', 'aria-label': s ? STICKER_NAME[id] : 'Empty' }, art);
      b.addEventListener('click', () => {
        if (s) {
          const big = stickerEl(id, { gold: s.gold, size: 220 });
          const wrap = el('div', { class: book >= 2 ? 'book-2' : '' }, big);
          const name = STICKER_NAME[id];
          zoom(wrap, name.charAt(0).toUpperCase() + name.slice(1) + '!');
        } else retrigger(art, 'wiggle');
      });
      grid.appendChild(b);
    }
    $('#book-count', section).textContent = `${n} / 6`;
  }
  if (dir) grid.classList.add(dir > 0 ? 'turn-next' : 'turn-prev');
  holder.appendChild(grid);

  // Nav
  $('#book-prev', section).classList.toggle('is-invisible', page === 0);
  $('#book-next', section).classList.toggle('is-invisible', page === PUP_PAGE);

  // Page prize strip (only on the page being filled now)
  const prize = $('#book-prize', section);
  const pp = st.settings.pagePrize;
  const showPrize = pp.mode !== 'off' && page !== PUP_PAGE && book === cur.book && page === cur.pageIndex;
  prize.hidden = !showPrize;
  if (showPrize) prize.textContent = `🎁 Fill this page → ${pp.emoji}`;
}

export default {
  id: 'stickers',
  mount(sectionEl) {
    section = sectionEl;
    $('#book-home', section).addEventListener('click', () => go('home'));
    $('#book-prev', section).addEventListener('click', () => { if (page > 0) { page--; sounds.tap(); render(-1); } });
    $('#book-next', section).addEventListener('click', () => { if (page < PUP_PAGE) { page++; sounds.tap(); render(1); } });
  },
  canEnter() { const m = getState().meta; return m.onboarded && m.metPup; },
  show() {
    const st = getState();
    const cur = currentPage(st.stickers);
    const latest = st.stickers[st.stickers.length - 1];
    book = latest ? latest.book : cur.book;
    page = latest ? CATALOG.pages.findIndex((p) => p.ids.includes(latest.id)) : cur.pageIndex;
    if (page < 0) page = 0;
    render();
  },
  hide() { document.querySelectorAll('.overlay.zoom').forEach((n) => n.remove()); },
};
