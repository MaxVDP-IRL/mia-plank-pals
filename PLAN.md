# Plank Pals: Master Build Plan

> **Audience:** Claude Sonnet (the builder). **Read this file first, completely.** It is the single entry point and **overrides** anything in `docs/` that conflicts with it (see §4).
> **Owner:** Dad (repo `MaxVDP-IRL/mia-plank-pals`). **User:** his daughter, age 6.

---

## 1. What we're building (one paragraph)

**Plank Pals** is a tiny, offline-first, browser-based app (a PWA) that runs on Dad's **iPhone 13 mini**. It helps a 6-year-old do a **plank** and/or **squats** every day and get a little better over time. A cute puppy friend, **Pup** (she names him), cheers her on, **grows through 6 stages** as she keeps exercising, and never gets sad. Each exercise day she **picks 1 of 3 face-down stickers** for her **Sticker Book**. The plank uses a **stopwatch with a gently rising goal**. Squats use **"Squat-along"**: Pup squats on a steady beat, the app counts reps aloud, and she taps to finish. Dad gets numbers, charts, settings and backup in a **Parent Corner** behind a grown-up gate. No accounts, no server, no ads. All data stays on the phone.

## 2. Documents and how to use them

| File | Owns | When to read |
|---|---|---|
| `PLAN.md` (this) | Final decisions, overrides, build process | First, and whenever unsure |
| `docs/00-brief.md` | Original requirements from Dad and his daughter | Once, for context |
| `docs/02-development.md` | **Architecture, data, logic, platform, the milestone order (§12), tests (§11)** | Your main workbook: follow §12 milestone by milestone |
| `docs/01-design.md` | Visuals: CSS tokens, layouts, Pup SVG, stickers, animation, icon | When a milestone builds UI |
| `docs/03-kid-experience.md` | Flows, reward rules, all copy/spoken lines, guardrails, playtest | When a milestone builds a flow or needs text |
| `docs/04-audit.md` | Audit of this plan; its fixes are already applied to the docs | Only if curious; nothing to act on |

**Precedence when documents disagree:** `PLAN.md` §4 → `02-development.md` for data/logic/numbers (`js/config.js` is the single source of numbers) → `01-design.md` for visuals → `03-kid-experience.md` for flows and copy. If there's still real ambiguity, **pick the simpler option, write it down in `docs/DECISIONS.md`, and keep going.** Don't stall.

## 3. Fixed decisions (do not change)

| Topic | Decision |
|---|---|
| Stack | Vanilla HTML + CSS + JS ES modules. **No framework, no npm, no build step, no CDN.** |
| Hosting | GitHub Pages, repo `MaxVDP-IRL/mia-plank-pals`, branch `main`, folder `/` (root). URL: **https://maxvdp-irl.github.io/mia-plank-pals/**. **All URLs relative** (`./…`). |
| Device | iPhone 13 mini, Safari, installed via Add to Home Screen (375×812, safe areas, portrait only). |
| Privacy | **The child's name is never in app source code (`index.html`, `js/`, `css/`, `sw.js`, manifest), tests, or commit messages.** It's typed at first launch and stored in localStorage only. Tests use `"TestKid"`. (The repo name and the planning docs in `docs/` already contain her first name; Dad accepted a public repo. Don't add it anywhere new.) |
| Storage | One localStorage key `plankPals.state`, schema v1 (02 §3). Backup/restore via file and copy/paste (02 §3.6). |
| Exercises | **Plank** (seconds) and **Squats** (reps). |
| Theme | Animal friends: **Pup**, 6 stages, never sad/sick/gone. |
| Rewards | 1 sticker per exercise day (pick 1 of 3 face-down; no duplicates, no rarity). 36 page stickers (6 pages × 6) + 7 milestone stickers. Doing both exercises on a day = **Double day** (bonus treats + 🐾🐾 stamp), **not** a second sticker. |
| Streaks | Mia sees **no streak counter**, only a weekly paw row (Mon–Sun). Dad sees streak numbers (one rest day allowed). |
| Language | English UI; icon-first, every child-facing line is also spoken (speechSynthesis) and shown in a speech bubble. |

## 4. Resolved conflicts (these override `docs/`)

1. **Goal growth:** raise after the goal is **met 3 times** (not necessarily consecutive) since the last change; **never lower automatically.** Plank: start 10 s, +2 s up to 30 s, then +3 s, cap 60 s. Squats: start 5, +1, cap 20 (Dad can set the cap 10–30). Dad can override the goal manually in Parent Corner. (= the 02 defaults; ignore 03 §3.3's "lower after 3 misses".)
2. **Sticker catalogue:** use **03's 6 pages × 6 = 36 page-prefixed ids** (e.g. `garden-sunflower`) + 7 milestones, as in `02 §4.2 catalog.js` and the updated `01 §6.1`. If an older list of 30 is found anywhere, ignore it.
3. **Pup stages:** **6** (treat thresholds 0 / 80 / 200 / 380 / 620 / 950). `data-stage` = 1–6 = **`stageForXp(xp).index + 1`** (the index is 0-based; never pass it straight to `mountPup`). Use 01 §5.2. Tricks per stage: `wag`, `sit`, `highfive`, `spin`, `jump`, `flip` → `data-mood="trick-<name>"` (01 §5.5).
4. **App name:** **"Plank Pals"** everywhere (title, manifest `name`/`short_name`, home-screen label).
5. **Get-ready countdown:** configurable, **default 5 s**, tick tones + big digits for the last 3 s.
6. **False start:** Plank stop at < 2 s → only 🔁 (try again); 2–3 s → 🔁 or ✅ (count it). Squats have no separate early-stop screen: a stop always goes to the count check, where ✅ is disabled at 0 reps and 🔁 redoes without saving.
7. **Squat progress indicator:** use 01's **goal ring** (not a row of dots, which is unreadable from 2 m).
8. **Repo setup is already done.** The local folder is already a git repo on `main`, the remote `origin` is set, the public repo exists, `.nojekyll` exists, and **GitHub Pages is already enabled** (main, root). In 02 §10.1 **skip steps 1, 2 and 5**. Just commit and `git push` after each milestone. The current `index.html` and `README.md` are placeholders: replace `index.html` in M0 and keep `README.md` (update its status line at releases).
9. **Squat-along animation:** use **01 §5.5's CSS keyframe loop** (`data-mood="squat"`, `--beat`), started by `startSquatAnimation()` in the same frame as the squat stopwatch starts. There is **no** JS-driven `--squat` pose (02 §5.4 is updated to match).
10. **Form tips:** for the first 5 starts of each exercise (and on ❓), the tip card plays **before** the countdown: its tips one after another (4 for plank, 5 for squats, 03 §4; ~1.5 s each, each spoken, a tap skips to the countdown). Then the normal countdown runs; the card stays visible but silent. After 5 starts, no card.
11. **iOS audio/speech realities:** iOS won't speak or play sound until the first tap after each app launch, so the Home greeting on a cold start is **shown in the bubble only**; speak greetings from the first tap on (e.g. tapping Pup, or any button). The ring/silent switch mutes Web Audio: keep Setup's hint. If Diagnostics says Wake Lock is unavailable, Dad sets Auto-Lock ≥ 2 min (02 §5.2).

## 5. How to build (process rules for Sonnet)

1. Work through **`docs/02-development.md` §12, milestones M0 → M20, strictly in order.** Don't start the next milestone until every "Done when" check passes and `tests.html` is all green.
2. Before each milestone, read the sections it cites (02, 01, 03). Copy the "complete" code blocks from 02 **as written**, and only fix obvious bugs. If you fix one, note it in `docs/DECISIONS.md`.
3. Obey 02 §0 "Golden rules" at all times, especially: relative URLs, pure logic in `js/logic/`, local date strings, no `innerHTML` with user data, every new file added to `ASSETS` in `sw.js`, no magic numbers outside `js/config.js`.
4. **Commit and push at the end of every milestone** with the message `M<n>: <short summary>`. End every commit message with the attribution line your harness gives you.
5. Test locally with `py -m http.server 8000` in the project folder, using desktop Chrome at 375×812 (02 §11.1). Ask Dad to do the iPhone checks at the milestones that need them (M5, M6, M16, M19, M20), and give him the exact checklist items from 02 §11.4.
6. **Two releases:** **v1.0.0 = plank-only** (end of M16), so the child can start using it early. **v1.1.0 = plank + squats** (M20). Bump `APP_VERSION` and `sw.js VERSION` together on every release.
7. **Stay in scope.** Build only what 03 §8 lists as *v1*. Put anything else in `docs/LATER.md`. No notifications, no accounts, no analytics, no external requests of any kind (the app must work in airplane mode).
8. If you're stuck on the same problem for more than 2 attempts, stop, write down what you tried, and ask Dad.

## 6. Definition of done (v1.1.0)

- [ ] Installed from `https://maxvdp-irl.github.io/mia-plank-pals/` on the iPhone 13 mini; opens full-screen, works in airplane mode.
- [ ] First launch: Dad types her name → she meets Pup and names him → Home.
- [ ] Plank: countdown → stopwatch with goal ring, spoken encouragement, screen stays on → tap anywhere to stop → celebration tier → pick a sticker.
- [ ] Squats: countdown → Pup squat-along with beat, tone + number + (optional) spoken count in sync → tap to finish → −/+ count check → celebration.
- [ ] Double day works; Pup grows at the right thresholds; the weekly paw row updates; the Sticker Book fills.
- [ ] Goals rise gently per §4.1 and never drop on their own.
- [ ] Parent Corner (hold 2 s + multiplication gate): stats, 30-day charts for both exercises, settings, diagnostics, backup export/import, reset.
- [ ] `tests.html` all green locally and on the Pages URL. `grep -ri "<child's name>" js css index.html tests` finds nothing.
- [ ] Every item in 02 §11.4 is ticked on the real iPhone.
- [ ] Dad runs the 10-minute kid playtest (03 §9) and records feedback in `docs/PLAYTEST.md`.

## 7. Kick-off prompt for Dad to give Sonnet

> You are building "Plank Pals" in this folder. Read `PLAN.md` fully, then `docs/02-development.md` §0–§2 and §12. Build milestone M0 only, run its "Done when" checks, commit and push, then stop and report back to me with what you did and what I need to check on my iPhone (if anything). After I say "next", do the next milestone the same way.

(One milestone per turn keeps a weaker model on track. When things go smoothly, Dad can say "do M2–M4" to batch the pure-logic milestones.)
