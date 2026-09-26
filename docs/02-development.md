# 02 — Development: Architecture & Implementation Guide

> Author: Development agent. Audience: **Claude Sonnet**, building the app step by step.
> Screen names follow the brief: **Home**, **Plank**, **Squats**, **Celebrate**, **Sticker Book**, **Progress**, **Parent Corner**. There are also two first-launch screens: **Setup** (for Dad) and **Meet Pup** (for Mia).
> **Who owns what:** `01-design.md` owns visuals, SVG art, CSS tokens and animation. `03-kid-experience.md` owns flows, copy, reward rules and the kid-facing numbers. **This doc owns** data, logic, platform behaviour and the build order. All tunable numbers live in **one file, `js/config.js`**. If the final PLAN changes a number, change it **only there**.

---

## 0. Golden rules for the builder (read before every milestone)

1. **No framework, no npm, no build step.** Plain HTML + CSS + JavaScript ES modules, served as static files.
2. **All URLs are relative** (`./js/main.js`, `icons/icon-192.png`, never `/js/...`). The site lives at the sub-path `https://maxvdp-irl.github.io/mia-plank-pals/`.
3. **Never hardcode the child's name.** The repo is public. The name is typed at first launch and stored only in localStorage. Tests use `"TestKid"`.
4. **Logic in `js/logic/` is pure.** Those files never touch `document`, `window`, `localStorage`, `Date.now()` or `Math.random()` directly. Time (`now`), randomness (`rng`) and config are passed in. That is what makes them testable in `tests.html`.
5. **Dates are local `YYYY-MM-DD` strings** made by `toLocalDateStr()`. **Never** use `toISOString().slice(0, 10)`, because that gives the UTC date and breaks "today" in the evening.
6. **Never put user data in `innerHTML`.** Use `textContent` or `createElement`. (The pet name and child name are user input.)
7. **Every new file must be added to `ASSETS` in `sw.js`**, or the app breaks offline. `tests.html` checks this.
8. **Every milestone ends with `tests.html` all green** plus that milestone's "Done when" checks.
9. **Numbers go in `js/config.js`.** No magic numbers in screens or logic.
10. When a `hidden` element won't hide, the fix is the CSS rule `[hidden] { display: none !important; }` (already in §3.4).

---

## 1. Tech choice

**Vanilla HTML + CSS + JS (ES modules), no framework, no build, no dependencies.**

- **The app is small**: 9 screens, one data blob, no server. A framework adds build tooling, version drift and extra concepts, and none of that pays off here.
- **Weaker-model friendly**: there is nothing to install or configure, and no bundler errors. Every file maps 1:1 to what the browser runs, so a bug is always in a file Sonnet wrote.
- **iOS Safari has supported ES modules for years** (iOS 11+). Everything we use (`structuredClone`, Wake Lock, Web Share with files, `navigator.storage.persist`) is available on current iOS, and each is feature-detected with a fallback.
- **Offline PWA is trivial**: a static file list plus a 40-line service worker. There are no hashed bundle names to track.
- **Hosting is `git push`**: GitHub Pages serves the repo root as-is.

**Rejected:** React/Vue/Svelte (need a build or a CDN, and a CDN breaks offline-first unless vendored); TypeScript (needs a compiler); Capacitor/native (needs the App Store and a Mac). A tiny store plus a hash router is ~60 lines, which is less than a framework's config.

**Limits:** ES modules need `http://` or `https://`, **not `file://`**. Always test through a local server (§11.1).

---

## 2. File and folder structure

The Git repo root **is** the website root (GitHub Pages, `main` branch, `/` root). The repo is `MaxVDP-IRL/mia-plank-pals`. The planning docs stay in `docs/` and are harmless.

```
mia-plank-pals/                    (repo root = the project folder "Plank Holding")
├── .nojekyll                      empty file: tells GitHub Pages to serve files as-is (no Jekyll)
├── index.html                     the only app page: <head> meta tags, one <section> per screen, <template id="pup-tpl">, splash
├── manifest.webmanifest           PWA manifest (§9.1)
├── sw.js                          service worker: versioned cache-first precache (§9.3)
├── tests.html                     runs all unit tests in the browser (§11.2)
├── PLAN.md                        consolidated build plan (not part of the app, not precached)
├── docs/                          planning docs (not part of the app, not precached)
├── css/
│   └── app.css                    design tokens (:root from 01-design §2.2) + base shell + all screen styles
├── icons/
│   ├── apple-touch-icon.png       180×180 (iOS home screen; iOS ignores SVG here)
│   ├── icon-192.png               192×192 (manifest)
│   ├── icon-512.png               512×512 (manifest, purpose "any maskable")
│   └── icon.svg                   source art from 01-design §9.1 (not precached)
├── js/
│   ├── main.js                    boot: load state, first-launch routing, register SW, request persistence, mount screens
│   ├── config.js                  ALL tunable numbers (§4.1) + APP_VERSION + STORAGE_KEY + SCHEMA_VERSION
│   ├── catalog.js                 sticker pages/ids/emoji, milestone stickers, Pup stages (data only)
│   ├── strings.js                 every spoken/shown line with {name}/{pup}/{n} placeholders + pickLine() + fill()
│   ├── storage.js                 safe load/save, defaults, normalize, migrations, quarantine (§3.3)
│   ├── store.js                   in-memory state + setState() that saves + `app` session context (§3.4)
│   ├── router.js                  hash router, show/hide sections, route guards (§8)
│   ├── logic/                     PURE functions only (tested in tests.html)
│   │   ├── dates.js               local date strings, daysBetween, addDays, weekStart
│   │   ├── stopwatch.js           createStopwatch(now)
│   │   ├── cues.js                plankCuesBetween, plankVisualState, squatCuesBetween, squatCountsToSpeak, squatDepth
│   │   ├── goal.js                nextGoalAfterMain, setGoalManually, stepFor, clampGoal
│   │   ├── streak.js              activeDates, computeStreak, weekPaws, starWeeks, totalActiveDays
│   │   ├── rewards.js             currentPage, makeStickerOffer, claimSticker, computeXp, stageForXp, milestonesDue, pickBigMoment
│   │   ├── session.js             attemptKindFor, canTryExtra, applySession (THE core function)
│   │   ├── stats.js               sessionValue, bestValue, dailySeries, dadStats
│   │   ├── backup.js              makeBackup, backupFilename, parseBackup
│   │   └── gate.js                makeGateQuestion, checkGateAnswer
│   ├── platform/                  browser APIs, each wrapped and feature-detected
│   │   ├── audio.js               Web Audio synth: unlockAudio(), sounds.*
│   │   ├── speech.js              speechSynthesis wrapper: initSpeech(), unlockSpeech(), say()
│   │   ├── wakelock.js            acquireWakeLock(), releaseWakeLock(), wakeLockSupported
│   │   └── device.js              isStandalone(), requestPersistence(), shareOrDownloadText(), copyText(), isLocalDev()
│   ├── ui/
│   │   ├── dom.js                 $(sel), el(tag, props, ...children), clear(node)
│   │   ├── pup.js                 mountPup(container, stage, mood, tpl), playTrick(), startSquatAnimation() from 01-design §5
│   │   ├── gateModal.js           openGate(): Promise<boolean> (hold 2 s + multiplication keypad)
│   │   └── flow.js                startExercise(), saveAndCelebrate(), speakLine() glue shared by screens
│   └── screens/                   one module per screen: { mount(sectionEl), show(), hide(), canEnter?() }
│       ├── setup.js  meet.js  home.js  plank.js  squats.js
│       └── celebrate.js  stickers.js  progress.js  parent.js
├── tests/
│   ├── harness.js                 tiny test runner (§11.2)
│   ├── dates.test.js  stopwatch.test.js  cues.test.js  goal.test.js  streak.test.js
│   ├── rewards.test.js  session.test.js  stats.test.js  storage.test.js  backup.test.js  gate.test.js
│   └── pwa.test.js                checks sw.js VERSION == APP_VERSION and every ASSETS file loads
└── tools/
    └── make-icons.html            one-time PNG generator from 01-design §9.2 (not precached)
```

**Screen module contract** (every file in `js/screens/`):
```js
export default {
  id: 'home',                 // matches <section id="screen-home">
  mount(sectionEl) {},        // called ONCE at boot: grab elements, bind event listeners
  show() {},                  // called every time the screen becomes visible: read getState(), render
  hide() {},                  // called when leaving: stop timers/animations, release wake lock
  canEnter() { return true }, // optional route guard; return false → router redirects to home
};
```
Each screen's markup is **static HTML inside its `<section>` in `index.html`** (the structure comes from 01-design §4). JS only fills in text, toggles classes, and clones templates.

---

## 3. Data model and storage

### 3.1 Principles
- **One localStorage key** holds **one JSON object**: `STORAGE_KEY = "plankPals.state"`.
- **Store facts, derive everything else.** Streaks, week paws, totals, personal bests and Pup's stage are **computed** from `sessions` and `pet.xp`. They are not stored, so they can never disagree with the data.
- The schema already includes **both exercises** from v1, so adding the Squats screen later needs **no migration**.

### 3.2 Schema v1 (exact shape, with an example)
```json
{
  "schemaVersion": 1,
  "createdAt": "2026-09-26T08:15:00.000Z",

  "settings": {
    "childName": "",
    "petName": "Pup",
    "soundOn": true,
    "speechOn": true,
    "countdownSec": 5,
    "plank": { "capMs": 60000 },
    "squat": { "capReps": 20, "beatMs": 2500, "countAloud": true },
    "goals": {
      "plank": { "mode": "auto", "current": 10000 },
      "squat": { "mode": "auto", "current": 5 }
    },
    "goalRules": {
      "plank": { "raiseAfterHits": 3, "lowerAfterMisses": 0 },
      "squat": { "raiseAfterHits": 3, "lowerAfterMisses": 0 }
    },
    "pagePrize": { "mode": "off", "emoji": "🍦", "label": "" }
  },

  "goalProgress": {
    "plank": { "hits": 1, "misses": 0, "lastChangedDate": null },
    "squat": { "hits": 0, "misses": 0, "lastChangedDate": null }
  },

  "sessions": [
    { "id": "smf3k2a1b", "exercise": "plank", "date": "2026-09-26", "startedAt": "2026-09-26T08:20:01.000Z",
      "attempt": "main", "durationMs": 12480, "goalMs": 10000, "beatGoal": true, "beatBest": false, "autoFinished": false },
    { "id": "smf3k9x7c", "exercise": "squat", "date": "2026-09-26", "startedAt": "2026-09-26T08:23:40.000Z",
      "attempt": "main", "reps": 6, "goalReps": 5, "beatGoal": true, "beatBest": false, "countedReps": 5, "beatMs": 2500 }
  ],

  "stickers": [ { "id": "garden-sunflower", "book": 1, "date": "2026-09-26", "gold": false } ],
  "milestones": [ { "id": "days-7", "date": "2026-10-03" } ],
  "pendingStickerPick": null,
  "pendingBigMoments": [],
  "prizes": [ { "book": 1, "pageIndex": 0, "date": "2026-10-02", "emoji": "🍦", "label": "", "given": false, "givenDate": null } ],

  "pet": { "xp": 28 },

  "meta": {
    "onboarded": true,
    "metPup": true,
    "formTipsShown": { "plank": 1, "squat": 1 },
    "lastOfferOtherDate": null,
    "lastBackupAt": null
  }
}
```

**Field notes**
| Field | Meaning |
|---|---|
| `settings.childName` | Typed in Setup. Max 20 chars. Empty string means "not set"; speech then uses "friend". |
| `settings.petName` | From Meet Pup cards or typed by Dad. Max 12 chars (03 §2). Default `"Pup"`. |
| `settings.countdownSec` | 3, 5 or 10. It's shared by both exercises. |
| `settings.plank.capMs` | Hard cap (auto-finish as a win) **and** the maximum goal. Range 30–90 s. |
| `settings.squat.capReps` | Hard cap **and** the maximum goal. Range 10–30. |
| `settings.squat.beatMs` | Squat-along tempo, 2000–3500 ms in 250 ms steps. |
| `settings.squat.countAloud` | Speak the numbers. When off (or speech is unavailable), it's tone-only (§6.3). |
| `settings.goals.<ex>.mode` | `"auto"` (grows by rule) or `"manual"` (Dad fixed it). |
| `settings.goals.<ex>.current` | Plank in **ms**, squat in **reps**. |
| `settings.goalRules.<ex>` | `raiseAfterHits`: main attempts meeting the goal before it grows. `lowerAfterMisses`: 0 = never lower automatically (the default). |
| `settings.pagePrize.mode` | `"off" \| "page" \| "twoPages" \| "book"` (03 §3.6). |
| `goalProgress.<ex>` | Counters since the last goal change. Main attempts only. |
| `sessions[].attempt` | `"main"` = first attempt of that exercise that day; `"extra"` = a "one more try". |
| `sessions[].beatGoal` | `value >= goal at that moment` (meeting it counts). |
| `sessions[].beatBest` | A previous session of that exercise existed **and** `value > previous best`. |
| `sessions[].countedReps` | What the metronome counted before Dad's −/+ correction. |
| `stickers[]` | Book stickers. `book` = 1, 2, 3… (book ≥ 2 renders gold/sparkly per 03 §3.1). One per exercise day. |
| `milestones[]` | The "Pup page" stickers, given automatically on total exercise days. |
| `pendingStickerPick` | `{ date, book, pageIndex, choices:[ids], gold }` while the face-down cards wait for a tap. It survives an app close. |
| `pendingBigMoments` | Tier-3 scenes queued for later (03 §3.4: max one per session). |
| `pet.xp` | "Treats". Stage is derived with `stageForXp()`. |

**Size:** a session is ~200 bytes. Two a day for 5 years is ~730 KB, well under Safari's ~5 MB localStorage quota.

### 3.3 `js/storage.js` (complete)
```js
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
  const d = { mode: 'auto', current: E.defaultGoal };
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
  const base = {
    id: isStr(x.id) ? x.id : 's' + Math.random().toString(36).slice(2, 10),
    date: x.date,
    startedAt: isStr(x.startedAt) ? x.startedAt : null,
    attempt: x.attempt === 'extra' ? 'extra' : 'main',
  };
  const exercise = x.exercise === 'squat' ? 'squat' : 'plank';     // sessions without "exercise" are planks
  if (exercise === 'plank') {
    if (!isNum(x.durationMs) || x.durationMs < 0 || x.durationMs > 600000) return null;
    const goalMs = isNum(x.goalMs) ? x.goalMs : EXERCISES.plank.defaultGoal;
    return { ...base, exercise, durationMs: Math.round(x.durationMs), goalMs,
      beatGoal: isBool(x.beatGoal) ? x.beatGoal : x.durationMs >= goalMs,
      beatBest: isBool(x.beatBest) ? x.beatBest : false,
      autoFinished: x.autoFinished === true };
  }
  if (!isNum(x.reps) || x.reps < 0 || x.reps > 500) return null;
  const goalReps = isNum(x.goalReps) ? x.goalReps : EXERCISES.squat.defaultGoal;
  return { ...base, exercise, reps: Math.round(x.reps), goalReps,
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
```

**Status handling in `main.js`:** `'corrupt'` or `'newer'` → show a Parent-Corner-style banner for Dad: "Saved data couldn't be read. A copy was kept. Restore from a backup in Parent Corner." Never show this to Mia as a failure; Pup behaves normally. `'unavailable'` → a banner: "This browser can't save progress (Private Browsing?)".

### 3.4 `js/store.js` (complete)
```js
import { loadState, saveState } from './storage.js';

let state = null;

// Session-only context (never saved)
export const app = {
  request: null,        // { exercise: 'plank'|'squat', attempt: 'main'|'extra' } set by the Start tap
  lastResult: null,     // result object from applySession(), consumed by Celebrate
  parentUntil: 0,       // performance.now() until which Parent Corner is unlocked
  updateReady: false,   // a new service worker took over; reload at the next Home visit
  loadStatus: 'new',
};

export function initStore() {
  const r = loadState();
  state = r.state;
  app.loadStatus = r.status;
  return r;
}
export function getState() { return state; }
export function setState(next) {
  state = next;
  const ok = saveState(next);
  if (!ok) document.dispatchEvent(new CustomEvent('storage-failed'));
  return ok;
}
/** Convenience: update(s => { s.settings.soundOn = false; }) */
export function update(mutator) {
  const draft = structuredClone(state);
  mutator(draft);
  return setState(draft);
}
```
`main.js` listens for `storage-failed` and shows a small banner for Dad: "Couldn't save! Storage full or blocked. Export a backup."

### 3.5 Persistence on iOS (important for Dad)
- **Add to Home Screen** makes storage much safer. Safari tabs can have script-written storage evicted after about 7 days without a visit. Home Screen web apps don't have that limit and keep their own storage.
- **The Home Screen app and Safari tabs have separate storage.** Data from testing in a Safari tab does not appear in the installed app, and the other way round. Tell Dad to use **only the Home Screen icon** for Mia. This is also handy: Dad can test in a Safari tab without touching Mia's data.
- **Deleting the Home Screen icon deletes its data.** Parent Corner shows: "Removing the app from the Home Screen erases progress. Export a backup first."
- At boot, **and** after the first saved session, call `requestPersistence()` (§7.4). It is a best-effort request; show the result in Parent Corner → Diagnostics.
- **The URL is the storage identity.** Never rename the repo or change the Pages URL. A new URL means an empty app (restore from a backup).

### 3.6 Backup: export and import (`js/logic/backup.js` complete; UI in Parent Corner)
```js
// js/logic/backup.js — pure
import { migrate, normalize } from '../storage.js';
import { toLocalDateStr } from './dates.js';

export const BACKUP_APP_ID = 'plank-pals';

export function makeBackup(state, now = new Date()) {
  return { app: BACKUP_APP_ID, kind: 'backup', exportedAt: now.toISOString(), schemaVersion: state.schemaVersion, data: state };
}
export function backupFilename(now = new Date()) {
  return `plank-pals-backup-${toLocalDateStr(now)}.json`;
}
/** Accepts the wrapper from makeBackup() OR a raw state object. */
export function parseBackup(text) {
  let obj;
  try { obj = JSON.parse(String(text).trim()); } catch { return { ok: false, error: 'This is not a backup file (not JSON).' }; }
  const data = obj && obj.app === BACKUP_APP_ID && obj.data ? obj.data : obj;
  if (!data || typeof data !== 'object' || !Array.isArray(data.sessions)) {
    return { ok: false, error: 'This file does not look like a Plank Pals backup.' };
  }
  try {
    const state = normalize(migrate(data));
    const dates = state.sessions.map((s) => s.date).sort();
    return { ok: true, state, summary: {
      sessions: state.sessions.length, stickers: state.stickers.length, treats: state.pet.xp,
      firstDate: dates[0] || null, lastDate: dates[dates.length - 1] || null,
      childName: state.settings.childName, petName: state.settings.petName } };
  } catch (e) {
    return { ok: false, error: e.message === 'newer-version'
      ? 'This backup is from a newer version of the app. Update the app first.' : 'The backup is damaged.' };
  }
}
```
(`storage.js` imports nothing from the DOM at module top level, so `backup.js` stays testable.)

**Parent Corner → Backup UI (exact behaviour)**
1. **"Save backup file"** button. In its click handler, **synchronously** (no `await` before `navigator.share`, or iOS drops the user gesture) call `shareOrDownloadText(JSON.stringify(makeBackup(state), null, 2), backupFilename(), 'application/json')` (§7.4). On iOS this opens the Share sheet → "Save to Files" / AirDrop / Mail. On success, set `meta.lastBackupAt`.
2. **"Copy backup text"** button → `copyText(text)`. On success, show "Copied! Paste it into Notes or an email to yourself." and set `meta.lastBackupAt`.
3. **"Restore from file"**: `<input type="file" accept=".json,application/json,text/plain">`, then `await file.text()` → `parseBackup`.
4. **"Restore from pasted text"**: a `<textarea>` (font-size ≥ 16px so iOS doesn't zoom) plus a "Restore" button → `parseBackup`.
5. After a successful parse, show the summary ("41 exercises, 12 stickers, 2026-09-26 → 2026-11-02, child: …, pet: …") and a **"Replace current data"** button, then a `confirm()` dialog. On confirm: `saveSafetyCopy(getState(), 'before-import')`, then `setState(parsed.state)`, then `location.reload()`.
6. A **backup reminder**: if `lastBackupAt` is null or more than 30 days old, and there are ≥ 5 sessions, Parent Corner shows a yellow note "Last backup: never / 34 days ago". It is **never shown to Mia**.

---

## 4. Core logic (pure functions)

### 4.1 `js/config.js` (complete; the single source of tunable numbers)
```js
// js/config.js
export const APP_VERSION = '1.0.0';               // MUST equal VERSION in sw.js (tests/pwa.test.js checks)
export const STORAGE_KEY = 'plankPals.state';
export const SCHEMA_VERSION = 1;

export const EXERCISES = {
  plank: {
    unit: 'ms',
    defaultGoal: 10000, minGoal: 5000, goalRoundTo: 1000, manualGoalStep: 1000,
    defaultCap: 60000, capMin: 30000, capMax: 90000, capStep: 5000,      // cap = auto-finish AND max goal
    goalSteps: [ { below: 30000, step: 2000 }, { below: null, step: 3000 } ], // +2 s up to 30 s, then +3 s
    lowerBy: 2000,
    defaultRaiseAfterHits: 3,
    defaultLowerAfterMisses: 0,                   // 0 = never lower automatically
  },
  squat: {
    unit: 'reps',
    defaultGoal: 5, minGoal: 3, goalRoundTo: 1, manualGoalStep: 1,
    defaultCap: 20, capMin: 10, capMax: 30, capStep: 1,
    goalSteps: [ { below: null, step: 1 } ],
    lowerBy: 1,
    defaultRaiseAfterHits: 3,
    defaultLowerAfterMisses: 0,
  },
};
export const GOAL_POLICY = {
  hitsMustBeConsecutive: false,   // false: "met the goal 3 times since the last change"; true: "3 in a row"
};

export const TIMING = {
  countdownOptionsSec: [3, 5, 10],
  defaultCountdownSec: 5,
  countdownTickFromSec: 3,        // tick tones + big digits for the last 3 s
  stopIgnoreMs: 600,              // taps in the first 0.6 s of running are ignored (double-tap guard)
  plank: {
    minValidMs: 2000,             // under this: only "try again" is offered (accidental tap)
    falseStartMs: 3000,           // under this: offer 🔁 try again (not saved) or ✅ count it
    boopEveryMs: 5000,
    midwayMinGoalMs: 8000,        // no midway cue for tiny goals
    nearGoalLeadMs: 3000,         // "Almost at the bone! 3… 2… 1…"
  },
  squat: {
    defaultBeatMs: 2500, beatMinMs: 2000, beatMaxMs: 3500, beatStepMs: 250,
    downFraction: 0.45, holdFraction: 0.10,       // pose: 45% down, 10% sit, 45% up
    minValidReps: 1,
    maxCorrectionAbove: 5,        // "+" can go at most 5 above the counted reps
    speechLeadMs: 200,            // start speaking the number slightly early to hide iOS speech lag
    speechMinBeatMs: 2000,        // faster than this → tone-only counting
    sparkleEvery: 5,
  },
};

export const STREAK = {
  restDaysAllowed: 1,             // Dad-only streak number: one missed day between exercise days doesn't break it
  weekStartsOn: 1,                // 1 = Monday (paw row resets Monday)
  starWeekMinDays: 5,             // 5+ exercise days in a Mon–Sun week = ⭐ week
};

export const REWARDS = {
  treats: {
    firstExerciseOfDay: 10,
    secondExercise: 5,            // main attempt of the other exercise, same day
    doubleDayBonus: 5,            // added on that same second exercise
    goal: 5,                      // once per exercise per day
    personalBest: 5,              // every attempt that sets a PB
    oneMoreTry: 3,                // extra attempt, max 1 per exercise per day
  },
  maxExtraPerExercisePerDay: 1,
  stickerChoices: 3,
  milestoneDays: [7, 14, 21, 30, 50, 75, 100],
  showOffEveryTreats: 150,        // after the final stage
  bigMomentPriority: ['bookFull', 'stageUp', 'pageFull', 'milestone'],
};

export const GATE = { holdMs: 2000, factorMin: 3, factorMax: 9, unlockMs: 5 * 60 * 1000 };

export const AUDIO = { masterGain: 0.35 };
export const SPEECH = { rate: 0.95, pitch: 1.3, preferredVoices: ['Samantha', 'Karen', 'Moira'], lang: 'en-US' };
```

### 4.2 `js/catalog.js` (data from 03 §3.1–3.2)
```js
import { REWARDS } from './config.js';

// 6 pages × 6 stickers. Store ONLY ids ("garden-sunflower"), never emoji.
export const STICKER_PAGES = [
  { id: 'garden',  emoji: '🌻', stickers: [['sunflower','🌻'],['butterfly','🦋'],['ladybug','🐞'],['rainbow','🌈'],['snail','🐌'],['mushroom','🍄']] },
  { id: 'ocean',   emoji: '🐳', stickers: [['fish','🐠'],['whale','🐳'],['octopus','🐙'],['shell','🐚'],['crab','🦀'],['starfish','⭐']] },
  { id: 'yummy',   emoji: '🍓', stickers: [['strawberry','🍓'],['icecream','🍦'],['cupcake','🧁'],['banana','🍌'],['pizza','🍕'],['watermelon','🍉']] },
  { id: 'sky',     emoji: '🚀', stickers: [['moon','🌙'],['star','🌟'],['rocket','🚀'],['cloud','☁️'],['balloon','🎈'],['planet','🪐']] },
  { id: 'jungle',  emoji: '🦁', stickers: [['lion','🦁'],['monkey','🐒'],['parrot','🦜'],['elephant','🐘'],['giraffe','🦒'],['tiger','🐯']] },
  { id: 'sparkle', emoji: '💎', stickers: [['crown','👑'],['unicorn','🦄'],['heart','💖'],['gem','💎'],['wand','🪄'],['trophy','🏆']] },
];
export const CATALOG = {
  pages: STICKER_PAGES.map((p) => ({ id: p.id, ids: p.stickers.map(([n]) => `${p.id}-${n}`) })),
};
export const STICKER_EMOJI = Object.fromEntries(
  STICKER_PAGES.flatMap((p) => p.stickers.map(([n, e]) => [`${p.id}-${n}`, e])));
export const STICKER_NAME = Object.fromEntries(          // spoken: "A butterfly! Into the book!"
  STICKER_PAGES.flatMap((p) => p.stickers.map(([n]) => [`${p.id}-${n}`, n.replace('icecream', 'ice cream')])));

export const MILESTONE_STICKERS = REWARDS.milestoneDays.map((days) => ({ id: `days-${days}`, days }));

// Pup stages (03 §3.2). index 0..5. Design art uses data-stage = index + 1.
export const PET_STAGES = [
  { id: 'tiny',   minXp: 0,   trick: 'wag' },
  { id: 'puppy',  minXp: 80,  trick: 'sit' },
  { id: 'buddy',  minXp: 200, trick: 'highfive' },
  { id: 'big',    minXp: 380, trick: 'spin' },
  { id: 'sporty', minXp: 620, trick: 'jump' },        // "jump squat" = 01's trick-jump
  { id: 'super',  minXp: 950, trick: 'flip' },        // "backflip"   = 01's trick-flip
];
// trick names MUST match 01 §5.5 CSS: data-mood = 'trick-' + trick (wag, sit, highfive, spin, jump, flip).
// Art uses data-stage = stageForXp(xp).index + 1 (1–6). Never pass the 0-based index to mountPup().
```

### 4.3 `js/logic/dates.js` (complete)
```js
// All app dates are LOCAL calendar dates as 'YYYY-MM-DD'.
export function toLocalDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
// Parse at local NOON so DST shifts (±1 h) can never move the date.
export function parseLocalDateStr(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}
export function isValidDateStr(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return toLocalDateStr(parseLocalDateStr(s)) === s;          // rejects 2026-02-30
}
/** Whole days from a to b (b - a). Same day = 0, yesterday→today = 1. */
export function daysBetween(a, b) {
  return Math.round((parseLocalDateStr(b) - parseLocalDateStr(a)) / 86400000);
}
export function addDays(s, n) {
  const d = parseLocalDateStr(s);
  d.setDate(d.getDate() + n);
  return toLocalDateStr(d);
}
/** Monday (weekStartsOn=1) of the week containing s. */
export function weekStart(s, weekStartsOn = 1) {
  const dow = parseLocalDateStr(s).getDay();                   // 0=Sun..6=Sat
  const back = (dow - weekStartsOn + 7) % 7;
  return addDays(s, -back);
}
```

### 4.4 Stopwatch: `js/logic/stopwatch.js` (complete)
```js
// Pure: `now` is injected (performance.now in the app, a fake clock in tests).
export function createStopwatch(now = () => performance.now()) {
  let startT = null;
  let stoppedAt = null;       // elapsed ms when stopped
  return {
    start() { if (startT === null) { startT = now(); stoppedAt = null; } },
    /** Stops (idempotent) and returns the elapsed ms. `atT` lets a caller stop at a past timestamp. */
    stop(atT = now()) {
      if (startT === null) return 0;
      if (stoppedAt === null) stoppedAt = Math.max(0, atT - startT);
      return stoppedAt;
    },
    elapsed() {
      if (startT === null) return 0;
      return stoppedAt !== null ? stoppedAt : Math.max(0, now() - startT);
    },
    get running() { return startT !== null && stoppedAt === null; },
    reset() { startT = null; stoppedAt = null; },
  };
}
```
**Why `performance.now()` deltas:** they're monotonic (the system clock can jump; this can't) and sub-millisecond. `requestAnimationFrame` is used **only to draw**; time always comes from `elapsed()`, so a dropped frame never loses time.

### 4.5 Cues and poses: `js/logic/cues.js` (complete)
```js
import { TIMING } from '../config.js';

/** Plank cues crossed in (prevMs, nowMs]. Returns [{type}] in order.
 *  types: 'boop' | 'midway' | 'nearGoal' | 'goal' | 'best'. 'boop' is dropped if another cue fires in the same call. */
export function plankCuesBetween(prevMs, nowMs, { goalMs, bestMs = null }, T = TIMING.plank) {
  const crossed = (t) => t > 0 && prevMs < t && nowMs >= t;
  const cues = [];
  if (goalMs >= T.midwayMinGoalMs && crossed(goalMs / 2)) cues.push({ type: 'midway' });
  const near = goalMs - T.nearGoalLeadMs;
  if (near > goalMs / 2 && crossed(near)) cues.push({ type: 'nearGoal' });
  if (crossed(goalMs)) cues.push({ type: 'goal' });
  if (bestMs !== null && prevMs <= bestMs && nowMs > bestMs) cues.push({ type: 'best' });
  if (cues.length === 0 && Math.floor(nowMs / T.boopEveryMs) > Math.floor(Math.max(0, prevMs) / T.boopEveryMs)) {
    cues.push({ type: 'boop' });
  }
  return cues;
}
/** Background colour state for the Plank screen (03 §1): 'blue' → 'green' at goal → 'gold' at a new PB. */
export function plankVisualState(ms, goalMs, bestMs = null) {
  if (bestMs !== null && ms > bestMs) return 'gold';
  if (ms >= goalMs) return 'green';
  return 'blue';
}

/** Squat-along cues crossed in (prevMs, nowMs]. A rep n COMPLETES at t = n*beatMs (on the "up").
 *  types: 'rep' | 'twoMore' | 'oneMore' | 'goal' | 'best' | 'sparkle' | 'down' (next rep starts: low boop). */
export function squatCuesBetween(prevMs, nowMs, { beatMs, goalReps, bestReps = null, capReps }, T = TIMING.squat) {
  const cues = [];
  const from = Math.floor(Math.max(0, prevMs) / beatMs);
  const to = Math.floor(nowMs / beatMs);
  for (let n = from + 1; n <= to; n++) {
    cues.push({ type: 'rep', n });
    if (n === goalReps) cues.push({ type: 'goal', n });
    else if (n === goalReps - 1) cues.push({ type: 'oneMore', n });
    else if (n === goalReps - 2) cues.push({ type: 'twoMore', n });
    if (bestReps !== null && n === bestReps + 1) cues.push({ type: 'best', n });
    if (T.sparkleEvery && n % T.sparkleEvery === 0) cues.push({ type: 'sparkle', n });
    if (n < capReps) cues.push({ type: 'down', n: n + 1 });
  }
  return cues;
}
/** Numbers to SPEAK in (prevMs, nowMs], triggered leadMs before the rep completes. */
export function squatCountsToSpeak(prevMs, nowMs, beatMs, leadMs = TIMING.squat.speechLeadMs) {
  const out = [];
  const first = Math.floor((Math.max(0, prevMs) + leadMs) / beatMs) + 1;
  for (let n = first; n * beatMs - leadMs <= nowMs; n++) {
    if (n * beatMs - leadMs > prevMs) out.push(n);
  }
  return out;
}
/** Pup's squat depth 0 (standing) … 1 (sitting) at a moment. Drives CSS var --squat. */
export function squatDepth(elapsedMs, beatMs, T = TIMING.squat) {
  const p = (elapsedMs % beatMs) / beatMs;
  const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
  const down = T.downFraction, hold = T.holdFraction;
  if (p < down) return ease(p / down);
  if (p < down + hold) return 1;
  return 1 - ease((p - down - hold) / (1 - down - hold));
}
export const repsCompleted = (elapsedMs, beatMs) => Math.floor(elapsedMs / beatMs);
```

### 4.6 Goal progression: `js/logic/goal.js` (complete)
**Rule (default, gentle):** a goal is raised after it has been **met on 3 main attempts** since the last change (at most one main attempt per exercise per day, so that's ≥ 3 days). Plank: +2 s below 30 s, then +3 s. Squats: +1 rep. It's capped at the exercise cap (60 s / 20 reps by default). **It is never lowered automatically** (`lowerAfterMisses: 0`). Dad can switch to manual in Parent Corner, or set `lowerAfterMisses` to 3 to get 03's "quiet −2 s after 3 misses in a row". "One more try" attempts never move the goal. Minimum time from 10 s to 60 s is ~57 exercise days; squats from 5 to 20 take ~45 days.
```js
import { EXERCISES, GOAL_POLICY } from '../config.js';

export function stepFor(current, steps) {
  const s = steps.find((x) => x.below === null || current < x.below);
  return s.step;
}
export function clampGoal(ex, value, cap, E = EXERCISES) {
  const c = E[ex];
  return Math.min(cap, Math.max(c.minGoal, Math.round(value / c.goalRoundTo) * c.goalRoundTo));
}
/**
 * Call ONLY for MAIN attempts.
 * @param goal     {mode, current}
 * @param progress {hits, misses, lastChangedDate}
 * @param rules    {raiseAfterHits, lowerAfterMisses}
 * @param cap      exercise cap (ms or reps)
 * @returns {goal, progress, change: 'raised'|'lowered'|null, from, to}
 */
export function nextGoalAfterMain({ ex, goal, progress, rules, cap, beatGoal, date }, E = EXERCISES, P = GOAL_POLICY) {
  const c = E[ex];
  const from = goal.current;
  let hits = progress.hits;
  let misses = progress.misses;
  if (beatGoal) { hits += 1; misses = 0; }
  else { misses += 1; if (P.hitsMustBeConsecutive) hits = 0; }
  const same = { goal: { ...goal }, progress: { ...progress, hits, misses }, change: null, from, to: from };
  if (goal.mode !== 'auto') return same;

  if (beatGoal && hits >= rules.raiseAfterHits && from < cap) {
    const to = Math.min(cap, from + stepFor(from, c.goalSteps));
    return { goal: { ...goal, current: to }, progress: { hits: 0, misses: 0, lastChangedDate: date }, change: 'raised', from, to };
  }
  if (!beatGoal && rules.lowerAfterMisses > 0 && misses >= rules.lowerAfterMisses && from > c.minGoal) {
    const to = Math.max(c.minGoal, from - c.lowerBy);
    return { goal: { ...goal, current: to }, progress: { hits: 0, misses: 0, lastChangedDate: date }, change: 'lowered', from, to };
  }
  return same;
}
/** Parent override. mode 'manual' freezes the goal; 'auto' lets it grow again from this value. Resets counters. */
export function setGoalManually(state, ex, value, mode, date) {
  const s = structuredClone(state);
  const cap = ex === 'plank' ? s.settings.plank.capMs : s.settings.squat.capReps;
  s.settings.goals[ex] = { mode, current: clampGoal(ex, value, cap) };
  s.goalProgress[ex] = { hits: 0, misses: 0, lastChangedDate: date };
  return s;
}
```
**When Dad lowers the cap** in Parent Corner: also clamp `goals[ex].current` to the new cap (use `clampGoal`).
**The goal is never announced as going down.** Celebrate announces only `change === 'raised'` ("New bone!"), as 03 decides.

### 4.7 Active days, weekly paws and streaks: `js/logic/streak.js` (complete)
An **active day** (03's "exercise day") is any local date with ≥ 1 saved session of either exercise. Mia never sees a streak counter (03 §3.5). She sees the **weekly paw row** (Mon–Sun, resets Monday) and **total exercise days** (never goes down). Dad sees `computeStreak` numbers in Parent Corner. Their kind rule: **one missed day between exercise days does not break the streak** (`restDaysAllowed: 1`); two missed days in a row start a new one. The streak counts exercise days, not calendar days.
```js
import { daysBetween, addDays, weekStart, isValidDateStr } from './dates.js';
import { STREAK } from '../config.js';

/** Map date → { plank: bool, squat: bool } */
export function activeDates(sessions) {
  const m = new Map();
  for (const s of sessions) {
    const e = m.get(s.date) || { plank: false, squat: false };
    e[s.exercise] = true;
    m.set(s.date, e);
  }
  return m;
}
export const totalActiveDays = (sessions) => activeDates(sessions).size;

/** Dad-only streak numbers. ONE function, all the rules. */
export function computeStreak(dates, todayStr, rules = STREAK) {
  const days = [...new Set(dates)].filter(isValidDateStr).sort();
  if (days.length === 0) return { current: 0, best: 0, totalDays: 0, activeToday: false, daysSinceLast: null };
  const maxGap = rules.restDaysAllowed + 1;             // 1 = consecutive days; 2 = one rest day allowed
  let run = 1, best = 1;
  for (let i = 1; i < days.length; i++) {
    run = daysBetween(days[i - 1], days[i]) <= maxGap ? run + 1 : 1;
    if (run > best) best = run;
  }
  const daysSinceLast = Math.max(0, daysBetween(days[days.length - 1], todayStr)); // clock set back → 0
  const alive = daysSinceLast <= maxGap;
  return { current: alive ? run : 0, best, totalDays: days.length, activeToday: daysSinceLast === 0, daysSinceLast };
}

/** 7 circles Mon..Sun for the week containing today. paws: 0, 1 or 2 (double day). */
export function weekPaws(sessions, todayStr, rules = STREAK) {
  const act = activeDates(sessions);
  const mon = weekStart(todayStr, rules.weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(mon, i);
    const a = act.get(date);
    const paws = a ? (a.plank && a.squat ? 2 : 1) : 0;
    return { date, paws, isToday: date === todayStr, isFuture: daysBetween(todayStr, date) > 0 };
  });
}
/** Monday dates of weeks with ≥ starWeekMinDays exercise days (double days count once). */
export function starWeeks(sessions, rules = STREAK) {
  const perWeek = new Map();
  for (const date of activeDates(sessions).keys()) {
    const w = weekStart(date, rules.weekStartsOn);
    perWeek.set(w, (perWeek.get(w) || 0) + 1);
  }
  return [...perWeek].filter(([, n]) => n >= rules.starWeekMinDays).map(([w]) => w).sort();
}
```
Home greeting "returning after a break" (03 §5) uses `computeStreak(...).daysSinceLast >= 2`.

### 4.8 Rewards: `js/logic/rewards.js` (complete)
Rules (from 03 §3): **one sticker per exercise day**, earned by the first session of the day (either exercise), picked from ≤ 3 face-down cards drawn from the **missing stickers on the current page** (no duplicates). A PB anywhere that day makes today's sticker **gold** (upgraded in place). Milestone stickers are given automatically at 7/14/21/30/50/75/100 total exercise days. Treats come from `REWARDS.treats`. Pup's stage comes from `PET_STAGES`.
```js
import { REWARDS } from '../config.js';
import { CATALOG, MILESTONE_STICKERS, PET_STAGES } from '../catalog.js';

/** The page the child is filling now. Books fill one after another (book 2 = gold versions, etc.). */
export function currentPage(stickers, catalog = CATALOG) {
  const all = catalog.pages.flatMap((p) => p.ids);
  for (let book = 1; ; book++) {
    const owned = new Set(stickers.filter((x) => x.book === book).map((x) => x.id));
    if (all.some((id) => !owned.has(id))) {
      const pageIndex = catalog.pages.findIndex((p) => p.ids.some((id) => !owned.has(id)));
      return { book, pageIndex, missing: catalog.pages[pageIndex].ids.filter((id) => !owned.has(id)) };
    }
  }
}
export function makeStickerOffer(stickers, rng = Math.random, catalog = CATALOG, R = REWARDS) {
  const { book, pageIndex, missing } = currentPage(stickers, catalog);
  const pool = [...missing];
  for (let i = pool.length - 1; i > 0; i--) {             // Fisher–Yates with injected rng
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { book, pageIndex, choices: pool.slice(0, R.stickerChoices) };
}
function pageComplete(stickers, book, pageIndex, catalog) {
  const owned = new Set(stickers.filter((x) => x.book === book).map((x) => x.id));
  return catalog.pages[pageIndex].ids.every((id) => owned.has(id));
}
function completedPagesCount(stickers, catalog) {
  let n = 0;
  const maxBook = Math.max(0, ...stickers.map((x) => x.book));
  for (let b = 1; b <= maxBook; b++) catalog.pages.forEach((_, i) => { if (pageComplete(stickers, b, i, catalog)) n++; });
  return n;
}
/** Child tapped a card. Returns new state + what happened (for tier-3 scenes and prizes). */
export function claimSticker(state, stickerId, catalog = CATALOG) {
  const p = state.pendingStickerPick;
  if (!p || !p.choices.includes(stickerId)) return { state, claimed: null, pageCompleted: false, bookCompleted: false, prize: null };
  const s = structuredClone(state);
  s.stickers.push({ id: stickerId, book: p.book, date: p.date, gold: !!p.gold });
  s.pendingStickerPick = null;
  const pageCompleted = pageComplete(s.stickers, p.book, p.pageIndex, catalog);
  const bookCompleted = pageCompleted && catalog.pages.every((_, i) => pageComplete(s.stickers, p.book, i, catalog));
  let prize = null;
  const mode = s.settings.pagePrize.mode;
  if (pageCompleted && mode !== 'off') {
    const done = completedPagesCount(s.stickers, catalog);
    if (mode === 'page' || (mode === 'twoPages' && done % 2 === 0) || (mode === 'book' && bookCompleted)) {
      prize = { book: p.book, pageIndex: p.pageIndex, date: p.date, emoji: s.settings.pagePrize.emoji,
                label: s.settings.pagePrize.label, given: false, givenDate: null };
      s.prizes.push(prize);
    }
  }
  return { state: s, claimed: stickerId, pageCompleted, bookCompleted, prize };
}
/** Treats for one saved session. */
export function computeXp(ctx, R = REWARDS) {
  // ctx: { attempt, extraIndex, firstExerciseOfDay, doubleDay, beatGoal, goalBonusAvailable, beatBest }
  const t = R.treats;
  let xp = 0;
  if (ctx.attempt === 'main') xp += ctx.firstExerciseOfDay ? t.firstExerciseOfDay : t.secondExercise;
  else if (ctx.extraIndex < R.maxExtraPerExercisePerDay) xp += t.oneMoreTry;
  if (ctx.doubleDay) xp += t.doubleDayBonus;
  if (ctx.beatGoal && ctx.goalBonusAvailable) xp += t.goal;
  if (ctx.beatBest) xp += t.personalBest;
  return xp;
}
export function stageForXp(xp, stages = PET_STAGES) {
  let index = 0;
  stages.forEach((s, i) => { if (xp >= s.minXp) index = i; });
  const next = stages[index + 1] || null;
  const progress = next ? (xp - stages[index].minXp) / (next.minXp - stages[index].minXp) : 1;
  return { index, id: stages[index].id, trick: stages[index].trick, minXp: stages[index].minXp,
           nextMinXp: next ? next.minXp : null, progress: Math.min(1, Math.max(0, progress)) };
}
/** After the final stage: true when a 150-treat boundary was crossed. */
export function crossedShowOff(xpBefore, xpAfter, stages = PET_STAGES, R = REWARDS) {
  const last = stages[stages.length - 1].minXp;
  if (xpBefore < last) return false;
  return Math.floor((xpAfter - last) / R.showOffEveryTreats) > Math.floor((xpBefore - last) / R.showOffEveryTreats);
}
export function milestonesDue(totalDays, owned, list = MILESTONE_STICKERS) {
  const have = new Set(owned.map((m) => m.id));
  return list.filter((m) => totalDays >= m.days && !have.has(m.id)).map((m) => m.id);
}
/** Max one tier-3 scene per session (03 §3.4). Extras are queued; queued ones show when nothing new happened. */
export function pickBigMoment(candidates, queue, R = REWARDS) {
  const rank = (m) => R.bigMomentPriority.indexOf(m.type);
  const sorted = [...candidates].sort((a, b) => rank(a) - rank(b));
  if (sorted.length) return { show: sorted[0], queue: [...queue, ...sorted.slice(1)] };
  if (queue.length) return { show: queue[0], queue: queue.slice(1) };
  return { show: null, queue };
}
```

### 4.9 The core: `js/logic/session.js` (complete)
Every finished exercise goes through **one** pure function. The screens never compute rewards themselves.
```js
import { toLocalDateStr } from './dates.js';
import { nextGoalAfterMain } from './goal.js';
import { computeStreak, totalActiveDays } from './streak.js';
import { makeStickerOffer, claimSticker, computeXp, stageForXp, crossedShowOff, milestonesDue } from './rewards.js';
import { bestValue } from './stats.js';
import { REWARDS } from '../config.js';

export function attemptKindFor(sessions, exercise, date) {
  return sessions.some((s) => s.exercise === exercise && s.date === date) ? 'extra' : 'main';
}
/** Offer "One more try?" only after the main attempt and while extras remain. */
export function canTryExtra(sessions, exercise, date, R = REWARDS) {
  const n = sessions.filter((s) => s.exercise === exercise && s.date === date).length;
  return n >= 1 && n < 1 + R.maxExtraPerExercisePerDay;
}
/** Home button state per exercise: 'fresh' | 'done' (main done) | 'rested' (main + all extras done). */
export function exerciseDayState(sessions, exercise, date, R = REWARDS) {
  const n = sessions.filter((s) => s.exercise === exercise && s.date === date).length;
  return n === 0 ? 'fresh' : n < 1 + R.maxExtraPerExercisePerDay ? 'done' : 'rested';
}

/**
 * @param state  current app state (not mutated)
 * @param input  plank: { exercise:'plank', durationMs, autoFinished }
 *               squat: { exercise:'squat', reps, countedReps, beatMs, elapsedMs }
 * @param now    Date of finishing
 * @param rng    () => [0,1)
 * @returns { state, result }
 */
export function applySession(state, input, now = new Date(), rng = Math.random) {
  let s = structuredClone(state);
  const ex = input.exercise;
  const date = toLocalDateStr(now);
  const prev = s.sessions;
  const todays = prev.filter((x) => x.date === date);
  const sameExToday = todays.filter((x) => x.exercise === ex);
  const attempt = sameExToday.length === 0 ? 'main' : 'extra';
  const extraIndex = sameExToday.filter((x) => x.attempt === 'extra').length;
  const goalValue = s.settings.goals[ex].current;
  const value = ex === 'plank' ? Math.round(input.durationMs) : Math.round(input.reps);
  const prevBest = bestValue(prev, ex);                    // null if never done
  const beatGoal = value >= goalValue;
  const beatBest = prevBest !== null && value > prevBest;
  const id = 's' + now.getTime().toString(36) + Math.floor(rng() * 1e6).toString(36);

  const session = ex === 'plank'
    ? { id, exercise: 'plank', date, startedAt: new Date(now.getTime() - value).toISOString(), attempt,
        durationMs: value, goalMs: goalValue, beatGoal, beatBest, autoFinished: !!input.autoFinished }
    : { id, exercise: 'squat', date, startedAt: new Date(now.getTime() - (input.elapsedMs || 0)).toISOString(), attempt,
        reps: value, goalReps: goalValue, beatGoal, beatBest,
        countedReps: Math.round(input.countedReps ?? value), beatMs: input.beatMs };

  const firstExerciseOfDay = todays.length === 0;
  const doubleDay = attempt === 'main' && todays.some((x) => x.exercise !== ex);
  const goalBonusAvailable = !sameExToday.some((x) => x.beatGoal);
  s.sessions = [...prev, session];

  // 1) Goal (main attempts only)
  let goalChange = { change: null, from: goalValue, to: goalValue };
  if (attempt === 'main') {
    const cap = ex === 'plank' ? s.settings.plank.capMs : s.settings.squat.capReps;
    const r = nextGoalAfterMain({ ex, goal: s.settings.goals[ex], progress: s.goalProgress[ex],
      rules: s.settings.goalRules[ex], cap, beatGoal, date });
    s.settings.goals[ex] = r.goal;
    s.goalProgress[ex] = r.progress;
    goalChange = r;
  }

  // 2) Sticker: first session of the day → offer 3 cards; later PB → gold upgrade
  let stickerOffer = null;
  let stickerUpgraded = false;
  if (firstExerciseOfDay) {
    if (s.pendingStickerPick) {                            // an old unpicked offer: auto-claim its first card, never lose it
      s = claimSticker(s, s.pendingStickerPick.choices[0]).state;
    }
    const offer = makeStickerOffer(s.stickers, rng);
    s.pendingStickerPick = { date, ...offer, gold: beatBest };
    stickerOffer = s.pendingStickerPick;
  } else if (beatBest) {
    if (s.pendingStickerPick && s.pendingStickerPick.date === date) { s.pendingStickerPick.gold = true; stickerUpgraded = true; }
    else {
      const t = s.stickers.find((x) => x.date === date);
      if (t && !t.gold) { t.gold = true; stickerUpgraded = true; }
    }
  }

  // 3) Milestones on total exercise days
  const totalDays = totalActiveDays(s.sessions);
  const newMilestones = milestonesDue(totalDays, s.milestones);
  for (const mid of newMilestones) s.milestones.push({ id: mid, date });

  // 4) Treats & Pup
  const xpBefore = s.pet.xp;
  const xpGained = computeXp({ attempt, extraIndex, firstExerciseOfDay, doubleDay, beatGoal, goalBonusAvailable, beatBest });
  s.pet.xp = xpBefore + xpGained;
  const stageBefore = stageForXp(xpBefore);
  const stageAfter = stageForXp(s.pet.xp);

  const bigMoments = [];
  if (stageAfter.index > stageBefore.index) bigMoments.push({ type: 'stageUp', stage: stageAfter.index });
  for (const mid of newMilestones) bigMoments.push({ type: 'milestone', id: mid });

  const result = {
    session, exercise: ex, attempt, value, goalValue, prevBest,
    firstEver: prevBest === null,
    beatGoal, beatBest,
    tier: beatBest ? 2 : beatGoal ? 1 : 0,                 // highest of tiers 0–2 (03 §3.4)
    doubleDay,
    goalChange,                                            // {change:'raised'|'lowered'|null, from, to}
    stickerOffer,                                          // non-null → show the 3 face-down cards
    stickerUpgraded,                                       // today's sticker turned gold
    newMilestones,
    xpGained, xpTotal: s.pet.xp, stageBefore, stageAfter,
    grew: stageAfter.index > stageBefore.index,
    showOff: crossedShowOff(xpBefore, s.pet.xp),
    bigMoments,                                            // candidates; Celebrate adds page/book-full after the pick
    canTryExtra: canTryExtra(s.sessions, ex, date),
    streak: computeStreak(s.sessions.map((x) => x.date), date),
    totalDays,
  };
  return { state: s, result };
}
```
**Celebrate sequence (data side):** play the `tier` → if `doubleDay`, play the Double-day scene → if `stickerOffer`, show cards; on tap call `claimSticker()` and add `{type:'pageFull'}` / `{type:'bookFull'}` to the candidates → `pickBigMoment(result.bigMoments + those, state.pendingBigMoments)` → show the one returned, save the returned `queue` into `state.pendingBigMoments` → if `prize`, show "Page full! Show Dad!" → if `canTryExtra` and `attempt === 'main'`, offer "One more try?". The visual and audio details are in 01/03.
**If there's a `pendingStickerPick` but no `app.lastResult`** (the app was closed before she picked), Home shows the cards via `go('celebrate')` in "pick-only" mode: `app.lastResult = { pickOnly: true }`.

### 4.10 `js/logic/stats.js` (complete)
```js
import { addDays } from './dates.js';
import { computeStreak, activeDates } from './streak.js';

export const sessionValue = (s) => (s.exercise === 'plank' ? s.durationMs : s.reps);
export const sessionGoal  = (s) => (s.exercise === 'plank' ? s.goalMs : s.goalReps);

export function bestValue(sessions, ex) {
  let best = null;
  for (const s of sessions) if (s.exercise === ex && (best === null || sessionValue(s) > best)) best = sessionValue(s);
  return best;
}
/** For the Parent Corner 30-day charts. One entry per day, oldest first. */
export function dailySeries(sessions, ex, todayStr, days = 30) {
  const byDate = new Map();
  for (const s of sessions) {
    if (s.exercise !== ex) continue;
    const e = byDate.get(s.date) || { main: null, best: null, goal: null, extraPb: false };
    const v = sessionValue(s);
    if (s.attempt === 'main') { e.main = v; e.goal = sessionGoal(s); }
    if (e.best === null || v > e.best) e.best = v;
    if (s.attempt === 'extra' && s.beatBest) e.extraPb = true;
    byDate.set(s.date, e);
  }
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(todayStr, i - (days - 1));
    return { date, ...(byDate.get(date) || { main: null, best: null, goal: null, extraPb: false }) };
  });
}
/** Numbers for Parent Corner (03 §7). */
export function dadStats(state, todayStr) {
  const S = state.sessions;
  const streak = computeStreak(S.map((s) => s.date), todayStr);
  const act = activeDates(S);
  const month = todayStr.slice(0, 7);
  const doubleDaysThisMonth = [...act].filter(([d, a]) => d.startsWith(month) && a.plank && a.squat).length;
  const avg7 = (ex) => {
    const vals = dailySeries(S, ex, todayStr, 7).map((d) => d.main).filter((v) => v !== null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  };
  return {
    totalDays: act.size, streakCurrent: streak.current, streakBest: streak.best, doubleDaysThisMonth,
    plank: { best: bestValue(S, 'plank'), goal: state.settings.goals.plank.current, avg7: avg7('plank') },
    squat: { best: bestValue(S, 'squat'), goal: state.settings.goals.squat.current, avg7: avg7('squat') },
  };
}
```

### 4.11 `js/logic/gate.js` (complete)
```js
import { GATE } from '../config.js';
export function makeGateQuestion(rng = Math.random, G = GATE) {
  const r = () => G.factorMin + Math.floor(rng() * (G.factorMax - G.factorMin + 1));
  const a = r(), b = r();
  return { a, b, answer: a * b, text: `What is ${a} × ${b}?` };
}
export const checkGateAnswer = (q, typed) => Number(String(typed).trim()) === q.answer;
```
**Gate modal (`ui/gateModal.js`):** the 🔒 must be **held for `GATE.holdMs`**. Use `pointerdown` to start a timer and fill a ring (CSS transition); `pointerup`, `pointercancel` or `pointerleave` before 2 s cancels. Then show the question with **01-design §4.8's on-screen keypad** (0–9, ⌫, ✓; answer box max 3 digits; no native `<input>`, no multiple choice); ✓ submits. Right → `app.parentUntil = performance.now() + GATE.unlockMs` and resolve `true`. Wrong → quietly close and resolve `false`. The Parent Corner route guard checks `performance.now() < app.parentUntil`.

---

## 5. Timers on screen (Plank and Squats controllers)

### 5.1 Decisions
| Situation | Behaviour |
|---|---|
| Arriving from the Home button | The countdown starts **automatically** (that tap already unlocked audio). |
| Countdown | `settings.countdownSec` (default 5). The intro line is spoken at the start. The last 3 s show big digits with a tick tone. "Go!" plays a tone plus speech. |
| Tap during the countdown | Cancel → **ready** state (big 🐾 Go button, ❓ tip, 🏠). Nothing is saved. |
| Running | The **whole screen is the stop area** (`pointerdown` on the `<section>`). Taps in the first `stopIgnoreMs` (600 ms) are ignored. |
| Plank stopped < 2 s | Only 🔁 "try again" (it was an accidental tap). Not saved. |
| Plank stopped 2–3 s | 🔁 try again (not saved) **or** ✅ count it (03 §2). |
| Plank reaches `capMs` | Auto-finish as a win, saved with `autoFinished: true`. |
| Squats: tap anywhere | Stop → count-check screen (−/+/✅). |
| Squats reach `capReps` | Auto-stop → count-check screen. |
| Squats: count check | Starts at the counted reps. − goes down to 0; + goes up to `min(cap, counted + 5)`. ✅ is enabled when `value ≥ 1`. 🔁 redoes without saving. |
| **App hidden / phone locked while running** | **Stop at that moment** (the `visibilitychange` time), then continue as if tapped: plank → false-start rules or save; squats → count check on return. Rationale: nobody can tap stop while the screen is off, and iOS may freeze timers and rAF while the app is hidden, so counting on would invent time. With Wake Lock working, this only happens if someone presses the side button or switches apps. |
| App hidden during the countdown | Cancel to ready. |
| Leaving the screen by route (🏠) | Abort silently (not saved), release the wake lock. |
| Cold start with `#/plank` or `#/squats` in the URL | The router always starts at Home (or Setup/Meet); the guard needs `app.request`. |

### 5.2 Wake Lock: `js/platform/wakelock.js` (complete)
```js
export const wakeLockSupported = 'wakeLock' in navigator;
let sentinel = null;
let wanted = false;
export let lastWakeLockError = null;

export async function acquireWakeLock() {
  wanted = true;
  if (!wakeLockSupported || sentinel) return !!sentinel;
  try {
    const s = await navigator.wakeLock.request('screen');
    if (!wanted) { s.release().catch(() => {}); return false; }   // released while the request was pending
    sentinel = s;
    s.addEventListener('release', () => { if (sentinel === s) sentinel = null; });
    return true;
  } catch (err) {
    lastWakeLockError = String(err && err.name || err);
    return false;
  }
}
export async function releaseWakeLock() {
  wanted = false;
  const s = sentinel; sentinel = null;
  if (s) { try { await s.release(); } catch { /* already released */ } }
}
// iOS releases the lock when the page is hidden; re-acquire if we still want it.
document.addEventListener('visibilitychange', () => {
  if (wanted && document.visibilityState === 'visible' && !sentinel) acquireWakeLock();
});
```
**iOS notes:**
- Safari supports the Screen Wake Lock API from iOS 16.4. In **Home Screen (standalone) web apps it only worked reliably from about iOS 18.4** because of a WebKit bug. The iPhone 13 mini runs current iOS, so it should work, but verify it in QA (§11.4).
- **Fallback:** no video hacks (fragile, and they fight audio). If `wakeLockSupported` is false **or** the last request failed, Parent Corner → Diagnostics shows: "Screen may turn off during exercise. Set Settings → Display & Brightness → Auto-Lock to 2 minutes or more." iPhone's default Auto-Lock is 30 s, which would end a 45 s plank.
- Acquire in **`startExercise()`** (inside the Home/"One more try" tap, so it also covers the form-tip cards) **and again** at countdown start (idempotent); release on finish, abort or hide.

### 5.3 Plank controller (the timing core of `js/screens/plank.js`)
Rendering goes through a small `view` object that the screen implements from the 01-design markup (`view.showPhase`, `view.setCountdown`, `view.setElapsed`, `view.setColor`). The logic below is exact. `view.setColor(c)` maps to 01 §7.3 classes on the `<section class="screen ex">`: `'blue'` → `is-running`; `'green'` → `is-running is-goal`; `'gold'` → `is-running is-goal is-record`. Remove all three when the phase leaves `running`.
```js
import { TIMING } from '../config.js';
import { createStopwatch } from '../logic/stopwatch.js';
import { plankCuesBetween, plankVisualState } from '../logic/cues.js';
import { bestValue } from '../logic/stats.js';
import { getState } from '../store.js';
import { acquireWakeLock, releaseWakeLock } from '../platform/wakelock.js';
import { sounds } from '../platform/audio.js';
import { speakLine, saveAndCelebrate } from '../ui/flow.js';

const ctl = { phase: 'idle', rafId: 0, countdownEndT: 0, shownCount: null, sw: null,
              stopArmedAt: 0, lastMs: 0, goalMs: 0, bestMs: null, capMs: 60000, pendingMs: 0 };
let view;                                   // set in mount()

export function beginCountdown() {
  const st = getState();
  ctl.goalMs = st.settings.goals.plank.current;
  ctl.bestMs = bestValue(st.sessions, 'plank');
  ctl.capMs = st.settings.plank.capMs;
  ctl.phase = 'countdown';
  ctl.countdownEndT = performance.now() + st.settings.countdownSec * 1000;
  ctl.shownCount = null;
  acquireWakeLock();
  view.showPhase('countdown');
  speakLine('plankCountdownIntro');         // "Get in your plank!"
  cancelAnimationFrame(ctl.rafId);
  ctl.rafId = requestAnimationFrame(frame);
}

function startRunning() {
  ctl.phase = 'running';
  ctl.sw = createStopwatch();
  ctl.sw.start();
  ctl.lastMs = 0;
  ctl.stopArmedAt = performance.now() + TIMING.stopIgnoreMs;
  sounds.go();
  speakLine('go');                          // "Go!"
  view.showPhase('running');
}

function frame() {
  if (ctl.phase === 'countdown') {
    const remaining = Math.ceil((ctl.countdownEndT - performance.now()) / 1000);
    if (remaining <= 0) startRunning();
    else if (remaining !== ctl.shownCount) {
      ctl.shownCount = remaining;
      view.setCountdown(remaining);         // show the digit only when remaining <= countdownTickFromSec
      if (remaining <= TIMING.countdownTickFromSec) sounds.tick();
    }
  }
  if (ctl.phase === 'running') {
    const ms = ctl.sw.elapsed();
    if (ms >= ctl.capMs) { finish(ctl.capMs, true); return; }
    const cues = plankCuesBetween(ctl.lastMs, ms, { goalMs: ctl.goalMs, bestMs: ctl.bestMs });
    playPlankCues(cues);
    ctl.lastMs = ms;
    view.setElapsed(ms, ctl.goalMs);                             // digits change only when the whole second changes
    view.setColor(plankVisualState(ms, ctl.goalMs, ctl.bestMs)); // 'blue' | 'green' | 'gold'
  }
  if (ctl.phase === 'countdown' || ctl.phase === 'running') ctl.rafId = requestAnimationFrame(frame);
}

function playPlankCues(cues) {
  const types = cues.map((c) => c.type);
  if (types.includes('best')) { sounds.fanfare(); speakLine('plankBestLive'); }
  else if (types.includes('goal')) { sounds.chime(); speakLine('plankGoalLive'); }
  else if (types.includes('nearGoal')) speakLine('plankNearGoal');
  else if (types.includes('midway')) speakLine('plankMidway');
  else if (types.includes('boop')) sounds.boop();
}

function finish(ms, capped) {
  cancelAnimationFrame(ctl.rafId);
  releaseWakeLock();
  const P = TIMING.plank;
  if (!capped && ms < P.falseStartMs) {
    ctl.phase = 'falseStart';
    ctl.pendingMs = ms;
    view.showPhase('falseStart', { canCount: ms >= P.minValidMs });   // 🔁 always, ✅ only if >= 2 s
    return;
  }
  ctl.phase = 'idle';
  if (capped) speakLine('capReached');      // "Wow! Super! Rest now!" (03 §2)
  saveAndCelebrate({ exercise: 'plank', durationMs: ms, autoFinished: capped });
}

export function cancelToReady() {
  cancelAnimationFrame(ctl.rafId);
  releaseWakeLock();
  ctl.phase = 'ready';
  view.showPhase('ready');
}

// Bound once in mount(): section.addEventListener('pointerdown', onScreenPointerDown)
function onScreenPointerDown(e) {
  if (e.target.closest('[data-own-tap]')) return;          // real buttons (🔁 ✅ 🐾 ❓ 🏠) handle themselves
  if (ctl.phase === 'countdown') { e.preventDefault(); cancelToReady(); }
  else if (ctl.phase === 'running' && performance.now() >= ctl.stopArmedAt) {
    e.preventDefault();
    sounds.stop();
    finish(ctl.sw.stop(), false);
  }
}
// Buttons: 🔁 → beginCountdown(); ✅ → { ctl.phase='idle'; saveAndCelebrate({exercise:'plank', durationMs: ctl.pendingMs, autoFinished:false}); }
//          🐾 (ready) → beginCountdown();  ❓ → show the form tip card (01/03)

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'hidden') return;
  if (ctl.phase === 'countdown') cancelToReady();
  else if (ctl.phase === 'running') finish(ctl.sw.stop(), false);
});

// Screen hooks
export function onHide() {                                  // the router called hide(): abort without saving
  if (ctl.phase === 'countdown' || ctl.phase === 'running') { cancelAnimationFrame(ctl.rafId); releaseWakeLock(); }
  ctl.phase = 'idle';
}
```
**`show()` for Plank:** read and clear `app.request` (the guard guarantees it exists). If `meta.formTipsShown.plank < 5`, show the form tip card first (it auto-advances after ~6 s or on a tap), increment the counter, then `beginCountdown()`. Otherwise call `beginCountdown()` straight away.
**CSS for the Plank section:** `touch-action: none;` (no pinch or scroll while slapping the screen).
**Performance:** in `view.setElapsed`, only write `textContent` when `Math.floor(ms/1000)` changes. The ring's `stroke-dashoffset` may update every frame (cheap).

### 5.4 Squats controller (the timing core of `js/screens/squats.js`)
The shape is the same as Plank, with a metronome instead of a stopwatch display.
```js
const sq = { phase: 'idle', rafId: 0, countdownEndT: 0, shownCount: null, sw: null, stopArmedAt: 0,
             lastMs: 0, beatMs: 2500, goal: 5, best: null, cap: 20, counted: 0, value: 0, elapsedMs: 0, speakCounts: true };

export function beginCountdown() {
  const st = getState();
  sq.beatMs = st.settings.squat.beatMs;
  sq.goal = st.settings.goals.squat.current;
  sq.best = bestValue(st.sessions, 'squat');
  sq.cap = st.settings.squat.capReps;
  sq.speakCounts = st.settings.speechOn && st.settings.squat.countAloud && speechSupported
                   && sq.beatMs >= TIMING.squat.speechMinBeatMs;
  // …same countdown as Plank (intro line 'squatCountdownIntro', ticks, wake lock)…
}
function startRunning() {
  sq.phase = 'running'; sq.sw = createStopwatch(); sq.sw.start(); sq.lastMs = 0;
  sq.stopArmedAt = performance.now() + TIMING.stopIgnoreMs;
  sounds.boop();                            // rep 1 starts going down now
  view.showPhase('running'); view.setCount(0);
  startSquatAnimation(view.pupSvg, sq.beatMs);  // 01 §5.5: CSS keyframe loop started in the SAME frame as sw.start()
}
function runningFrame() {
  const ms = sq.sw.elapsed();
  const reps = repsCompleted(ms, sq.beatMs);
  const cues = squatCuesBetween(sq.lastMs, ms, { beatMs: sq.beatMs, goalReps: sq.goal, bestReps: sq.best, capReps: sq.cap });
  const speech = [];
  if (sq.speakCounts) for (const n of squatCountsToSpeak(sq.lastMs, ms, sq.beatMs)) speech.push(numberWord(n)); // "Three!"
  for (const c of cues) {
    if (c.type === 'rep')      { view.setCount(c.n); view.wag(); sounds.up(); }        // TONE + NUMBER = source of truth
    if (c.type === 'down')     sounds.boop();
    if (c.type === 'sparkle')  view.sparkle();
    if (c.type === 'twoMore')  speech.push(line('squatTwoMore'));                     // "Two more!"
    if (c.type === 'oneMore')  speech.push(line('squatOneMore'));
    if (c.type === 'goal')     { sounds.chime(); if (!(sq.best !== null && c.n > sq.best)) view.setColor('green'); speech.push(line('squatGoalLive')); } // never downgrade gold → green
    if (c.type === 'best')     { sounds.fanfare(); view.setColor('gold'); }
  }
  if (speech.length) say(speech.join(' '));    // ONE utterance per frame, so speech never queues up behind
  sq.lastMs = ms;
  if (reps >= sq.cap) { toCountCheck(sq.cap, ms, true); return false; }
  return true;                                   // keep looping
}
function toCountCheck(counted, ms, capped) {
  cancelAnimationFrame(sq.rafId); releaseWakeLock();
  sq.phase = 'countCheck'; sq.counted = counted; sq.value = counted; sq.elapsedMs = ms;
  if (capped) speakLine('capReached');
  view.showPhase('countCheck'); renderCountCheck();          // Pup: "{n} squats! Is that right?"
}
// tap anywhere while running (after stopArmedAt): toCountCheck(repsCompleted(sq.sw.stop(), sq.beatMs), sq.sw.elapsed(), false)
// visibility hidden while running: same as a tap.   hidden during countdown: cancelToReady().
// −  : sq.value = Math.max(0, sq.value - 1)
// +  : sq.value = Math.min(sq.cap, sq.counted + TIMING.squat.maxCorrectionAbove, sq.value + 1)
// ✅ : enabled only if sq.value >= TIMING.squat.minValidReps →
//      saveAndCelebrate({ exercise:'squat', reps: sq.value, countedReps: sq.counted, beatMs: sq.beatMs, elapsedMs: sq.elapsedMs })
// 🔁 : beginCountdown()  (not saved)
```
**Pup animation sync (decided, PLAN §4.9):** use **01-design §5.5's CSS keyframe loop** (`data-mood="squat"`, duration `--beat`), started with `startSquatAnimation(svg, beatMs)` in the same frame as the stopwatch starts. Its keyframes already match `downFraction`/`holdFraction` (down to 44 %, sit to 56 %), so one cycle ends exactly as rep *n* completes at `n × beatMs`. Do **not** build a JS-driven `--squat` pose; `squatDepth()` stays in `cues.js` only as a tested helper. When leaving Squats or stopping, set the Pup's `data-mood` back to `idle`. Helpers used above: `line = (cat) => pickLine(cat, vars)` from `strings.js`; `say`, `speechSupported` from `platform/speech.js`; `numberWord` from `strings.js`.
**Speech lag:** the number is spoken `speechLeadMs` (200 ms) early. If speech is off, unsupported, or the tempo is faster than 2.0 s, counting is **tone-only** (`sounds.up()` plus the big number), which is always in sync.

### 5.5 `js/ui/flow.js` (glue)
```js
export function startExercise(exercise, attempt = 'main') {   // from the Home buttons and "One more try?"
  unlockAudio(); unlockSpeech();                              // MUST run inside the click handler
  acquireWakeLock();                                           // keep the screen on through tips + countdown
  app.request = { exercise, attempt };
  go(exercise === 'plank' ? 'plank' : 'squats');
}
export function saveAndCelebrate(input) {
  const { state, result } = applySession(getState(), input, new Date());
  setState(state);
  if (state.sessions.length === 1) requestPersistence();
  app.lastResult = result;
  go('celebrate', { replace: true });                          // back swipe can't return to a finished timer
}
export function speakLine(category, vars = {}) {                // picks a random line (no immediate repeat) and says it
  const st = getState();
  const text = pickLine(category, { name: st.settings.childName || 'friend', pup: st.settings.petName, ...vars });
  showBubble(text);                                            // every spoken line is also shown as text (03 §5)
  say(text);
}
// showBubble(text): write `text` via textContent into the visible screen's `.pup-wrap .bubble` (01 §3.5);
// remove it ~800 ms after speech would end (estimate 70 ms per character). On Squats while running: skip the bubble.
```
Imports for `flow.js`: `unlockAudio` (platform/audio), `unlockSpeech`, `say` (platform/speech), `acquireWakeLock` (platform/wakelock), `requestPersistence` (platform/device), `app`, `getState`, `setState` (store), `go` (router), `pickLine` (strings), `applySession` (logic/session; add this import only in M10, see §12 M6).

---

## 6. Sound, speech and haptics

### 6.1 Web Audio synth: `js/platform/audio.js` (complete)
No audio files. Every sound is a short oscillator envelope.
```js
import { AUDIO } from '../config.js';
let ctx = null;
let enabled = true;
export const setSoundEnabled = (on) => { enabled = on; };

/** Call inside a user gesture (click/touchend). Safe to call on every tap. */
export function unlockAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!ctx) ctx = new AC();
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  const b = ctx.createBuffer(1, 1, 22050);                 // 1-sample silent buffer: fully unlocks older iOS
  const src = ctx.createBufferSource(); src.buffer = b; src.connect(ctx.destination); src.start(0);
}
function tone(freq, at, dur, type = 'sine', gain = 1) {
  const t0 = ctx.currentTime + at;
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t0);
  const peak = AUDIO.masterGain * gain;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.05);
}
function play(fn) {
  if (!enabled || !ctx) return;
  if (ctx.state !== 'running') { ctx.resume().catch(() => {}); }
  try { fn(); } catch (e) { console.warn('sound failed', e); }
}
export const sounds = {
  tick:    () => play(() => tone(660, 0, 0.12, 'triangle')),
  go:      () => play(() => { tone(880, 0, 0.18, 'triangle'); tone(1320, 0.12, 0.25, 'triangle'); }),
  boop:    () => play(() => tone(330, 0, 0.14, 'sine', 0.7)),              // plank 5 s boop / squat "down"
  up:      () => play(() => tone(784, 0, 0.16, 'triangle')),               // squat rep completed ("up")
  stop:    () => play(() => tone(523, 0, 0.15, 'sine')),
  chime:   () => play(() => [1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.09, 0.35, 'sine'))),
  fanfare: () => play(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, i === 3 ? 0.6 : 0.2, 'square', 0.5))),
  sticker: () => play(() => [1568, 2093, 2637].forEach((f, i) => tone(f, i * 0.06, 0.2, 'sine', 0.6))),
  drumroll:() => play(() => { for (let i = 0; i < 14; i++) tone(140 + (i % 2) * 20, i * 0.07, 0.06, 'triangle', 0.6); }),
  grow:    () => play(() => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.3, 'triangle'))),
  soft:    () => play(() => tone(587, 0, 0.3, 'sine', 0.6)),               // tier 0 "did it" chime
};
```
**iOS rules:**
- Create and resume the `AudioContext` **inside a `click`/`touchend` handler** (Start, Test sound). `pointerdown`/`touchstart` do **not** count as unlocking gestures on some iOS versions.
- `main.js` adds a global listener: `document.addEventListener('touchend', unlockAudio, { passive: true }); document.addEventListener('click', unlockAudio);`. iOS can put the context into an `"interrupted"` state after a call or when the app is backgrounded, and this resumes it on the next tap.
- **The ring/silent switch mutes Web Audio** in Safari. Setup's "Test sound" button shows the hint "No sound? Check the silent switch on the side of the phone." (03 §2). We do **not** set `navigator.audioSession.type = 'playback'` in v1, because that would stop Dad's music; it is a possible later setting.

### 6.2 Speech: `js/platform/speech.js` (complete)
```js
import { SPEECH } from '../config.js';
export const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let voice = null, enabled = true, unlocked = false;
export const setSpeechEnabled = (on) => { enabled = on; if (!on && speechSupported) speechSynthesis.cancel(); };

function pickVoice() {
  const vs = speechSynthesis.getVoices();
  voice = SPEECH.preferredVoices.map((n) => vs.find((v) => v.name.includes(n) && v.lang.startsWith('en'))).find(Boolean)
       || vs.find((v) => v.lang === SPEECH.lang) || vs.find((v) => v.lang.startsWith('en')) || null;
}
export function initSpeech() {
  if (!speechSupported) return;
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);  // voices load async
}
/** Call inside a user gesture once (Start / Test sound). */
export function unlockSpeech() {
  if (!speechSupported || unlocked) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  speechSynthesis.speak(u);
  unlocked = true;
}
export function say(text) {
  if (!enabled || !speechSupported || !text) return;
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang || SPEECH.lang;
  u.rate = SPEECH.rate; u.pitch = SPEECH.pitch; u.volume = 1;
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel();
    setTimeout(() => speechSynthesis.speak(u), 60);   // iOS sometimes swallows a speak() right after cancel()
  } else {
    speechSynthesis.speak(u);
  }
}
```
**iOS quirks:** the first `speak()` must come from a user gesture (hence `unlockSpeech()` on Start and Test sound). Voices may be empty until `voiceschanged` fires. Speech can lag 0.2–0.5 s, so sounds and visuals never depend on speech finishing. Whether speech obeys the silent switch varies by iOS version; it's a QA item. A cheer tone plus speech overlapping is fine: play the tone first, speech right after.

### 6.3 Strings: `js/strings.js`
- Export `LINES = { category: [ ...templates ] }` with **every line from 03 §5** (both exercises), using `{name}`, `{pup}`, `{n}` and `{sticker}`. Countdown lines in 03 include "3… 2… 1…"; split them. The intro part ("Get in your plank!") is category `plankCountdownIntro` and is spoken at countdown start. The digits are shown visually with tick tones, and "Go!" is its own category.
- **Use exactly these category keys** (the controllers call them by name): `homeHello`, `homeReturning`, `homeDoneForToday`, `offerOtherSquats`, `offerOtherPlank`, `tapPup`, `stickerPick`, `stickerReveal`, `oneMoreTry`, `doubleDay`, `stageUp`, `capReached`, `go` (`["Go!"]`), `plankCountdownIntro`, `plankMidway`, `plankNearGoal`, `plankGoalLive`, `plankGoal`, `plankBestLive`, `plankBest`, `plankBelowGoal`, `squatCountdownIntro`, `squatMidway`, `squatTwoMore` (`["Two more!"]`), `squatOneMore` (`["One more!"]`), `squatGoalLive`, `squatGoal`, `squatBest`, `squatBelowGoal`, `countCheck`, `formTipPlank`, `formTipSquat`, `setupTestSound`, `meetBasket`, `meetHello`, `meetNamed`. `*Live` = the short line said during the exercise (use 03's Goal / PB lines); the non-`Live` twin is said on Celebrate. Fill each from the matching row of 03 §5 / §4 / §2.
- `fill(template, vars)` replaces `{key}` with `vars[key] ?? ''`.
- `pickLine(category, vars, rng = Math.random)` picks at random but **never the same index twice in a row per category** (it keeps a module-level `lastIndex` map). It returns the filled text.
- `numberWord(n)` returns `"One!"` … `"Thirty!"` for squat counts (an array of words 1–30, falling back to `String(n) + '!'`).
- For plank seconds, `{n}` = `Math.floor(ms / 1000)`.

### 6.4 Haptics
`navigator.vibrate` does not exist on iOS Safari. **Don't use haptics at all.** All feedback is sound, speech and visuals. (The iOS 18 `<input switch>` haptic trick is a hack; it's excluded.)

---

## 7. App shell

### 7.1 `index.html` skeleton (exact head; body structure)
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#FFF7EC">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Plank Pals">
  <meta name="format-detection" content="telephone=no">
  <title>Plank Pals</title>
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
  <link rel="icon" type="image/png" href="icons/icon-192.png">
  <link rel="stylesheet" href="css/app.css">
  <script type="module" src="js/main.js"></script>
</head>
<body>
  <div id="splash"><!-- Pup SVG + 🐾, 01-design §9.4 --></div>
  <section id="screen-setup"     class="screen screen--scroll" hidden>…</section>
  <section id="screen-meet"      class="screen" hidden>…</section>
  <section id="screen-home"      class="screen" hidden>…</section>
  <section id="screen-plank"     class="screen ex" hidden>…</section>   <!-- .ex: 01 §7.3 colours -->
  <section id="screen-squats"    class="screen ex" hidden>…</section>
  <section id="screen-celebrate" class="screen" hidden>…</section>
  <section id="screen-stickers"  class="screen" hidden>…</section>
  <section id="screen-progress"  class="screen screen--scroll" hidden>…</section>
  <section id="screen-parent"    class="screen screen--scroll" hidden>…</section>
  <div id="gate" class="overlay" hidden>…</div>
  <div id="banner" class="banner" hidden role="status"></div>
  <template id="pup-tpl"><!-- Pup SVG from 01-design §5.1 --></template>
  <template id="pup-plank-tpl"><!-- side-view plank Pup SVG from 01-design §5.6 --></template>
  <noscript>This app needs JavaScript.</noscript>
</body>
</html>
```
The meta tags match 01-design §3.1 (`status-bar-style: default`, so the clock stays readable on cream).

### 7.2 CSS must-haves (in `css/app.css`, besides 01-design's styles)
```css
[hidden] { display: none !important; }
#screen-plank, #screen-squats { touch-action: none; }          /* whole-screen stop area */
input, textarea, select { font-size: 16px; }                    /* stops iOS zooming into focused fields */
.screen { min-height: 100vh; min-height: 100dvh; }
```
The safe-area padding is in 01-design §3.2 (`env(safe-area-inset-*)`).

### 7.3 `js/main.js` (boot order)
```js
import { initStore, getState, app } from './store.js';
import { startRouter, registerScreen, go } from './router.js';
import { setSoundEnabled, unlockAudio } from './platform/audio.js';
import { initSpeech, setSpeechEnabled } from './platform/speech.js';
import { requestPersistence, isLocalDev } from './platform/device.js';
import setup from './screens/setup.js'; /* …import all 9 screens… */

const { status } = initStore();
const st = getState();
setSoundEnabled(st.settings.soundOn);
setSpeechEnabled(st.settings.speechOn);
initSpeech();
document.addEventListener('touchend', unlockAudio, { passive: true });
document.addEventListener('click', unlockAudio);
document.addEventListener('storage-failed', () => showBanner('Could not save! Export a backup in Parent Corner.'));
if (status === 'corrupt' || status === 'newer') showBanner('Saved data could not be read. A copy was kept. Restore a backup in Parent Corner.');
if (status === 'unavailable') showBanner('This browser cannot save progress (Private Browsing?).');

[setup, meet, home, plank, squats, celebrate, stickers, progress, parent].forEach((s) => {
  s.mount(document.getElementById('screen-' + s.id));
  registerScreen(s.id, s);
});
startRouter(st.meta.onboarded ? (st.meta.metPup ? 'home' : 'meet') : 'setup');
requestPersistence();
registerServiceWorker();                                  // §9.4
hideSplash();                                             // 01-design §9.4
```

### 7.4 `js/platform/device.js` (complete)
```js
export const isStandalone = () =>
  window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

export const isLocalDev = () =>
  ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && !new URLSearchParams(location.search).has('sw');

export async function requestPersistence() {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch { return false; }
}
export async function isPersisted() {
  try { return !!(await navigator.storage?.persisted?.()); } catch { return false; }
}

/** MUST be called synchronously from a click handler (no await before it). Returns 'shared'|'downloaded'|'cancelled'. */
export async function shareOrDownloadText(text, filename, type = 'application/json') {
  const file = new File([text], filename, { type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return 'shared'; }
    catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; /* else fall through to download */ }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return 'downloaded';
}
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}
```
If `copyText` fails, show the text in a read-only `<textarea>` and select it, so Dad can copy it by hand.

---

## 8. Routing: `js/router.js` (complete)
Hash routes `#/home`, `#/plank`, etc. Each maps to `<section id="screen-…">`. Only one section is visible at a time.
```js
const ROUTES = ['setup', 'meet', 'home', 'plank', 'squats', 'celebrate', 'stickers', 'progress', 'parent'];
const registry = {};
let current = null;
let onEnterHome = null;
export const setOnEnterHome = (fn) => { onEnterHome = fn; };   // used for the update reload (§9.4)

export function registerScreen(id, mod) { registry[id] = mod; }
export function currentRoute() { return current; }
export function go(id, { replace = false } = {}) {
  const hash = '#/' + id;
  if (location.hash === hash) { render(); return; }
  if (replace) location.replace(hash); else location.hash = hash;   // both fire 'hashchange'
}
function parse() {
  const m = location.hash.match(/^#\/([a-z]+)/);
  return m && ROUTES.includes(m[1]) ? m[1] : 'home';
}
function render() {
  const id = parse();
  const mod = registry[id];
  if (mod?.canEnter && mod.canEnter() === false) { go('home', { replace: true }); return; }
  if (id === current) return;
  if (current) { registry[current]?.hide?.(); document.getElementById('screen-' + current).hidden = true; }
  document.getElementById('screen-' + id).hidden = false;
  current = id;
  mod?.show?.();
  if (id === 'home' && onEnterHome) onEnterHome();
}
/** Cold start always lands on `startId` (never mid-exercise or on Celebrate). */
export function startRouter(startId) {
  history.replaceState(null, '', '#/' + startId);      // doesn't fire hashchange
  window.addEventListener('hashchange', render);
  render();
}
```
**Guards (`canEnter`):**
| Screen | Allowed when |
|---|---|
| setup | `!meta.onboarded` |
| meet | `meta.onboarded && !meta.metPup` |
| home, stickers, progress | `meta.onboarded && meta.metPup` |
| plank / squats | `app.request?.exercise` matches |
| celebrate | `app.lastResult` is set |
| parent | `performance.now() < app.parentUntil` |

**Home buttons:** Plank → `startExercise('plank')`. Squats → `startExercise('squat')`. 📖 → `go('stickers')`. 🏆 → `go('progress')`. 🔒 → `openGate().then(ok => ok && go('parent'))`. Home's `show()` uses `exerciseDayState()` for the ✅/🎁 badges and `weekPaws()` for the paw row.

---

## 9. PWA

### 9.1 `manifest.webmanifest` (complete)
```json
{
  "id": "./",
  "name": "Plank Pals",
  "short_name": "Plank Pals",
  "description": "Plank and squat with Pup.",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FFF7EC",
  "theme_color": "#FFF7EC",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```
URLs inside the manifest resolve relative to the manifest file, so `./` = `https://maxvdp-irl.github.io/mia-plank-pals/`. iOS uses `apple-touch-icon` for the home-screen icon and ignores `orientation`, so the CSS must look fine in portrait (and merely acceptable in landscape: centred, max-width 480px).

### 9.2 Icons
Generate `icons/apple-touch-icon.png` (180), `icon-192.png` and `icon-512.png` once with `tools/make-icons.html` (01-design §9.2, option A). Commit the PNGs. Don't precache `icons/icon.svg` or `tools/`.

### 9.3 `sw.js` (complete)
```js
// sw.js — bump VERSION on EVERY release (must equal APP_VERSION in js/config.js).
const VERSION = '1.0.0';
const CACHE = `plank-pals-${VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './js/main.js',
  './js/config.js',
  './js/catalog.js',
  './js/strings.js',
  './js/storage.js',
  './js/store.js',
  './js/router.js',
  './js/logic/dates.js',
  './js/logic/stopwatch.js',
  './js/logic/cues.js',
  './js/logic/goal.js',
  './js/logic/streak.js',
  './js/logic/rewards.js',
  './js/logic/session.js',
  './js/logic/stats.js',
  './js/logic/backup.js',
  './js/logic/gate.js',
  './js/platform/audio.js',
  './js/platform/speech.js',
  './js/platform/wakelock.js',
  './js/platform/device.js',
  './js/ui/dom.js',
  './js/ui/pup.js',
  './js/ui/gateModal.js',
  './js/ui/flow.js',
  './js/screens/setup.js',
  './js/screens/meet.js',
  './js/screens/home.js',
  './js/screens/plank.js',
  './js/screens/squats.js',
  './js/screens/celebrate.js',
  './js/screens/stickers.js',
  './js/screens/progress.js',
  './js/screens/parent.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // cache:'reload' bypasses GitHub Pages' 10-minute HTTP cache so a new version never caches old files
      .then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('plank-pals-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            // the app makes no cross-origin requests anyway
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;                                       // cache-first
      return fetch(req).catch(() =>
        req.mode === 'navigate' ? caches.match('./index.html') : Response.error());  // offline navigation → app shell
    })
  );
});
```
**Why this is safe:** everything the app needs is precached at install, so it works fully offline from the second launch. Files not in `ASSETS` (`tests.html`, `docs/`, `tools/`) come from the network and aren't cached. If any `ASSETS` file 404s, the **install fails and the old version keeps working**, which is why `tests/pwa.test.js` checks the list.

### 9.4 Registration and the update strategy (in `main.js`)
```js
// These functions go INTO main.js. MERGE their imports with §7.3's import lines; importing `app` or
// `isLocalDev` a second time is a SyntaxError that stops the whole app. main.js needs, in total:
//   import { initStore, getState, app } from './store.js';
//   import { startRouter, registerScreen, go, currentRoute, setOnEnterHome } from './router.js';
//   import { requestPersistence, isLocalDev } from './platform/device.js';

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || isLocalDev()) return;   // no SW on localhost (add ?sw to test it)
  navigator.serviceWorker.register('./sw.js', { scope: './' }).then((reg) => {
    // iOS standalone apps rarely check for updates on their own: check every time the app comes to the front.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(() => {});
    });
  }).catch((e) => console.warn('SW registration failed', e));

  let hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) { hadController = true; return; }         // first install: nothing to reload
    app.updateReady = true;
    maybeReloadForUpdate();
  });
  setOnEnterHome(maybeReloadForUpdate);
}
let reloading = false;
function maybeReloadForUpdate() {
  // Never reload mid-exercise or mid-celebration: only when Home is showing.
  if (app.updateReady && currentRoute() === 'home' && !reloading) { reloading = true; location.reload(); }
}
```
**Flow for a release:** Sonnet bumps `VERSION` and `APP_VERSION` → pushes → Pages deploys (~1 min) → the next time Dad opens the app, `reg.update()` finds the new `sw.js` → it installs (precaches the new files) → `skipWaiting` + `clients.claim` → `controllerchange` → the app reloads itself **the next time Home is visible**. If Mia is mid-plank, it waits. Worst case, closing and reopening the app twice always picks it up.

---

## 10. Hosting and install (GitHub Pages only)

### 10.1 One-time setup (Sonnet does steps 1–4 on Dad's PC; Dad does 5–7)
1. In the project folder (`…\Plank Holding`), create the empty file **`.nojekyll`** at the root.
2. Connect the folder to the existing repo:
   ```
   git init
   git branch -M main
   git remote add origin https://github.com/MaxVDP-IRL/mia-plank-pals.git
   git fetch origin
   git pull origin main --allow-unrelated-histories    (only if the remote already has commits, e.g. a README)
   ```
3. `git add -A` → `git commit -m "M0: skeleton"` → `git push -u origin main`. The first push opens a GitHub sign-in window (Git Credential Manager). **Dad signs in himself**; Sonnet never handles the password or token.
4. After every milestone: commit and push. Pages redeploys in about 1 minute. Watch the repo's **Actions** tab for "pages build and deployment" turning green.
5. **Dad, once:** on github.com → the repo → **Settings → Pages → Build and deployment → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save.**
6. **Dad on the iPhone:** open **Safari** (not Chrome) → go to `https://maxvdp-irl.github.io/mia-plank-pals/` → wait until it has loaded → tap **Share** (the square with an arrow) → **Add to Home Screen** → name "Plank Pals" → **Add**.
7. Open the app **from the new icon**, do Setup (type Mia's name there; it stays on the phone), then use only the icon from now on. Also: Settings → Display & Brightness → Auto-Lock → 2 minutes or more, if Parent Corner → Diagnostics says the screen may turn off.

### 10.2 Shipping an update (every release)
1. Bump **both** `VERSION` in `sw.js` and `APP_VERSION` in `js/config.js` to the same new value (`1.0.0` → `1.0.1` for fixes, `1.1.0` for features).
2. If files were added or renamed, update `ASSETS` in `sw.js`.
3. Open `tests.html` locally → all green (including the PWA checks).
4. `git add -A && git commit -m "Release 1.0.1: …" && git push`.
5. Wait for the Actions tab to go green (~1 min). Then open `https://maxvdp-irl.github.io/mia-plank-pals/tests.html` in desktop Chrome: all green there too.
6. On the iPhone: open the app, go to Home and wait a few seconds; it reloads itself. Parent Corner → Diagnostics shows the new version. If not: close the app (swipe it away) and reopen it, up to twice.

**Never** rename the repo, change the Pages URL, or delete the Home Screen icon without a backup. Each of those means starting from an empty app.

---

## 11. Testing

### 11.1 Running locally (Windows)
- From the project folder: `py -m http.server 8000` (or `python -m http.server 8000`; with Node installed, `npx serve -l 8000` also works).
- App: `http://localhost:8000/`. Tests: `http://localhost:8000/tests.html`.
- Use **desktop Chrome → DevTools → device toolbar → 375×812** (iPhone 13 mini size). DevTools → Application → Local Storage lets you inspect or clear `plankPals.state`.
- The service worker is **off on localhost** (so edits show up on refresh). To test it, open `http://localhost:8000/?sw`. Afterwards, DevTools → Application → Service Workers → Unregister.
- **On the iPhone over Wi-Fi:** `py -m http.server 8000 --bind 0.0.0.0`, find the PC's IPv4 with `ipconfig`, and open `http://192.168.x.x:8000/` in iPhone Safari (allow Python through the Windows firewall for **Private** networks). Plain `http` is **not a secure context**, so the service worker, Wake Lock, Web Share and clipboard **won't work** there. Layout, taps, timers, sound and speech can all be tested. **Test full PWA behaviour on the GitHub Pages URL** in a Safari tab, which has separate storage from Mia's installed app (§3.5).

### 11.2 `tests.html` and `tests/harness.js`
`tests.html`:
```html
<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Plank Pals tests</title>
<style>body{font:14px system-ui;padding:12px} .ok{color:#1F9D5B} .bad{color:#b00020;font-weight:700} pre{white-space:pre-wrap}</style>
<h1 id="summary">Running…</h1><ol id="results"></ol>
<script type="module">
  import { run } from './tests/harness.js';
  import './tests/dates.test.js';    import './tests/stopwatch.test.js'; import './tests/cues.test.js';
  import './tests/goal.test.js';     import './tests/streak.test.js';    import './tests/rewards.test.js';
  import './tests/session.test.js';  import './tests/stats.test.js';     import './tests/storage.test.js';
  import './tests/backup.test.js';   import './tests/gate.test.js';      import './tests/pwa.test.js';
  run();
</script>
```
`tests/harness.js` (complete):
```js
const tests = [];
export function test(name, fn) { tests.push({ name, fn }); }
export function eq(actual, expected, msg = '') {
  const a = JSON.stringify(actual), b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg}\n  expected: ${b}\n  actual:   ${a}`);
}
export function ok(cond, msg = 'expected truthy') { if (!cond) throw new Error(msg); }
export async function run() {
  const list = document.getElementById('results');
  let pass = 0, fail = 0;
  for (const t of tests) {
    const li = document.createElement('li');
    try { await t.fn(); pass++; li.className = 'ok'; li.textContent = '✔ ' + t.name; }
    catch (e) { fail++; li.className = 'bad'; li.textContent = '✘ ' + t.name;
      const pre = document.createElement('pre'); pre.textContent = e.message; li.appendChild(pre); console.error(t.name, e); }
    list.appendChild(li);
  }
  const s = document.getElementById('summary');
  s.textContent = fail ? `${fail} FAILED, ${pass} passed` : `All ${pass} tests passed`;
  s.className = fail ? 'bad' : 'ok';
  document.title = (fail ? '✘ ' : '✔ ') + document.title;
}
```
Helpers for tests: a fake clock `const clock = { t: 0 }; const now = () => clock.t;`, a seeded rng `const rng = () => 0.42;` (or a list-based one), a fixed date `new Date(2026, 8, 26, 9, 0)` (month is 0-based: 8 = September), and `defaultState('2026-09-26T00:00:00.000Z')`.

### 11.3 Required tests (minimum; Sonnet writes them)
Example of the style:
```js
// tests/streak.test.js
import { test, eq } from './harness.js';
import { computeStreak, weekPaws } from '../js/logic/streak.js';

test('streak: consecutive days', () => {
  eq(computeStreak(['2026-09-24', '2026-09-25', '2026-09-26'], '2026-09-26').current, 3);
});
test('streak: one rest day keeps it alive', () => {
  eq(computeStreak(['2026-09-22', '2026-09-24', '2026-09-26'], '2026-09-26').current, 3);
});
test('streak: two missed days start a new run', () => {
  const r = computeStreak(['2026-09-20', '2026-09-21', '2026-09-24'], '2026-09-24');
  eq([r.current, r.best], [1, 2]);
});
test('streak: yesterday still alive, 3 days ago dead', () => {
  eq(computeStreak(['2026-09-25'], '2026-09-26').current, 1);
  eq(computeStreak(['2026-09-23'], '2026-09-26').current, 0);
});
test('weekPaws: Mon-Sun with a double day', () => {
  const S = [{ date: '2026-09-21', exercise: 'plank' }, { date: '2026-09-21', exercise: 'squat' }, { date: '2026-09-23', exercise: 'squat' }];
  eq(weekPaws(S, '2026-09-26').map((d) => d.paws), [2, 0, 1, 0, 0, 0, 0]);   // 2026-09-21 is a Monday
});
```
| File | Must cover |
|---|---|
| dates | `toLocalDateStr` uses local fields (a Date at 23:30 local → the same local day); `daysBetween` across a DST change (`2026-03-28`→`2026-03-30` = 2, `2026-10-24`→`2026-10-26` = 2); `addDays` over month/year ends; `isValidDateStr('2026-02-30') === false`; `weekStart('2026-09-27') === '2026-09-21'` (Sunday → Monday). |
| stopwatch | With a fake clock: elapsed runs; `stop()` freezes it; double `stop()` returns the same value; `elapsed()` before start is 0. |
| cues | Plank: boop at 5 s; midway at goal/2; nearGoal at goal−3 s; goal exactly at goal; `best` only when crossing above the best; boop suppressed when a cue fires in the same call; a big frame jump (0→12 s) returns all crossed cues once. Squats: reps at n×beat; `goal`/`oneMore`/`twoMore` on the right reps; no `down` at the cap; `squatCountsToSpeak` with a lead of 200 returns n just before n×beat; `squatDepth(0)=0`, depth 1 at mid-beat, ≈0 at the beat end. |
| goal | Plank 10 s: 3 hits → 12 s; hits reset after the raise; +3 s once ≥ 30 s; never above the cap; misses don't lower when `lowerAfterMisses=0`; with `lowerAfterMisses=3` → −2 s, min 5 s; manual mode never changes; squats 5 → 6 after 3 hits, cap 20; `setGoalManually` clamps and resets counters. |
| rewards | `currentPage` walks pages then books; the offer has ≤ 3 distinct missing ids from one page; with 1 missing → 1 choice; `claimSticker` rejects ids not offered; page/book completion flags; prize modes page/twoPages/book; `computeXp` table cases (first 10; second 5+5 double; goal +5 only once/day; PB +5; extra +3 only the first time); `stageForXp` at 0/79/80/949/950; `crossedShowOff`; `milestonesDue` at 7 and 14, no repeats; `pickBigMoment` priority and queue. |
| session | First plank of the day → `stickerOffer` + attempt main + 10 treats; second plank same day → attempt extra, no offer; a squat after a plank same day → `doubleDay` true, treats 10 (5+5, +goal if met); PB on the second exercise upgrades a pending or claimed sticker to gold; the first-ever session has `beatBest` false and `firstEver` true; the goal only moves on main attempts; milestone at the 7th distinct day; an old unclaimed `pendingStickerPick` gets auto-claimed on a new day; the input state is **not mutated**. |
| stats | `bestValue` per exercise; `dailySeries` length 30, oldest first, main vs best; `dadStats.doubleDaysThisMonth`. |
| storage | Missing key → `new`; bad JSON → `corrupt` + a quarantine key exists; an unversioned object → migrated to v1; `schemaVersion: 99` → `newer`; `normalize` clamps goals to caps, drops invalid sessions, defaults a missing `exercise` to plank; a save/load roundtrip is identical; `saveState` returns false when `setItem` throws (use a store whose `setItem` throws). |
| backup | `makeBackup`→`parseBackup` roundtrip; raw state accepted; garbage text → `ok:false`; the summary counts; the filename uses the local date. |
| gate | Factors are always 3–9 (loop 200× with `Math.random`); `checkGateAnswer` trims and parses. |
| pwa | `fetch('./sw.js')` text contains `VERSION = '${APP_VERSION}'`; parse the `ASSETS` array with a regex (`/const ASSETS = \[([\s\S]*?)\];/`) and `fetch` each entry → all `ok`; `manifest.webmanifest` parses and has `start_url: "./"`, `scope: "./"`, `display: "standalone"`. |

### 11.4 Manual QA checklist on the iPhone 13 mini (installed from the Home Screen)
**Install and shell**
- [ ] It installs via Share → Add to Home Screen. The icon is Pup, the label is "Plank Pals", it opens full-screen, and there's no Safari UI.
- [ ] The status bar clock is readable; nothing hides under the notch or home indicator.
- [ ] Airplane mode → cold-start the app → everything works (full offline).
- [ ] Setup: type a name; "Test sound" plays a tone and speaks the name. With the silent switch on, the hint shows.
- [ ] Meet Pup: the cards speak names, ✅ saves the pet name, and relaunching doesn't repeat onboarding.

**Plank**
- [ ] Plank button → the countdown speaks, ticks for the last 3 s, "Go!" plays.
- [ ] A tap during the countdown → ready state; the 🐾 button restarts it.
- [ ] While running, the screen **stays on for 90 s+** with Auto-Lock at 30 s (Wake Lock works in standalone).
- [ ] Boop every 5 s, midway line, near-goal line, chime + green at the goal, fanfare + gold on a PB.
- [ ] A slap anywhere stops it. A stop at < 2 s → only 🔁. A stop at 2–3 s → 🔁 and ✅.
- [ ] The cap (set to 30 s in Parent Corner for the test) auto-finishes as a win.
- [ ] Pressing the side button mid-plank → reopen → the result is saved with the time up to the lock.

**Squats**
- [ ] Pup's squat animation, the "boop" going down, and the number plus tone on the way up all stay in sync for 20 reps (a stopwatch check: 20 reps at 2.5 s ≈ 50 s).
- [ ] Spoken numbers are at most ~0.5 s behind; with speech off, counting is tone-only.
- [ ] Tempo 2.0 / 3.5 s in Parent Corner changes the beat.
- [ ] A tap stops → count check: − down to 0, + at most 5 above the counted reps, ✅ disabled at 0.
- [ ] Cap reps auto-stops into the count check.

**Rewards and data**
- [ ] The first exercise of the day → 3 cards → a pick → the sticker lands in the book. A second exercise → no new cards, the Double-day scene, 🐾🐾 on today's circle.
- [ ] A PB later that day turns today's sticker gold.
- [ ] Close the app while the cards are showing → reopen → the cards are offered again (nothing lost).
- [ ] Change the phone date to tomorrow (Settings → General → Date & Time) → a new sticker is available and the paw row moves; set it back afterwards.
- [ ] Parent Corner: the gate needs a 2 s hold + a correct product; a wrong answer closes quietly.
- [ ] Backup: "Save backup file" → Share sheet → Save to Files works. "Copy backup text" works. Delete the app, reinstall, restore from the file → everything is back.
- [ ] Diagnostics shows the version, Installed: yes, Storage persisted, Keep-screen-on: supported.
- [ ] Update test: bump the version, push, reopen the app → it reloads on Home and Diagnostics shows the new version.

---

## 12. Build order (milestones)

Each milestone is small, ends in a commit, and has **"Done when"** checks. **Don't start the next milestone until all its checks pass.** From M2 on, "tests green" means `tests.html` shows "All N tests passed".

**M0 — Repo skeleton**
Create the tree from §2 with empty module files, `.nojekyll`, the `index.html` head from §7.1 with all 9 `<section>`s (each containing only its name as text), `css/app.css` with 01-design's `:root` + §3.2 shell + §7.2 rules, `tests.html` + `tests/harness.js` with one dummy test. **Git and Pages are already set up (PLAN §4.8):** skip §10.1 steps 1, 2 and 5; just commit and push. **Import rule for all milestones:** a file may only `import { x }` from a module whose milestone is already done (an empty placeholder module has no exports, and importing a missing name is a SyntaxError that blanks the page).
*Done when:* `py -m http.server 8000` serves the page with no console errors; `tests.html` shows "All 1 tests passed"; the first push succeeded.

**M1 — Router and screen switching**
Write `router.js` (§8), `ui/dom.js`, and each screen module with empty `mount/show/hide` plus temporary text links between screens. In `main.js`, mount all screens and `startRouter('home')` (onboarding guards come in M11).
*Done when:* typing `#/stickers`, `#/progress` etc. in the URL switches screens; an unknown hash → Home; reloading on `#/plank` lands on Home; only one section is visible at a time.

**M2 — Dates**
Write `logic/dates.js` (§4.3) + `tests/dates.test.js`.
*Done when:* tests are green, including the DST and month-end cases.

**M3 — Config, catalog, storage, store**
Write `config.js` (§4.1), `catalog.js` (§4.2), `storage.js` (§3.3), `store.js` (§3.4) + `tests/storage.test.js`. `main.js` calls `initStore()` and shows banners for bad statuses.
*Done when:* tests are green; in the browser, `localStorage['plankPals.state']` appears after a temporary "save" button in Parent Corner; putting `{bad json` into the key and reloading shows the banner and a `.quarantine.` key.

**M4 — Stopwatch and cues**
Write `logic/stopwatch.js` (§4.4) and `logic/cues.js` (§4.5) + tests.
*Done when:* stopwatch and cues tests are green (plank and squat cues both, even though Squats comes later).

**M5 — Platform: audio, speech, wake lock, device**
Write the 4 files from §5.2, §6.1, §6.2, §7.4. Add a temporary debug block in Parent Corner (no gate yet) with buttons for each sound, "Say hello", "Wake lock on/off" and the persistence status.
*Done when:* on desktop Chrome every sound plays after one click and speech speaks; on the iPhone (LAN, §11.1) sounds and speech work after one tap.

**M6 — Plank screen (timer only, no saving yet)**
Build the Plank markup from 01-design §4.3, §5.6 and §7, and the controller from §5.3, with `saveAndCelebrate` temporarily replaced by `console.log(input)` + `go('home')`. Home gets a temporary "Plank" button calling `startExercise('plank')`. **Also write now** (the controller needs them): `js/strings.js` (§6.3, all categories), `js/ui/pup.js` (01 §5.2 `mountPup`, §5.5 `playTrick` + `startSquatAnimation`), `js/ui/flow.js` (§5.5: `startExercise`, `speakLine`, `showBubble`, and the stub `saveAndCelebrate`, **without** importing `session.js` yet), and the three helpers `sessionValue`, `sessionGoal`, `bestValue` of `logic/stats.js` (§4.10; M8 adds the rest of that file). The form-tip card (PLAN §4.10) comes here too.
*Done when:* every Plank item in the §11.4 checklist except "saved" works in desktop Chrome (use a 15 s cap to test the cap), and on the iPhone over LAN (except Wake Lock).

**M7 — Goal logic**
Write `logic/goal.js` (§4.6) + tests.
*Done when:* goal tests are green for both exercises.

**M8 — Streak, paws and stats**
Write `logic/streak.js` (§4.7), `logic/stats.js` (§4.10) + tests.
*Done when:* tests are green.

**M9 — Rewards and applySession**
Write `logic/rewards.js` (§4.8), `logic/session.js` (§4.9), `logic/gate.js` (§4.11) + tests (rewards, session, gate).
*Done when:* all tests are green, including "input state is not mutated" (deep-compare a `structuredClone` taken before the call).

**M10 — Plank end-to-end: save → Celebrate → Sticker pick**
Put back the real `saveAndCelebrate` (§5.5). Build the Celebrate screen: tier 0/1/2 presentation, face-down cards → `claimSticker` → `pickBigMoment` → a simple tier-3 scene → "One more try?" (plank) → 🏠. Art and motion come from 01, copy from 03 via `strings.js`.
*Done when:* doing a plank on desktop saves a session (visible in localStorage), shows the right tier, offers 3 cards, the pick is saved; a second plank shows "extra" with no cards and no second "One more try?"; closing the tab while the cards show and reopening → Home offers the pick.

**M11 — Onboarding: Setup and Meet Pup**
Setup (03 §2 Part A): name (required), starting goals for plank and squats, Test sound (unlocks audio and speech), "Hand the phone to {name}". Meet Pup (Part B): basket → Pup → 6 name cards that speak → ✅ saves `petName`, sets `meta.metPup`. Put the real start logic from §7.3 into `main.js`.
*Done when:* clearing storage → Setup → Meet Pup → Home, and a relaunch goes straight to Home. The name is used in speech. `grep -ri "mia" js/ css/ index.html` finds **nothing** (the name only lives in storage).

**M12 — Home (real)**
Pup (by `stageForXp`), the pet name, the treat bowl (progress, no number), the weekly paw row, the Plank button (the Squats button is **hidden** until M17), 📖, 🏆, 🔒 (for now a plain button → Parent Corner), greetings (hello / returning after 2+ days / done for today). The Plank button state comes from `exerciseDayState`.
*Done when:* after a plank, today's circle shows a 🐾 and the button shows ✅; after main + extra, it shows resting Pup; the greeting varies.

**M13 — Sticker Book**
Pages with ◀ ▶, silhouettes for missing stickers, gold frames, book 2+ styling, the Pup page with 7 milestone slots, and the page-prize outline when a prize is set.
*Done when:* with a test state injected via DevTools (e.g. 8 stickers + 1 milestone), the book renders correctly; tapping a sticker speaks its name.

**M14 — Progress and Parent Corner**
Progress (for Mia): Pup's path (6 stops), the paw calendar with ⭐ weeks, the plank trophy (the squat trophy slot is hidden until M17). Parent Corner: the gate modal (§4.11), `dadStats`, a 30-day bar chart as inline SVG from `dailySeries` with a goal line, and settings (child name, pet name, sound, speech, countdown, plank cap, plank goal + auto/manual, page prize + "Given" ✓), Diagnostics (version, standalone, persisted, wake lock, sessions count), and "Reset all data" (two `confirm()`s + `saveSafetyCopy('before-reset')`). Remove the M5 debug block, but keep "Test sound".
*Done when:* the gate works as specified; changing the goal/cap persists and clamps; the chart matches the stored sessions; reset returns to Setup.

**M15 — Backup export and import**
Write `logic/backup.js` (§3.6) + tests, and the UI (§3.6 steps 1–6).
*Done when:* backup tests are green; export → clear storage → import from file **and** from pasted text restores identical data (compare JSON); garbage input shows a friendly error and changes nothing.

**M16 — PWA and first release (plank-only v1.0.0)**
Icons (§9.2), `manifest.webmanifest` (§9.1), `sw.js` (§9.3), registration and update (§9.4), `tests/pwa.test.js`. Push (Pages is already enabled), and ask Dad to install on the iPhone (§10.1 steps 6–7).
*Done when:* pwa tests are green locally **and** on the Pages URL; the iPhone passes the §11.4 "Install and shell", "Plank" and "Rewards and data" sections (skipping the squat-specific items); the update test (bump to 1.0.1) works.

**M17 — Squats logic (tests first)**
Most of it already exists (cues, goal config, `applySession` handles `squat`). Add or extend the tests: squat goal 5 → 6 after 3 hits, cap 20, min 3; `applySession` with a squat input (reps, `countedReps`, `beatMs`); a sticker shared across exercises (squat first → offer; plank later → no offer, double day); a PB in squats upgrades gold; the correction bounds helper `clampCorrection(value, counted, cap)` (add it to `cues.js`: `Math.max(0, Math.min(value, cap, counted + maxCorrectionAbove))`).
*Done when:* all squat-related tests are green.

**M18 — Squats screen**
Markup from 01 (Pup large, whole body visible), controller from §5.4: countdown, metronome, Pup's CSS squat loop via `startSquatAnimation` (01 §5.5), tones, spoken counts with lead, tone-only fallback, near-goal lines, green/gold, tap to stop, the cap, visibility handling, the count check (−/+/✅/🔁), the form tip for the first 5 times.
*Done when:* on desktop, 10 reps at 2.5 s take 25 s ±0.1 s and the number, tone and pose change together; the count-check bounds are correct; ✅ saves and goes to Celebrate.

**M19 — Squats integration**
Home: show the Squats button (right side, never swapped), ✅/🎁 badges, the once-a-day "Want to do squats too?" offer (`meta.lastOfferOtherDate`). Celebrate: the Double-day scene, "One more try?" for squats. Progress: the squat trophy. Parent Corner: squat stats, the second chart, squat goal/mode/cap (10–30), tempo (2.0–3.5 s in 0.25 s steps), count-aloud toggle. Rename any remaining plank-only copy to "exercise" where it means both.
*Done when:* on the iPhone, the full "Squats" and "Rewards and data" QA sections pass, a double day shows 🐾🐾, and Dad's charts show both exercises.

**M20 — Release v1.1.0**
Bump both versions, push, verify the update reaches the installed app, and run the whole §11.4 checklist once more. Export a first real backup for Dad.
*Done when:* every checklist item is ticked and the installed app shows v1.1.0.

---

## 13. Open points for the PLAN consolidator

> **All six points below are RESOLVED in PLAN.md §4** (items 1–6). Historical notes only; do not act on them. (01 now has 36 stickers and 6 stages.)

1. **Goal growth:** this doc's default is "met 3 times since the last change, never lower" (the user's and coordinator's rule). 03 §3.3 suggests "2 in a row, −2 s / −1 rep after 3 misses in a row". Both are supported by config: for 03's version set `defaultRaiseAfterHits: 2`, `GOAL_POLICY.hitsMustBeConsecutive: true`, `defaultLowerAfterMisses: 3`. **Pick one.**
2. **Sticker catalogue:** 01-design §6.1 lists **30** stickers with its own ids. 03 (and this doc's `catalog.js`) uses **6 pages × 6 = 36** with page-prefixed ids. The engine only needs `CATALOG.pages[].ids` plus an emoji/art map. Adopt 03's pages and reuse 01's die-cut CSS/backgrounds per sticker.
3. **Pup stages:** 01-design draws **5** stages (`data-stage` 1–5); 03 defines **6** (thresholds 0/80/200/380/620/950). `PET_STAGES` has 6 (index 0–5 → `data-stage = index + 1`). 01 needs a 6th look (e.g. split its "Champion" into "Sporty" + "Super"), or drop a stage from the config.
4. **App name:** 01 §3.1 uses "Plank Pals" in meta tags but "Plank Pup" in §9.3 manifest colours. This doc uses **"Plank Pals"** everywhere (it matches the repo).
5. **Countdown:** the brief says "3‑2‑1"; 03 says 5 s default (3/5/10). This doc uses a configurable `countdownSec` (default 5), with tick tones and big digits for the last 3 s.
6. **False start:** 03 uses a 3 s window with 🔁/✅. The coordinator gave "minimum valid ~2 s". This doc combines them: < 2 s → only 🔁; 2–3 s → 🔁 or ✅.
