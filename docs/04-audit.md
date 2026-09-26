# 04 — Plan Audit

> Auditor: Audit agent, 2026-09-26. Scope: `PLAN.md`, `docs/00`–`03`. Checked against Dad's and his daughter's actual requests, cross-doc consistency, whether Sonnet can build it, child safety, and iOS realities. No app code was written. Nothing was committed or pushed.

## Verdict: **Ready with fixes. All fixes are applied, so the plan can go to Sonnet now.**

There were no blockers. I found 8 Major issues, each of which would have caused a crash or silently broken behaviour when copied "as written". All 8 are fixed in the docs. Of the 16 Minor issues, 13 are fixed and 3 are left **Open** as decisions for Dad (A1–A3).

| Severity | Found | Fixed | Open |
|---|---|---|---|
| Blocker | 0 | 0 | 0 |
| Major | 8 | 8 | 0 |
| Minor | 16 | 13 | 3 (Dad decisions) |

---

## A. Alignment with what was asked

| Request | In the plan? | Where |
|---|---|---|
| App for a 6-year-old to plank every day and get better; Dad tracks progress | Yes | PLAN §1; gentle goal growth §4.1; Parent Corner stats and charts (03 §7, 02 §4.10) |
| Planned by design, development and kid-usability agents, then audited | Yes | 01, 02, 03, and this doc |
| Device: Dad's iPhone 13 mini | Yes | PLAN §3; 375×812 layouts (01 §3); iOS QA list (02 §11.4) |
| Theme: 🐶 animal friends | Yes | Pup, 6 stages, never sad (PLAN §3) |
| Rewards: ⭐ stickers **and** 🐣 a pet that grows | Yes | 36 + 7 stickers, pick 1 of 3; Pup grows through 6 stages with tricks |
| Timer: stopwatch + goal | Yes | Plank stopwatch with goal ring and rising goal |
| Browser app, public GitHub repo, set up | Yes, verified | See C-1 below |
| Track squats too | Yes | Squat-along, rep goal, shared rewards, ships in v1.1 (M17–M20) |

**No drift that contradicts Dad or his daughter.** The kid doc's "lower the goal after 3 misses" is correctly overridden by PLAN §4.1 (never lower automatically). Health limits are sensible: plank cap 60 s by default (Dad can pick 30–90), squat cap 20 (10–30), and 1 main attempt plus 1 extra per exercise per day.

**Scope:** the plan is large but cut into 21 small milestones with tests, so Sonnet can handle it. The biggest optional features are listed under A2 for Dad to decide.

## B. Cross-reference spot-checks (25 checked)

| # | Cross-reference | Result |
|---|---|---|
| 1 | `STORAGE_KEY "plankPals.state"`: PLAN §3 ↔ 02 config/storage | OK |
| 2 | Goal numbers (10 s, +2 s to 30 s, +3 s, cap 60; squats 5, +1, cap 20, range 10–30; 3 hits; never lower): PLAN §4.1 ↔ `config.js` ↔ `goal.js` | OK |
| 3 | Stage thresholds 0/80/200/380/620/950: PLAN ↔ 03 §3.2 ↔ `PET_STAGES` ↔ 01 §5.2 | OK |
| 4 | Milestone days 7/14/21/30/50/75/100: 03 ↔ `REWARDS.milestoneDays` ↔ 01 §6.1 | OK |
| 5 | Treat table (10/5/5/5/5/3): 03 §3.2 ↔ `REWARDS.treats` ↔ `computeXp` | OK |
| 6 | Countdown 5 s default, options 3/5/10, digits for the last 3 s: PLAN §4.5 ↔ 03 ↔ `TIMING` ↔ 01 §4.3 | OK |
| 7 | Screen ids: `ROUTES` ↔ `<section id="screen-…">` (02 §7.1) ↔ 01 `#screen-squats` | OK |
| 8 | `mountPup(container, stage, mood, tpl)`: 01 §5.2 ↔ 02 §2 tree | **Mismatch → fixed (M-8)** |
| 9 | Sticker ids: 02 `catalog.js` ↔ 01 `PAGES` | **`sky-star` vs `sky-glowstar` → fixed (M-2)** |
| 10 | Trick names: `PET_STAGES.trick` ↔ 01 `trick-*` CSS | **`jumpsquat`/`backflip` had no CSS → fixed (M-1)** |
| 11 | Config keys used in `storage.js` (goalRoundTo, minGoal, capStep/Min/Max, defaultCap, default*Hits/Misses, countdownOptionsSec, beatStep/Min/MaxMs) exist in `config.js` | OK |
| 12 | Config keys used by the controllers (stopIgnoreMs, falseStartMs, minValidMs, boopEveryMs, midwayMinGoalMs, nearGoalLeadMs, speechLeadMs, speechMinBeatMs, sparkleEvery, maxCorrectionAbove, minValidReps) exist | OK |
| 13 | `GATE` (2 s hold, factors 3–9) ↔ 03 §6 ↔ 01 §4.8 | Numbers OK; input method differed → fixed (m-4) |
| 14 | `SPEECH` (rate .95, pitch 1.3, Samantha) ↔ 03 §5 | OK |
| 15 | Squat tempo 2.0–3.5 s in 0.25 s steps: 03 ↔ 01 ↔ `TIMING.squat` | OK |
| 16 | `--pup-size`/`data-stage`/`data-mood` hooks ↔ how 02 uses the stage index (0-based) | **Off-by-one risk → fixed (M-7)** |
| 17 | 01 `.screen.ex` + `.is-running/.is-goal/.is-record` ↔ 02 skeleton and `view.setColor` | **Missing `.ex` class and mapping → fixed (M-6, m-3)** |
| 18 | `#pup-plank-tpl` used by 01 (Home, Plank) ↔ 02 `index.html` skeleton | **Missing template → fixed (M-6)** |
| 19 | Squat animation: 01 CSS keyframe loop ↔ 02 JS `--squat` pose | **Contradiction → fixed (M-3)** |
| 20 | `bowl --fill` ↔ `stageForXp().progress` | OK |
| 21 | `APP_VERSION` ↔ `sw.js VERSION` (`1.0.0`) | OK |
| 22 | `ASSETS` in `sw.js` ↔ every runtime file in the 02 §2 tree | OK (all 40 entries match) |
| 23 | Double day = bonus, not a second sticker: PLAN ↔ 03 ↔ `applySession` | OK |
| 24 | `pagePrize.mode` values ↔ `normalize` ↔ `claimSticker` | OK |
| 25 | String category keys used in the controllers ↔ `strings.js` spec | **Not listed → fixed (m-2)** |

## C. Buildability checks

- **C-1: repo state (PLAN §4.8) verified as correct.** `git remote -v` shows `origin https://github.com/MaxVDP-IRL/mia-plank-pals.git`, and the local branch is `main`, tracking `origin/main`. `git log`: `0abc4c6 Initial scaffold: brief, placeholder page, README`. Tracked files: `.nojekyll`, `README.md`, `docs/00-brief.md`, `index.html`. The Pages API shows `status: built`, `source: main /`, `public: true`, and `https://maxvdp-irl.github.io/mia-plank-pals/`. The local changes (`docs/00-brief.md` modified, plus the untracked PLAN and docs 01–04) will be pushed in M0.
- **Pure logic read line by line:** `dates`, `stopwatch`, `cues`, `goal`, `streak`, `rewards`, `session`, `stats`, `backup`, `gate`, `storage`, `router` and `sw.js` have no logic bugs beyond those in the table. The example tests in 02 §11.3 are correct: I checked the streak, week-paw and DST cases by hand, and 2026-09-21 is a Monday.

## Findings

| ID | Sev | Location | Problem | Exact fix | Status |
|---|---|---|---|---|---|
| M-1 | Major | 02 §4.2 `PET_STAGES` | Stages 5 and 6 used tricks `jumpsquat` and `backflip`, but 01 §5.5 only defines `trick-jump` and `trick-flip`. Pup would do nothing at the two biggest stages. | Changed to `trick: 'jump'` and `trick: 'flip'`, with a comment listing the six valid names. Tricks are also listed in PLAN §4.3. | Fixed |
| M-2 | Major | 01 §6.1 table + `PAGES` | The Sky sticker id was `glowstar` in 01 but `star` in `catalog.js`, so the visual lookup would miss `sky-star`. | Renamed it to `star` in 01 (both the table and `PAGES`). | Fixed |
| M-3 | Major | 02 §5.4 vs 01 §5.5 | Two different squat animation methods: 02 said "no CSS keyframe loop, drive `--squat` from JS" (with no CSS written for it), while 01 gives a complete keyframe loop. | Chose 01's loop, started in the same frame as the stopwatch. In 02, removed `view.setPose`, added the `startSquatAnimation()` call and rewrote the sync note. Updated M18. Added PLAN §4.9. | Fixed |
| M-4 | Major | 02 §12 M6 (milestone order) | M6's `plank.js` imports `bestValue` from `stats.js` (written in M8). `flow.js` needs `strings.js` and `pup.js` (not in any milestone) and `applySession` (M9). Importing a name from an empty placeholder module is a SyntaxError, so the page would go blank. | M6 now also writes `strings.js`, `ui/pup.js`, `flow.js` (without the `session.js` import) and the 3 stats helpers. M0 adds a general import-order rule. Also corrected M6's section reference (01 §4.3, §5.6, §7). | Fixed |
| M-5 | Major | 01 §3.5 | The copyable bubble HTML contained `Hi Mia!`, which is the child's name in a code snippet for a public repo. | Replaced it with an empty bubble plus a comment: `textContent = fill("Hi {name}! …")`. A grep of all code-like snippets now finds no name. | Fixed |
| M-6 | Major | 02 §7.1 `index.html` skeleton | It had no `<template id="pup-plank-tpl">` (01's Home and Plank use it, so `mountPup` would throw on null), and no `.ex` class on the Plank/Squats sections (so 01 §7.3's colours and `--ex-color` would never apply). | Added the template line and `class="screen ex"` to both sections. | Fixed |
| M-7 | Major | PLAN §4.3, 02 §4.2 | `stageForXp().index` is 0–5, but art needs `data-stage` 1–6. Passing the index straight in gives no scale and no stage-1 eyes. | PLAN §4.3 and the catalog comment now say `data-stage = index + 1`. | Fixed |
| M-8 | Major | 02 §9.4 | The snippet re-imports `app` and `isLocalDev`, which `main.js` §7.3 already imports. Pasting both is a duplicate-binding SyntaxError that stops the app. | Replaced the import lines with a comment giving the merged import list for `main.js`. The §2 tree now shows the full `mountPup(container, stage, mood, tpl)` signature. | Fixed |
| m-1 | Minor | 01 §4.3 vs 02 §5.3 vs 03 §4 | Form-tip timing conflicted: 01 showed the tips *during* the countdown, while 02 and 03 show them *before* it. | Added PLAN §4.10: tips play before the countdown (~1.5 s each, spoken, tap to skip), then the countdown runs. Aligned 01. | Fixed |
| m-2 | Minor | 02 §6.3 | Controllers call named categories (`plankGoalLive`, `squatTwoMore`, `capReached`, …) that weren't listed anywhere, and a missing key speaks an empty string. `line()` was undefined. | Added the exact list of category keys, and defined `line = (cat) => pickLine(cat, vars)` and the helper imports in §5.4. | Fixed |
| m-3 | Minor | 02 §5.3 | `view.setColor('blue'/'green'/'gold')` had no mapping to 01's classes. | Added the mapping: `is-running` / `+is-goal` / `+is-record`. | Fixed |
| m-4 | Minor | 02 §4.11 vs 01 §4.8 | The gate used a native `<input inputmode=numeric>` in 02 but an on-screen keypad in 01. | 02 now uses 01's keypad. | Fixed |
| m-5 | Minor | 02 §5.4 | A squat `goal` cue after a `best` cue (best < goal − 1, e.g. Dad set a high goal) turned the gold screen back to green. | Goal handler: `if (!(sq.best !== null && c.n > sq.best)) view.setColor('green')`. | Fixed |
| m-6 | Minor | 01 §4.3/§4.4, 03 §2 | Squats "early stop" was specced two ways, and 01's count check had no 🔁 even though 02 requires one. With 0 reps, the child had no obvious next step. | PLAN §4.6: squats always go to the count check. 01's count check gets a 🔁 icon, and 01's early-stop screen is now plank-only. | Fixed |
| m-7 | Minor | 02 §5.2, §5.5 | Wake Lock was said to be acquired "inside the user gesture" at countdown start, which isn't true when form tips come first. | `startExercise()` now also calls `acquireWakeLock()`, which is safe to call twice. | Fixed |
| m-8 | Minor | 02 §5.3 | 03 says a plank that hits the cap says "Wow! Super! Rest now!", but the plank controller never said it. | `if (capped) speakLine('capReached')` added in `finish()`. | Fixed |
| m-9 | Minor | 02 §5.5 | `showBubble()` was called but never specified. | Added a one-paragraph spec (`textContent`, lifetime, hidden during squat reps) and the list of imports for `flow.js`. | Fixed |
| m-10 | Minor | 02 §12 M0/M16 | M0 said "git setup from §10.1" and M16 said "enable Pages (Dad)", but both are already done (PLAN §4.8). | M0 now says to skip steps 1, 2 and 5; M16 says Pages is already enabled. | Fixed |
| m-11 | Minor | 02 §13 | The "open points" were stale (they still said 30 stickers and 5 stages) and could mislead Sonnet. | Added a banner saying they're all resolved in PLAN §4. | Fixed |
| m-12 | Minor | 02 §4.2 vs 01 §6.1 | The Sparkle page icon was 👑 in the data but 💎 in the design (and 👑 is also a sticker on that page). | Catalog now uses 💎. | Fixed |
| m-13 | Minor | PLAN §4 (new §4.11) | iOS won't speak before the first tap after launch, so the cold-start Home greeting would silently not play. The ring/silent switch mutes Web Audio. | Added PLAN §4.11: greeting shown as text only on a cold start, with speech from the first tap on. The existing silent-switch hint and Auto-Lock advice are kept. | Fixed |
| A1 | Minor | PLAN §3 "Privacy"; `docs/*` | PLAN said the name is never "in commits", but `docs/00-brief.md` (already pushed), 01, 02 and 03 mention her first name, and the repo is named after her. | Reworded PLAN §3: no name in app code, tests or commit messages. The docs keep it. **Dad decides** whether the public docs may mention her first name. If not, replace "Mia" with "the child" in `docs/` before M0's push. | Open (Dad) |
| A2 | Minor | 03 §8 v1 scope | Optional extras add Sonnet work without being asked for: page prize (settings, prize list, "Given" tick), the Book 2 sparkle, the "show-off every 150 treats" effect, and the priority queue for big moments. | Recommendation: keep them (they are specced and tested). If Sonnet struggles, move the **page prize** to `docs/LATER.md` first. **Dad decides.** | Open (Dad) |
| A3 | Minor | PLAN §5.6 | Two releases: a plank-only v1.0 at M16, then squats in v1.1 at M20. His daughter asked for squats, so she'll wait a few milestones for them. | This is reasonable because she can start planking sooner. **Dad decides** whether to show v1.0 to her early or wait for v1.1. | Open (Dad) |

## D. Child safety and wellbeing: passed

- Exercise limits are age-appropriate (hard caps, 1 main + 1 extra attempt per exercise per day, knee plank and chair squat both count). There is no "keep going" pressure after the goal.
- There are no guilt or shame mechanics: Pup never gets sad, missed days stay neutral, no streak counter is shown to her, and there is no red and no ✗. The second exercise is offered at most once a day.
- No data leaves the device: localStorage only, and the service worker ignores cross-origin requests. There are no CDNs, fonts, analytics or links out, and the app must work in airplane mode (PLAN §5.7).
- The parent gate is a 2 s hold plus a random 3–9 × 3–9 question on a keypad, and a wrong answer closes quietly. It unlocks for 5 minutes. First-run Setup has no gate, which is correct.
- The name is never hardcoded in any code snippet (after fix M-5). The M11 and DoD greps enforce this, and tests use `"TestKid"`.

## E. iOS realities: covered

- **Wake Lock** in a standalone PWA works reliably from about iOS 18.4. The plan feature-detects it, shows Auto-Lock advice as the fallback, and has a QA item. It is now also acquired on the Start tap (m-7).
- **Audio and speech** are unlocked in the click handler with a silent buffer and an empty utterance, and a global `touchend`/`click` listener resumes an interrupted context. Speech runs 200 ms early on squats, with a tone-only fallback below a 2.0 s beat. The silent-switch hint is kept, and the cold-start greeting is handled by PLAN §4.11.
- **Storage eviction:** Home Screen apps are exempt from Safari's 7-day eviction, `navigator.storage.persist()` is requested, and Home Screen and Safari tab storage are separate. The plan warns that deleting the icon deletes the data. Backups are available via the Share sheet and copy/paste.
- **Service worker under `/mia-plank-pals/`:** registration, scope, manifest `start_url`/`scope`/`id` and all `ASSETS` use relative `./` paths. Install uses `cache: 'reload'`. A new version activates with `skipWaiting` and `clients.claim`, then the app reloads only when Home is showing. `reg.update()` runs each time the app comes to the front. There is no service worker on localhost unless `?sw` is added.
