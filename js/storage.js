// js/storage.js — safe load/save with defaults, normalization, migrations, quarantine.
import { STORAGE_KEY, SCHEMA_VERSION, EXERCISES, TIMING } from './config.js';
import { isValidDateStr } from './logic/dates.js';

const isObj  = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isNum  = (v) => typeof v === 'number' && Number.isFinite(v);
const isStr  = (v) => typeof v === 'string';
const isBool = (v) => typeof v === 'boolean';
const clamp  = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const roundTo = (n, step) => Math.round(n / step) * step;

export function defaultState(nowIso = new Date().toISOString()) {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: nowIso,
    settings: {
      childName: '',
      petName: 'Pup',
      soundOn: true,
      speechOn: true,
      countdownSec: TIMING.defaultCountdownSec,
      plank: { capMs: EXERCISES.plank.defaultCap },
      squat: { capReps: EXERCISES.squat.defaultCap, beatMs: TIMING.squat.defaultBeatMs, countAloud: true },
      goals: {
        plank: { mode: 'auto', current: EXERCISES.plank.defaultGoal },
        squat: { mode: 'auto', current: EXERCISES.squat.defaultGoal },
      },
      goalRules: {
        plank: { raiseAfterHits: EXERCISES.plank.defaultRaiseAfterHits, lowerAfterMisses: EXERCISES.plank.defaultLowerAfterMisses },
        squat: { raiseAfterHits: EXERCISES.squat.defaultRaiseAfterHits, lowerAfterMisses: EXERCISES.squat.defaultLowerAfterMisses },
      },
      pagePrize: { mode: 'off', emoji: '🍦', label: '' },
    },
    goalProgress: {
      plank: { hits: 0, misses: 0, lastChangedDate: null },
      squat: { hits: 0, misses: 0, lastChangedDate: null },
    },
    sessions: [],
    stickers: [],
    milestones: [],
    pendingStickerPick: null,
    pendingBigMoments: [],
    prizes: [],
    pet: { xp: 0 },
    meta: { onboarded: false, metPup: false, formTipsShown: { plank: 0, squat: 0 }, lastOfferOtherDate: null, lastBackupAt: null },
  };
}

// ---------- migrations ----------
// Key = the version you migrate FROM. Each step must return an object with schemaVersion = key + 1.
// Example for the future:
//   1: (s) => { s.settings.newThing = true; s.schemaVersion = 2; return s; },
const MIGRATIONS = {};

export function migrate(data) {
  if (!isObj(data)) throw new Error('state is not an object');
  let s = structuredClone(data);
  let v = Number.isInteger(s.schemaVersion) ? s.schemaVersion : 0;
  if (v === 0) { s.schemaVersion = 1; v = 1; }          // unversioned → treat as v1; normalize() fills the gaps
  if (v > SCHEMA_VERSION) throw new Error('newer-version');
  while (v < SCHEMA_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error('no migration from v' + v);
    s = step(s);
    if (s.schemaVersion !== v + 1) throw new Error('migration from v' + v + ' did not bump version');
    v = s.schemaVersion;
  }
  return s;
}

// ---------- normalize: fills gaps and drops garbage, field by field ----------
function normGoal(ex, g, capValue) {
  const E = EXERCISES[ex];
  const d = { mode: 'auto', current: Math.min(E.defaultGoal, capValue) };
  if (!isObj(g)) return d;
  return {
    mode: g.mode === 'manual' ? 'manual' : 'auto',
    current: isNum(g.current) ? clamp(roundTo(g.current, E.goalRoundTo), E.minGoal, capValue) : d.current,
  };
}
function normRules(ex, r) {
  const E = EXERCISES[ex];
  r = isObj(r) ? r : {};
  return {
    raiseAfterHits: isNum(r.raiseAfterHits) ? clamp(Math.round(r.raiseAfterHits), 1, 10) : E.defaultRaiseAfterHits,
    lowerAfterMisses: isNum(r.lowerAfterMisses) ? clamp(Math.round(r.lowerAfterMisses), 0, 10) : E.defaultLowerAfterMisses,
  };
}
function normProgress(p) {
  p = isObj(p) ? p : {};
  return {
    hits: isNum(p.hits) ? Math.max(0, Math.round(p.hits)) : 0,
    misses: isNum(p.misses) ? Math.max(0, Math.round(p.misses)) : 0,
    lastChangedDate: isValidDateStr(p.lastChangedDate) ? p.lastChangedDate : null,
  };
}
function normSession(x) {
  if (!isObj(x) || !isValidDateStr(x.date)) return null;
  const exercise = x.exercise === 'squat' ? 'squat' : 'plank';     // sessions without "exercise" are planks
  const base = {                                                   // key order matches applySession's sessions
    id: isStr(x.id) ? x.id : 's' + Math.random().toString(36).slice(2, 10),
    exercise,
    date: x.date,
    startedAt: isStr(x.startedAt) ? x.startedAt : null,
    attempt: x.attempt === 'extra' ? 'extra' : 'main',
  };
  if (exercise === 'plank') {
    if (!isNum(x.durationMs) || x.durationMs < 0 || x.durationMs > 600000) return null;
    const goalMs = isNum(x.goalMs) ? x.goalMs : EXERCISES.plank.defaultGoal;
    return { ...base, durationMs: Math.round(x.durationMs), goalMs,
      beatGoal: isBool(x.beatGoal) ? x.beatGoal : x.durationMs >= goalMs,
      beatBest: isBool(x.beatBest) ? x.beatBest : false,
      autoFinished: x.autoFinished === true };
  }
  if (!isNum(x.reps) || x.reps < 0 || x.reps > 500) return null;
  const goalReps = isNum(x.goalReps) ? x.goalReps : EXERCISES.squat.defaultGoal;
  return { ...base, reps: Math.round(x.reps), goalReps,
    beatGoal: isBool(x.beatGoal) ? x.beatGoal : x.reps >= goalReps,
    beatBest: isBool(x.beatBest) ? x.beatBest : false,
    countedReps: isNum(x.countedReps) ? Math.round(x.countedReps) : Math.round(x.reps),
    beatMs: isNum(x.beatMs) ? x.beatMs : TIMING.squat.defaultBeatMs };
}

export function normalize(input) {
  const d = defaultState();
  const s = isObj(input) ? input : {};
  const st = isObj(s.settings) ? s.settings : {};
  const P = EXERCISES.plank, Q = EXERCISES.squat;
  const capMs   = isNum(st.plank?.capMs)   ? clamp(roundTo(st.plank.capMs, P.capStep), P.capMin, P.capMax) : P.defaultCap;
  const capReps = isNum(st.squat?.capReps) ? clamp(Math.round(st.squat.capReps), Q.capMin, Q.capMax)    : Q.defaultCap;
  const T = TIMING.squat;
  const meta = isObj(s.meta) ? s.meta : {};
  const tips = isObj(meta.formTipsShown) ? meta.formTipsShown : {};
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: isStr(s.createdAt) ? s.createdAt : d.createdAt,
    settings: {
      childName: isStr(st.childName) ? st.childName.trim().slice(0, 20) : '',
      petName: isStr(st.petName) && st.petName.trim() ? st.petName.trim().slice(0, 12) : 'Pup',
      soundOn: isBool(st.soundOn) ? st.soundOn : true,
      speechOn: isBool(st.speechOn) ? st.speechOn : true,
      countdownSec: TIMING.countdownOptionsSec.includes(st.countdownSec) ? st.countdownSec : TIMING.defaultCountdownSec,
      plank: { capMs },
      squat: {
        capReps,
        beatMs: isNum(st.squat?.beatMs) ? clamp(roundTo(st.squat.beatMs, T.beatStepMs), T.beatMinMs, T.beatMaxMs) : T.defaultBeatMs,
        countAloud: isBool(st.squat?.countAloud) ? st.squat.countAloud : true,
      },
      goals: {
        plank: normGoal('plank', st.goals?.plank, capMs),
        squat: normGoal('squat', st.goals?.squat, capReps),
      },
      goalRules: { plank: normRules('plank', st.goalRules?.plank), squat: normRules('squat', st.goalRules?.squat) },
      pagePrize: {
        mode: ['off', 'page', 'twoPages', 'book'].includes(st.pagePrize?.mode) ? st.pagePrize.mode : 'off',
        emoji: isStr(st.pagePrize?.emoji) && st.pagePrize.emoji ? st.pagePrize.emoji.slice(0, 8) : '🍦',
        label: isStr(st.pagePrize?.label) ? st.pagePrize.label.slice(0, 30) : '',
      },
    },
    goalProgress: { plank: normProgress(s.goalProgress?.plank), squat: normProgress(s.goalProgress?.squat) },
    sessions: Array.isArray(s.sessions) ? s.sessions.map(normSession).filter(Boolean) : [],
    stickers: Array.isArray(s.stickers)
      ? s.stickers.filter((x) => isObj(x) && isStr(x.id) && isValidDateStr(x.date))
          .map((x) => ({ id: x.id, book: isNum(x.book) && x.book >= 1 ? Math.round(x.book) : 1, date: x.date, gold: x.gold === true }))
      : [],
    milestones: Array.isArray(s.milestones)
      ? s.milestones.filter((x) => isObj(x) && isStr(x.id) && isValidDateStr(x.date)).map((x) => ({ id: x.id, date: x.date }))
      : [],
    pendingStickerPick: isObj(s.pendingStickerPick) && Array.isArray(s.pendingStickerPick.choices)
      && s.pendingStickerPick.choices.length && isValidDateStr(s.pendingStickerPick.date)
      ? { date: s.pendingStickerPick.date, book: s.pendingStickerPick.book || 1, pageIndex: s.pendingStickerPick.pageIndex || 0,
          choices: s.pendingStickerPick.choices.filter(isStr), gold: s.pendingStickerPick.gold === true }
      : null,
    pendingBigMoments: Array.isArray(s.pendingBigMoments) ? s.pendingBigMoments.filter((m) => isObj(m) && isStr(m.type)) : [],
    prizes: Array.isArray(s.prizes) ? s.prizes.filter(isObj) : [],
    pet: { xp: isNum(s.pet?.xp) ? Math.max(0, Math.round(s.pet.xp)) : 0 },
    meta: {
      onboarded: meta.onboarded === true,
      metPup: meta.metPup === true,
      formTipsShown: { plank: isNum(tips.plank) ? tips.plank : 0, squat: isNum(tips.squat) ? tips.squat : 0 },
      lastOfferOtherDate: isValidDateStr(meta.lastOfferOtherDate) ? meta.lastOfferOtherDate : null,
      lastBackupAt: isStr(meta.lastBackupAt) ? meta.lastBackupAt : null,
    },
  };
}

// ---------- storage access ----------
export function safeLocalStorage() {
  try {
    const s = window.localStorage;
    s.setItem('__probe', '1'); s.removeItem('__probe');
    return s;
  } catch { return null; }
}

// For tests: an in-memory object with the same API as localStorage.
export function createMemoryStore(initial = {}) {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    keys: () => [...m.keys()],
  };
}

function quarantine(store, raw, reason) {
  try { store.setItem(`${STORAGE_KEY}.quarantine.${Date.now()}`, JSON.stringify({ reason, raw })); } catch { /* ignore */ }
}

/** @returns {{ state: object, status: 'new'|'ok'|'corrupt'|'newer'|'unavailable' }} */
export function loadState(store = safeLocalStorage()) {
  if (!store) return { state: defaultState(), status: 'unavailable' };
  let raw;
  try { raw = store.getItem(STORAGE_KEY); } catch { return { state: defaultState(), status: 'unavailable' }; }
  if (raw == null) return { state: defaultState(), status: 'new' };
  let parsed;
  try { parsed = JSON.parse(raw); } catch { quarantine(store, raw, 'bad-json'); return { state: defaultState(), status: 'corrupt' }; }
  try {
    return { state: normalize(migrate(parsed)), status: 'ok' };
  } catch (e) {
    quarantine(store, raw, String(e.message));
    if (e.message === 'newer-version') return { state: normalize(parsed), status: 'newer' }; // best effort, raw copy kept
    return { state: defaultState(), status: 'corrupt' };
  }
}

/** @returns {boolean} true if saved */
export function saveState(state, store = safeLocalStorage()) {
  if (!store) return false;
  try { store.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch (e) { console.error('saveState failed', e); return false; }
}

/** Keeps one safety copy before an import or a reset. */
export function saveSafetyCopy(state, label, store = safeLocalStorage()) {
  if (!store) return false;
  try { store.setItem(`${STORAGE_KEY}.${label}`, JSON.stringify(state)); return true; } catch { return false; }
}
