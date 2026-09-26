// Parent Corner (behind the grown-up gate): numbers, charts, settings, backup, diagnostics.
import { APP_VERSION, EXERCISES, TIMING, UI } from '../config.js';
import { PRIZES, CATALOG, STICKER_PAGES } from '../catalog.js';
import { app, getState, setState, update } from '../store.js';
import { go } from '../router.js';
import { toLocalDateStr, daysBetween } from '../logic/dates.js';
import { dadStats, dailySeries } from '../logic/stats.js';
import { setGoalManually, clampGoal } from '../logic/goal.js';
import { makeBackup, backupFilename, parseBackup } from '../logic/backup.js';
import { defaultState, saveSafetyCopy } from '../storage.js';
import { sounds, setSoundEnabled, unlockAudio } from '../platform/audio.js';
import { say, setSpeechEnabled, speechSupported, unlockSpeech } from '../platform/speech.js';
import { wakeLockSupported, lastWakeLockError, lastWakeLockOk } from '../platform/wakelock.js';
import { isStandalone, isPersisted, shareOrDownloadText, copyText } from '../platform/device.js';
import { mountPup, stageNumForXp } from '../ui/pup.js';
import { $, el, clear } from '../ui/dom.js';

let section, body;
const SVG_NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(SVG_NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
const fmtVal = (ex, v) => (v === null || v === undefined ? '–' : ex === 'plank' ? `${Math.round(v / 1000)} s` : String(v));

function row(label, ...right) { return el('div', { class: 'pc-row' }, el('span', { class: 'grow' }, label), ...right); }
function label(text) { return el('span', { class: 'pc-label' }, text); }
function group(...rows) { return el('div', { class: 'pc-group' }, ...rows); }

function stepper(text, onStep) {
  return el('div', { class: 'stepper' },
    el('button', { type: 'button', 'aria-label': 'Less', onclick: () => onStep(-1) }, '−'),
    el('output', {}, text),
    el('button', { type: 'button', 'aria-label': 'More', onclick: () => onStep(1) }, '+'));
}
function seg(options, current, onPick) {
  return el('div', { class: 'seg' }, options.map(([val, txt]) =>
    el('button', { type: 'button', 'aria-pressed': String(val === current), onclick: () => onPick(val) }, txt)));
}
function toggle(checked, onChange) {
  const input = el('input', { type: 'checkbox' });
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  return el('label', { class: 'switch' }, input, el('span'));
}

// ---------- 30-day bar chart (01 §4.8) ----------
function chart(ex, st, today) {
  const series = dailySeries(st.sessions, ex, today, UI.chartDays);
  const goal = st.settings.goals[ex].current;
  const vals = series.map((d) => d.main ?? d.best).filter((v) => v !== null);
  const maxV = Math.max(goal * 1.25, ...vals, 1);
  const color = ex === 'plank' ? 'var(--plank)' : 'var(--squat)';
  const svg = svgEl('svg', { class: 'chart', viewBox: '0 0 311 160', role: 'img', 'aria-label': `${ex} last 30 days` });
  const step = 311 / UI.chartDays;
  series.forEach((d, i) => {
    const x = i * step + 1.7;
    const v = d.main ?? d.best;
    if (v === null) { svg.appendChild(svgEl('circle', { cx: x + 3.5, cy: 126, r: 2.5, fill: 'var(--empty-line)' })); return; }
    const h = Math.max(4, 120 * v / maxV);
    const isToday = d.date === today;
    const met = d.goal !== null && v >= d.goal;
    const bar = svgEl('rect', { class: 'bar', x, y: 130 - h, width: 7, height: h, rx: 3.5,
      fill: isToday ? 'var(--sun)' : color, opacity: isToday || met ? 1 : 0.45 });
    bar.style.animationDelay = (i * 15) + 'ms';
    const t = svgEl('title'); t.textContent = `${d.date}: ${fmtVal(ex, v)}`; bar.appendChild(t);
    svg.appendChild(bar);
  });
  const gy = 130 - 120 * goal / maxV;
  svg.appendChild(svgEl('line', { x1: 0, x2: 311, y1: gy, y2: gy, stroke: 'var(--ink-faint)', 'stroke-width': 2, 'stroke-dasharray': '6 6' }));
  series.forEach((d, i) => {
    if ((UI.chartDays - 1 - i) % 7 !== 0) return;
    const last = i === UI.chartDays - 1;
    const t = svgEl('text', { x: last ? 311 : i * step + 5, y: 152, 'font-size': 11, fill: 'var(--ink-soft)', 'text-anchor': last ? 'end' : i === 0 ? 'start' : 'middle' });
    t.textContent = `${Number(d.date.slice(8))}/${Number(d.date.slice(5, 7))}`;
    svg.appendChild(t);
  });
  return el('div', { class: 'chart-wrap' }, svg);
}

function exerciseBlock(ex, st, stats, today) {
  const s = stats[ex];
  return group(
    row('Personal best', el('span', { class: 'val' }, fmtVal(ex, s.best))),
    row('Current goal', el('span', { class: 'val' }, fmtVal(ex, s.goal) + (st.settings.goals[ex].mode === 'manual' ? ' (fixed)' : ''))),
    row('7-day average', el('span', { class: 'val' }, fmtVal(ex, s.avg7))),
    row('Days this month', el('span', { class: 'val' }, String(s.month))),
    chart(ex, st, today));
}

function goalRows(ex, st, today) {
  const E = EXERCISES[ex];
  const isPlank = ex === 'plank';
  const cap = isPlank ? st.settings.plank.capMs : st.settings.squat.capReps;
  const goal = st.settings.goals[ex];
  const name = isPlank ? 'Plank' : 'Squat';
  return [
    row(el('span', {}, `${name} goal`, el('span', { class: 'sub' }, goal.mode === 'auto' ? 'Grows by itself after 3 goal days' : 'Fixed: stays where you set it')),
      stepper(fmtVal(ex, goal.current), (d) => rerender(setGoalManually(getState(), ex, goal.current + d * E.manualGoalStep, goal.mode, today)))),
    row(`${name} goal mode`, seg([['auto', 'Grows'], ['manual', 'Fixed']], goal.mode,
      (m) => rerender(setGoalManually(getState(), ex, goal.current, m, today)))),
    row(el('span', {}, `${name} maximum`, el('span', { class: 'sub' }, 'Auto-finishes as a win here')),
      stepper(fmtVal(ex, cap), (d) => {
        const s = structuredClone(getState());
        const next = Math.min(E.capMax, Math.max(E.capMin, cap + d * E.capStep));
        if (isPlank) s.settings.plank.capMs = next; else s.settings.squat.capReps = next;
        s.settings.goals[ex].current = clampGoal(ex, s.settings.goals[ex].current, next);
        rerender(s);
      })),
  ];
}

function tempoRow(st) {
  const T = TIMING.squat;
  const range = el('input', { type: 'range', min: T.beatMinMs, max: T.beatMaxMs, step: T.beatStepMs, 'aria-label': 'Squat tempo' });
  range.value = String(st.settings.squat.beatMs);
  const out = el('span', { class: 'val' }, (st.settings.squat.beatMs / 1000).toFixed(2) + ' s');
  const mini = el('div', { class: 'pup-wrap', style: { '--pup-size': '56px' } });
  const pup = mountPup(mini, stageNumForXp(st.pet.xp), 'squat');
  const apply = (ms) => { mini.style.setProperty('--beat', ms + 'ms'); pup.style.setProperty('--beat', ms + 'ms'); };
  apply(st.settings.squat.beatMs);
  range.addEventListener('input', () => { apply(Number(range.value)); out.textContent = (Number(range.value) / 1000).toFixed(2) + ' s'; });
  range.addEventListener('change', () => update((s) => { s.settings.squat.beatMs = Number(range.value); }));
  return el('div', { class: 'pc-row' },
    el('span', { style: { width: '100%' } }, 'Squat tempo (seconds per squat)',
      el('span', { class: 'sub' }, 'Slower if your child lags behind Pup, faster if bored. Watch the mini Pup.')),
    mini, el('span', { class: 'hint' }, 'fast'), range, el('span', { class: 'hint' }, 'slow'), out);
}

function nameRow(title, key, max) {
  const st = getState();
  const input = el('input', { class: 'text-input', maxlength: max, autocomplete: 'off', spellcheck: 'false', style: { height: '44px', fontSize: '16px' } });
  input.value = st.settings[key];
  const save = el('button', { type: 'button', class: 'btn btn-parent small', onclick: () => {
    const v = input.value.trim().slice(0, max);
    if (!v) { input.value = getState().settings[key]; return; }
    update((s) => { s.settings[key] = v; });
    save.textContent = '✓';
    setTimeout(() => { save.textContent = 'Save'; }, 1200);
  } }, 'Save');
  return el('div', { class: 'pc-row' }, el('span', { style: { width: '100%' } }, title), input, save);
}

function prizeBlock(st) {
  const pp = st.settings.pagePrize;
  const rows = [
    el('div', { class: 'pc-row' },
      el('span', { style: { width: '100%' } }, 'Page prize', el('span', { class: 'sub' }, 'A real-life treat when a sticker page fills up. Pick things you do together, not toys.')),
      seg([['off', 'Off'], ['page', 'Page'], ['twoPages', '2 pages'], ['book', 'Book']], pp.mode,
        (m) => { update((s) => { s.settings.pagePrize.mode = m; }); rerender(); })),
  ];
  if (pp.mode !== 'off') {
    rows.push(el('div', { class: 'pc-row' }, el('div', { class: 'btn-row' },
      PRIZES.map((p) => el('button', { type: 'button', class: 'btn btn-parent small ' + (pp.emoji === p.emoji ? '' : 'btn-parent--ghost'),
        'aria-label': p.label, onclick: () => { update((s) => { s.settings.pagePrize.emoji = p.emoji; s.settings.pagePrize.label = p.label; }); rerender(); } },
        p.emoji)))));
  }
  const open = st.prizes.filter((p) => !p.given);
  for (const p of open) {
    const i = st.prizes.indexOf(p);
    rows.push(row(`Prize to give: ${p.emoji} ${p.label || ''} (${STICKER_PAGES[p.pageIndex]?.emoji || ''} page, ${p.date})`,
      el('button', { type: 'button', class: 'btn btn-parent small', onclick: () => {
        update((s) => { s.prizes[i].given = true; s.prizes[i].givenDate = toLocalDateStr(); }); rerender();
      } }, '✓ Given')));
  }
  return group(...rows);
}

function backupBlock(st) {
  const msg = el('div', { class: 'note ok', hidden: true });
  const show = (text, ok = true) => { msg.textContent = text; msg.className = 'note' + (ok ? ' ok' : ''); msg.hidden = false; };
  const markBackedUp = () => update((s) => { s.meta.lastBackupAt = new Date().toISOString(); });

  const saveBtn = el('button', { type: 'button', class: 'btn btn-parent' }, '💾 Save backup file');
  saveBtn.addEventListener('click', () => {
    // synchronous up to navigator.share (iOS drops the gesture after an await)
    const text = JSON.stringify(makeBackup(getState()), null, 2);
    shareOrDownloadText(text, backupFilename(), 'application/json').then((r) => {
      if (r !== 'cancelled') { markBackedUp(); show(r === 'shared' ? 'Backup shared. Choose "Save to Files" to keep it.' : 'Backup file downloaded.'); }
    });
  });
  const copyBtn = el('button', { type: 'button', class: 'btn btn-parent btn-parent--ghost' }, '📋 Copy backup text');
  const fallback = el('textarea', { class: 'text-area', readonly: true, hidden: true });
  copyBtn.addEventListener('click', async () => {
    const text = JSON.stringify(makeBackup(getState()));
    if (await copyText(text)) { markBackedUp(); show('Copied! Paste it into Notes or an email to yourself.'); }
    else { fallback.value = text; fallback.hidden = false; fallback.focus(); fallback.select(); show('Copy the text below by hand.', false); }
  });

  const confirmBox = el('div');
  const offerRestore = (parsed) => {
    clear(confirmBox);
    if (!parsed.ok) { show(parsed.error, false); return; }
    const s = parsed.summary;
    const replace = el('button', { type: 'button', class: 'btn btn-parent' }, 'Replace current data');
    replace.addEventListener('click', () => {
      if (!confirm('Replace everything on this phone with the backup?')) return;
      saveSafetyCopy(getState(), 'before-import');
      setState(parsed.state);
      location.reload();
    });
    confirmBox.append(el('div', { class: 'note' },
      `Backup: ${s.sessions} exercises, ${s.stickers} stickers, ${s.firstDate || '–'} → ${s.lastDate || '–'}, child: ${s.childName || '–'}, pet: ${s.petName}`), replace);
  };
  const file = el('input', { type: 'file', accept: '.json,application/json,text/plain', style: { display: 'none' } });
  file.addEventListener('change', async () => { const f = file.files[0]; if (f) offerRestore(parseBackup(await f.text())); file.value = ''; });
  const fileBtn = el('button', { type: 'button', class: 'btn btn-parent btn-parent--ghost', onclick: () => file.click() }, '📂 Restore from file');
  const paste = el('textarea', { class: 'text-area', placeholder: 'Or paste backup text here' });
  const pasteBtn = el('button', { type: 'button', class: 'btn btn-parent btn-parent--ghost', onclick: () => offerRestore(parseBackup(paste.value)) }, 'Restore pasted text');

  const last = st.meta.lastBackupAt;
  const age = last ? daysBetween(toLocalDateStr(new Date(last)), toLocalDateStr()) : null;
  return el('div', {},
    el('div', { class: 'hint' }, `Last backup: ${last ? (age === 0 ? 'today' : `${age} days ago`) : 'never'}. Removing the app from the Home Screen erases progress. Export a backup first.`),
    el('div', { class: 'btn-row' }, saveBtn, copyBtn), fallback,
    el('div', { class: 'btn-row' }, fileBtn, file), paste, el('div', { class: 'btn-row' }, pasteBtn),
    msg, confirmBox);
}

async function diagnosticsBlock(st) {
  const box = group(
    row('App version', el('span', { class: 'val' }, APP_VERSION)),
    row('Installed on Home Screen', el('span', { class: 'val' }, isStandalone() ? 'yes' : 'no')),
    row('Storage kept safe (persisted)', el('span', { class: 'val', 'data-persist': true }, '…')),
    row('Keep screen on', el('span', { class: 'val' }, !wakeLockSupported ? 'not supported' : lastWakeLockError && !lastWakeLockOk ? `failed (${lastWakeLockError})` : 'supported')),
    row('Speech', el('span', { class: 'val' }, speechSupported ? 'supported' : 'not supported (tones only)')),
    row('Saved exercises', el('span', { class: 'val' }, String(st.sessions.length))),
    row('Test sound', el('button', { type: 'button', class: 'btn btn-parent small', onclick: () => {
      unlockAudio(); unlockSpeech(); sounds.chime(); setTimeout(() => say(`Hi ${getState().settings.childName || 'friend'}!`), 300);
    } }, '🔊 Test')));
  isPersisted().then((p) => { const n = box.querySelector('[data-persist]'); if (n) n.textContent = p ? 'yes' : 'not yet'; });
  const notes = [];
  if (!wakeLockSupported || (lastWakeLockError && !lastWakeLockOk)) {
    notes.push(el('div', { class: 'note' }, 'The screen may turn off during exercise. Set Settings → Display & Brightness → Auto-Lock to 2 minutes or more.'));
  }
  return el('div', {}, box, ...notes);
}

async function render() {
  const st = getState();
  const today = toLocalDateStr();
  const stats = dadStats(st, today);
  const scroll = section.scrollTop;
  clear(body);

  const reminders = [];
  const last = st.meta.lastBackupAt;
  const age = last ? daysBetween(toLocalDateStr(new Date(last)), today) : null;
  if (st.sessions.length >= UI.backupReminderMinSessions && (age === null || age > UI.backupReminderDays)) {
    reminders.push(el('div', { class: 'note' }, `Last backup: ${age === null ? 'never' : age + ' days ago'}. Save one below (Data).`));
  }
  if (app.loadStatus === 'corrupt' || app.loadStatus === 'newer') {
    reminders.push(el('div', { class: 'note' }, 'Saved data could not be read at start-up. A copy was kept. Restore a backup below.'));
  }

  body.append(
    ...reminders,
    label('Overview'),
    group(
      row('Total exercise days', el('span', { class: 'val' }, String(stats.totalDays))),
      row('This week', el('span', { class: 'val' }, `${stats.thisWeek} / 7`)),
      row('Double days this month', el('span', { class: 'val' }, String(stats.doubleDaysThisMonth))),
      row('Streak (1 rest day allowed)', el('span', { class: 'val' }, `${stats.streakCurrent} (best ${stats.streakBest})`)),
      row('Pup treats', el('span', { class: 'val' }, String(st.pet.xp)))),
    label('Plank'), exerciseBlock('plank', st, stats, today),
    label('Squats'), exerciseBlock('squat', st, stats, today),
    label('Goals'), group(...goalRows('plank', st, today), ...goalRows('squat', st, today)),
    label('Settings'),
    group(
      nameRow("Child's name", 'childName', 20),
      nameRow('Pet name', 'petName', 12),
      tempoRow(st),
      row('Count squats out loud', toggle(st.settings.squat.countAloud, (v) => update((s) => { s.settings.squat.countAloud = v; }))),
      row('Get-ready countdown', seg(TIMING.countdownOptionsSec.map((n) => [n, n + ' s']), st.settings.countdownSec,
        (n) => { update((s) => { s.settings.countdownSec = n; }); rerender(); })),
      row('Sounds', toggle(st.settings.soundOn, (v) => { update((s) => { s.settings.soundOn = v; }); setSoundEnabled(v); })),
      row("Pup's voice", toggle(st.settings.speechOn, (v) => { update((s) => { s.settings.speechOn = v; }); setSpeechEnabled(v); }))),
    label('Page prize'), prizeBlock(st),
    label('Data'), backupBlock(st),
    label('Diagnostics'), await diagnosticsBlock(st),
    label('Start over'),
    el('div', { class: 'btn-row' }, el('button', { type: 'button', class: 'btn btn-parent btn-parent--danger', onclick: resetAll }, 'Reset all data')),
    el('div', { class: 'pc-footer' }, `Plank Pals ${APP_VERSION} · ${CATALOG.pages.length * 6} stickers · all data stays on this phone`));
  section.scrollTop = scroll;
}

function rerender(nextState) {
  if (nextState) setState(nextState);
  render();
}

function resetAll() {
  if (!confirm('Erase ALL progress, stickers and Pup? Save a backup first if you might want it back.')) return;
  if (!confirm('Really erase everything? This cannot be undone.')) return;
  saveSafetyCopy(getState(), 'before-reset');
  setState(defaultState());
  app.parentUntil = 0;
  location.replace(location.pathname + '#/setup');
  location.reload();
}

export default {
  id: 'parent',
  mount(sectionEl) {
    section = sectionEl;
    body = $('#pc-body', section);
    $('#pc-home', section).addEventListener('click', () => go('home'));
  },
  canEnter() { return performance.now() < app.parentUntil; },
  show() { section.scrollTop = 0; render(); },
};
