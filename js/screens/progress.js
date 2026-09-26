// Progress (for the child, pictures only): Pup's path, paw calendar, two trophies.
import { getState } from '../store.js';
import { go } from '../router.js';
import { toLocalDateStr, addDays, weekStart, parseLocalDateStr } from '../logic/dates.js';
import { weekPaws, activeDates, starWeeks } from '../logic/streak.js';
import { stageForXp } from '../logic/rewards.js';
import { bestValue } from '../logic/stats.js';
import { PET_STAGES } from '../catalog.js';
import { sounds } from '../platform/audio.js';
import { speakLine } from '../ui/flow.js';
import { mountPup, mountExercisePic } from '../ui/pup.js';
import { $, el, clear } from '../ui/dom.js';
import { renderPaws } from './home.js';

let section;
const STOPS = [[24, 160], [72, 110], [120, 80], [168, 130], [228, 92], [290, 50]];
const ROAD = 'M24 160 C 60 160, 50 100, 72 110 S 100 70, 120 80 S 150 140, 168 130 S 210 80, 228 92 S 270 50, 290 50';
const SVG_NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs) => { const n = document.createElementNS(SVG_NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };

function renderPath(st) {
  const box = clear($('#prog-path', section));
  const stage = stageForXp(st.pet.xp).index;
  const svg = svgEl('svg', { class: 'path', viewBox: '0 0 311 200', width: '100%' });
  svg.appendChild(svgEl('path', { d: ROAD, fill: 'none', stroke: '#EADBC8', 'stroke-width': 22, 'stroke-linecap': 'round' }));
  svg.appendChild(svgEl('path', { d: ROAD, fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-dasharray': '2 12', 'stroke-linecap': 'round' }));
  STOPS.forEach(([x, y], i) => {
    const g = svgEl('g', { class: 'stop ' + (i < stage ? 'is-done' : i === stage ? 'is-current' : 'is-future') });
    g.appendChild(svgEl('circle', { cx: x, cy: y, r: 16 }));
    const t = svgEl('text', { x, y: y + 6 }); t.textContent = i <= stage ? String(i + 1) : '?';
    g.appendChild(t);
    svg.appendChild(g);
  });
  box.appendChild(svg);
  const mini = el('div', { class: 'path-pup pup-wrap', style: { '--pup-size': '64px' } });
  box.appendChild(mini);
  mountPup(mini, stage + 1, 'idle');
  const place = () => {
    const s = svg.clientWidth / 311;
    const [x, y] = STOPS[stage];
    mini.style.left = (16 + x * s) + 'px';
    mini.style.translate = '-50% 0';
    mini.style.top = (16 + y * s - 64 - 12) + 'px';
  };
  requestAnimationFrame(place);
  box.appendChild(el('div', { class: 'hint', style: { textAlign: 'center' } }, PET_STAGES[stage].name));
}

function renderCalendar(st) {
  const box = clear($('#prog-cal', section));
  const today = toLocalDateStr();
  const paws = el('div', { class: 'paws paws--big', style: { justifyContent: 'center' } });
  renderPaws(paws, weekPaws(st.sessions, today), today);
  box.appendChild(paws);

  const d = parseLocalDateStr(today);
  const monthName = d.toLocaleDateString(undefined, { month: 'long' });
  box.appendChild(el('div', { class: 'month-title' }, monthName));
  const grid = el('div', { class: 'month-grid' });
  ['M', 'T', 'W', 'T', 'F', 'S', 'S', ''].forEach((h) => grid.appendChild(el('div', { class: 'hd' }, h)));
  const act = activeDates(st.sessions);
  const stars = new Set(starWeeks(st.sessions));
  const first = `${today.slice(0, 7)}-01`;
  const monthPrefix = today.slice(0, 7);
  let lastDay = first;
  while (addDays(lastDay, 1).startsWith(monthPrefix)) lastDay = addDays(lastDay, 1);
  for (let wk = weekStart(first); wk <= lastDay; wk = addDays(wk, 7)) {
    for (let i = 0; i < 7; i++) {
      const day = addDays(wk, i);
      if (!day.startsWith(monthPrefix)) { grid.appendChild(el('div', { class: 'd blank' })); continue; }
      const a = act.get(day);
      const cls = ['d'];
      if (a) cls.push(a.plank && a.squat ? 'is-double' : 'is-done');
      if (day === today) cls.push('is-today');
      grid.appendChild(el('div', { class: cls.join(' ') }, a ? (a.plank && a.squat ? '🐾🐾' : '🐾') : String(Number(day.slice(8)))));
    }
    grid.appendChild(el('div', { class: 'star' }, stars.has(wk) ? '⭐' : ''));
  }
  box.appendChild(grid);
}

function renderTrophies(st) {
  const box = clear($('#prog-trophies', section));
  for (const ex of ['plank', 'squat']) {
    const best = bestValue(st.sessions, ex);
    const n = best === null ? null : ex === 'plank' ? Math.floor(best / 1000) : best;
    const pic = el('div', { class: 'pic ex-' + ex });
    const t = el('button', { class: 'trophy', type: 'button', 'aria-label': ex },
      el('div', { class: 'top' }, '🏆', pic),
      el('div', { class: 'num' }, n === null ? '?' : String(n)),
      el('div', { class: 'unit' }, ex === 'plank' ? 'sec' : 'squats'));
    mountExercisePic(pic, ex, stageForXp(st.pet.xp).index + 1).style.width = '54px';
    t.addEventListener('click', () => {
      sounds.tap();
      if (n === null) speakLine('noTrophyYet', {}, { bubbleOnly: false, silentBubble: true });
      else speakLine(ex === 'plank' ? 'bestPlankTrophy' : 'bestSquatTrophy', { n }, { silentBubble: true });
    });
    box.appendChild(t);
  }
}

export default {
  id: 'progress',
  mount(sectionEl) {
    section = sectionEl;
    $('#prog-home', section).addEventListener('click', () => go('home'));
  },
  canEnter() { const m = getState().meta; return m.onboarded && m.metPup; },
  show() {
    const st = getState();
    renderPath(st);
    renderCalendar(st);
    renderTrophies(st);
  },
};
