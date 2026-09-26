# 03 — Kid Experience: Usability & Enjoyment

> Author: Kid Usability & Enjoyment agent. Screen names follow the brief: **Home**, **Plank**, **Squats**, **Celebrate**, **Sticker Book**, **Progress**, **Parent Corner**.
> The doc calls the child "Mia", but **the app must never hardcode her name**. The repo is public. Dad types her name on first launch, it is stored only in localStorage, and every line uses a `{name}` placeholder. The pet's name uses `{pup}` (default "Pup"), and `{n}` is a number (seconds or reps).
> **"Exercise"** means Plank or Squats. An **"exercise day"** is any day with at least one of them.

**Guiding rule:** *show up, try, and get something nice.* Any attempt counts, **one exercise is a full day**, and nothing is ever taken away.

---

## 1. Who Mia is (age 6)

| Area | What to expect | What it means for the app |
|---|---|---|
| Reading | Knows her name, a few sight words ("go", "yes", "no", "Mia"), and digits 0–60+ | Icons first. Spoken audio for every prompt. Big numbers are fine; sentences are not. |
| Fine motor | Taps are imprecise. Swipes, long-presses and double-taps are unreliable. | Tap targets **≥ 64×64 pt** (Apple's minimum is 44). Leave ≥ 16 pt between targets. One tap does one thing. No gestures for her. |
| Attention | Focused for about 2–5 minutes on one task. Long intros bore her. | One exercise takes **< 90 s**, and both together **< 3 min**. Animations run 1–3 s. No waiting. |
| Delights | Animals, surprises (a flip or reveal), collecting and completing sets, being "big", her own name said aloud, silly sounds, copying a character (Simon-says), choosing things herself | Pup leads and reacts, face-down sticker cards, pages that fill up, Pup says her name |
| Frustrations | Losing things, not knowing what to tap, waiting, "you failed", stuff that is too hard, being rushed, feeling told "you must" | Nothing is lost. There is always one obvious big button. No fail states. The second exercise is always optional. |

### Physical context
**Plank screen:** she is **face-down**, looking at the floor. The best spot for the phone is **flat on the floor between her hands**, screen up, in portrait. Otherwise Dad holds it.
- **Glanceable:** one huge seconds number (e.g. `23`, not `0:23`). A ring fills toward a 🦴 bone that marks the goal. The background shifts from **blue → green at goal → gold at a new personal best**.
- **Audio does the talking:** a countdown voice, a soft "boop" every 5 s, Pup cheers at halfway, a spoken "3… 2… 1…" before the goal, and a chime at the goal.
- **No precise taps:** once the plank starts, **the whole screen is the Stop button**. She can slap it when she drops, or Dad can tap it.
- **Get-ready time:** a spoken **5 s countdown** after Start (Dad can set 3/5/10 s in Parent Corner).

**Squats screen:** she is **standing** and copying Pup, so she needs to see Pup's whole body.
- Prop the phone **upright at about her chest height**, e.g. leaning on a sofa cushion or a chair seat about 1–2 m away, or Dad holds it. A tip on first use: "Put the phone where {name} can see {pup}." (with a picture)
- **Pup is the biggest thing on screen** (~60% of the height), with the rep count large above him and a 🦴 goal marker on a row of dots (one dot per rep).
- **The beat is heard as well as seen:** a low "boop" on the way down and the spoken count on the way up.
- **Stop:** she is standing, so **tapping anywhere** is easy for her.

**Both screens:** keep the screen awake (Wake Lock; see the dev doc).

---

## 2. Core daily loop

### Home with two exercises
- There are **two big picture buttons side by side**, always in the same place: **Plank (left)** shows Pup in a plank, and **Squats (right)** shows Pup squatting. Each is ≥ 150×150 pt. Tapping a button speaks its name and starts it straight away.
- **Doing just one is a full, complete day.** She gets the sticker, the paw print and the treats.
- **After one exercise**, that button gets a ✅ and a happy Pup face. The other button gets a small 🎁 badge and a **slow, soft glow** (no bounce, no sound loop). **Once per day**, on returning Home, Pup says: "Want to do squats too? Only if you want!" After that, Pup stays quiet.
- **After both:** both buttons show ✅, and Pup is happily sleepy: "Double day! See you tomorrow!"
- **No preferred order.** Don't reorder the buttons and don't suggest "do plank first".

### Exact taps on a one-exercise day (4 taps)
| # | Tap | Screen | What happens |
|---|---|---|---|
| 0 | App icon | → **Home** | Pup wags: "Hi {name}! Plank or squats?" |
| 1 | **Plank** (or **Squats**) | → **Plank** / **Squats** | A 5 s spoken countdown with a form tip picture, then the exercise starts. |
| 2 | **Tap anywhere** | → (Squats only: count check, see below) → **Celebrate** | The result plays (§3.4). Pup's treat bowl fills. |
| 3 | **One of 3 face-down cards** | Celebrate | The card flips, Pup names the sticker, and it flies into the **Sticker Book** (2 s, automatic). |
| 4 | **🏠** (or close the app) | → **Home** | The 🎁 glow is on the other exercise. |

**Squats count check (+1 tap):** after she stops, Squats shows the **big number** with a large **−** and **+** on either side and a big **✅**. Pup says: "{n} squats! Is that right?" This step is mainly for Dad. The + button can raise the count by at most 5 above what the app counted. There's no timeout, because auto-advancing confuses kids.

**Second exercise the same day:** the same taps, but Celebrate has **no sticker pick**. It plays a short **"Double day!"** scene instead (§3.1).

**Timing:** one exercise ≈ 40–90 s. Both ≈ 2–3 min.

**Edge cases**
- **Tap during the countdown** cancels and returns to the ready state. No penalty.
- **Plank stopped within 3 s / Squats stopped before rep 1:** show 🔁 (try again, not counted) and ✅ (count it).
- **Plank hard cap at 60 s** (Dad can set 30–90) and **Squats cap at 20 reps** (Dad can set 10–30). Both auto-finish as a win: "Wow! Super! Rest now!"

### First-ever launch: two parts
**Part A: Grown-up setup (Dad, one screen, ~30 s, no gate needed on first run)**
1. "Child's name" text field (empty, placeholder "Name"). Required. Stored only on the phone.
2. Starting goals: plank **10 s**, squats **5 reps** (steppers).
3. A 🔊 "Test sound" button, which also unlocks iOS audio and speech. Show a hint: "Check the ring/silent switch."
4. A "Hand the phone to {name} →" button.

**Part B: Meeting Pup (Mia, magical, ~45 s)**
1. The screen goes dark with soft music. A **wiggling basket** appears. Voice: "{name}! Something is in the basket! Tap it!"
2. She taps → the blanket flies off → a tiny puppy pops out, sneezes and wags. "Hi {name}! I'm your new puppy!"
3. **Naming** (built for a pre-reader): 6 big picture cards in a 2×3 grid. **Tapping a card says the name aloud.** Pup tilts its head at each one.

   | Card | Name | Picture |
   |---|---|---|
   | 1 (pre-selected, glowing) | **Pup** | 🐾 |
   | 2 | Biscuit | 🍪 |
   | 3 | Sunny | ☀️ |
   | 4 | Bubbles | 🫧 |
   | 5 | Star | ⭐ |
   | 6 | Noodle | 🍜 |

   A big **✅** confirms: "I love it! I'm {pup}!" A small **✏️ "Grown-up: type a name"** link lets Dad type any name (max 12 characters). Dad can rename later in Parent Corner.
4. Home: "Let's do our first exercise together! Plank or squats?" Both buttons glow. The form tip for each exercise plays the first time she picks it.

---

## 3. Reward system (⭐ stickers + 🐣 a growing Pup, shared by both exercises)

**Only two things to collect:** stickers, and Pup's growth. The treat bowl is Pup's growth meter. It is **never a spendable currency** and **never shows a number** to Mia.

### 3.1 Stickers
**When she gets one**
- **1 sticker per day**, earned by the **first exercise of the day**, whichever it is and however long it lasts. Effort counts.
- **The second exercise earns no second sticker.** Instead she gets the **Double day!** scene: Pup does two tricks back-to-back, a 🐾🐾 double paw stamps onto today's circle, and a bonus treat splash. This keeps the book at a steady pace and keeps "both" a **nice extra, not a must**. A sticker per exercise would make one-exercise days feel like "half" days.
- **Personal best** (plank seconds or squat reps): today's sticker gets a **gold shiny frame**. If the PB happens later that day (second exercise or one more try), the sticker is upgraded in place.
- **Milestone stickers** go on a special "Pup page" and are given automatically, with no choice. They unlock on **total exercise days** (never consecutive days): **7, 14, 21, 30, 50, 75, 100**.

**How she gets it: choose 1 of 3 face-down cards.**
- This gives her a sense of agency and a reveal moment. It is **not a loot box**: all 3 cards are drawn from the stickers still missing on the current page, so there are **no duplicates, no rarities and no bad picks**.
- The two cards she didn't pick are **not revealed** (no "I wanted that one!").
- If only 2 or 1 stickers remain on a page, show 2 or 1 cards. The last one is announced: "The last one! Page done!"

**The book (v1): 6 themed pages × 6 stickers = 36, plus the Pup page (7 milestone slots).** Emoji can stand in for art.

| Page | Theme | Stickers |
|---|---|---|
| 1 | Garden | 🌻 🦋 🐞 🌈 🐌 🍄 |
| 2 | Ocean | 🐠 🐳 🐙 🐚 🦀 ⭐ (starfish) |
| 3 | Yummy | 🍓 🍦 🧁 🍌 🍕 🍉 |
| 4 | Sky | 🌙 🌟 🚀 ☁️ 🎈 🪐 |
| 5 | Jungle | 🦁 🐒 🦜 🐘 🦒 🐯 |
| 6 | Sparkle | 👑 🦄 💖 💎 🪄 🏆 |

- Empty slots show **grey silhouettes**.
- **Pace:** at ~5–6 exercise days a week, a page takes **~1 week** and the book **~6–7 weeks**.
- **Page full:** a tier-3 celebration (§3.4), plus the page prize if Dad set one (§3.6).
- **Book full:** "New book!" A Book 2 cover appears with the same 36 stickers in **sparkly/gold versions** (cheap: CSS filter plus a gold border). Book 1 stays browsable.

### 3.2 Pup grows
**Treats (growth points)**
| Event | Treats |
|---|---|
| First exercise of the day (any length) | **+10** |
| Second (other) exercise the same day | **+5** |
| **Double day** bonus (both done) | **+5** |
| Reached that exercise's goal | **+5** each |
| New personal best | **+5** each |
| One more try (max 1 per exercise per day) | **+3** |

A one-exercise day earns ~13 treats and a double day ~28 (average ~18). Doing both helps Pup grow **a bit** faster, but not twice as fast, so single-exercise days never feel like falling behind. Mia sees a bowl filling toward a 🦴, never a number.

**Stages** (day estimates assume a mix of ~18 treats a day):
| Stage | Treats needed | ≈ Exercise days | Look | New trick (on tap / at Celebrate) |
|---|---|---|---|---|
| 1 Tiny Pup | 0 | day 1 | Small, big eyes, wobbly | Wag + sneeze |
| 2 Puppy | 80 | ~day 5 | A bit bigger, red bandana | **Sit** |
| 3 Buddy | 200 | ~day 11 | Bigger, collar with a star tag | **High-five** |
| 4 Big Pup | 380 | ~day 21 | Taller, little cape | **Spin** |
| 5 Sporty Pup | 620 | ~day 34 | Headband + sneakers | **Jump squat** (a big happy jump) |
| 6 Super Pup | 950 | ~day 53 | Full size, gold medal | **Backflip** |

- Gaps: ~5 → 6 → 10 → 13 → 19 days. Quick early wins, then slower.
- **Stage-up** is a tier-3 moment: dim, drumroll, glow, Pup pops bigger. "Look! I'm growing! Thank you, {name}!"
- **After Super Pup:** every 150 treats Pup shows off with a heart burst and a random trick.
- **Pup does the exercises with her from day 1.** In Plank, a wobbly baby plank gets steadier each stage. In Squats, Pup must keep a **clear, steady beat at every stage** (he leads). Only his size and outfit change, plus a happy tail wag at each rep.

**Pup never gets sad, sick, hungry, or leaves.** Skipping days, or skipping one of the two exercises, changes nothing about Pup. Why: guilt mechanics turn a pet into an obligation, cause real distress at age 6, and teach "exercise so something bad doesn't happen" instead of "because it feels good". Pup only ever **gains**. When she returns, Pup is **happy to see her** and never makes her feel guilty.

### 3.3 Goals (Dad-tunable; suggested algorithms)
| | Plank | Squats |
|---|---|---|
| Start | 10 s | 5 reps |
| After reaching it | **2 times** in a row → +2 s (to 30 s), then +3 s | **2 times** in a row → **+1 rep** |
| After missing it **3 main attempts in a row** | −2 s, quietly (min 5 s) | −1 rep, quietly (min 3) |
| Max | cap (60 s default) | cap (20 reps default) |

Each exercise has its own goal and PB. The goal only ever appears as the 🦴. There is **no red, no ✗, no "failed"**.

### 3.4 Celebrations: distinct and escalating (same for both exercises)
| Tier | Trigger | During the exercise | On Celebrate |
|---|---|---|---|
| 0 **Did it!** | Any attempt below goal | — | Pup wags, hearts, soft chime. "Good job, {name}!" |
| 1 **Goal!** | Reached the goal | Chime, screen turns **green**, "You did it!" (she can keep going) | Confetti, Pup's newest trick |
| 2 **New record!** | Beat the PB | Screen turns **gold** with a fanfare sting | Big confetti and fanfare, the 🏆 updates, gold sticker frame. "NEW RECORD!" |
| 3 **Big moment** | Stage-up, page full, book full, milestone sticker | — | A full-screen scene after the sticker. **Max one per session**; queue extras. |
| + **Double day** | Second exercise done | — | Two tricks back-to-back, 🐾🐾 stamp. Shown on top of that exercise's tier 0–2. |

Show only the **highest** of tiers 0–2, then at most one tier 3.

### 3.5 Streaks: kind rules only
**Recommendation: no streak counter for Mia. Use a weekly paw-print row.**
- Home shows **7 circles (Mon–Sun)**. An exercise day gets a 🐾, and a double day gets 🐾🐾 (two small paws in one circle). A missed day stays a **plain empty circle**: no red, no ✗. **The row resets every Monday.**
- **5+ paws in a week** (either exercise) → a ⭐ week stamp on the Progress calendar. Double days do not count extra here, because consistency matters more than volume.
- Milestones use **total exercise days**, which **never go down**.
- Dad sees streaks and "double days this month" in Parent Corner (as numbers, for info only).

### 3.6 Real-world reward hook (optional, for Dad)
In Parent Corner → "Page prize":
- **Off by default.** Options: every page (~weekly) / every 2 pages / whole book.
- Dad picks a prize **picture**: 🍦 ice cream · 🏞️ park trip · 🎬 movie night · 🥞 pancake breakfast · 🎨 craft time · 📚 new book · ✏️ custom (emoji + short text).
- Mia sees it **as a picture in a gift outline** at the bottom of the current sticker page: "Fill this page → 🍦".
- When the page is full: "Page full! Show Dad! 🍦". Parent Corner shows "Prize to give" → Dad taps ✓ "Given".
- **Don't tie prizes to double days.** That would turn the second exercise into a must.
- Tip for Dad: *"Pick things you do together, not toys."*

---

## 4. Healthy-exercise guardrails
*(Gentle, common-sense defaults; not medical advice.)*

| | Plank | Squats |
|---|---|---|
| Start goal | 10 s | 5 reps |
| Cap (auto-finish as a win) | 60 s (Dad: 30–90) | 20 reps (Dad: 10–30) |
| Per day | 1 main attempt + max 1 "one more try" | 1 main attempt + max 1 "one more try" |
| Easier option | Knee plank (counts the same) | Chair squat: sit down onto a real chair and stand up (counts the same) |

- After the main attempt(s), that exercise's button shows ✅. Once both are done (or one done plus its one more try), Pup rests happily: "See you tomorrow!" Nothing sad.
- **Never pressure:** no "just 5 more!", no comparing, and no push toward the second exercise beyond **one** gentle, once-a-day offer.
- **Any attempt earns something.**

### Form tip cards (a picture with a spoken voice, ~6 s)
They show before the countdown for the **first 5 times** of each exercise, and any time she taps **❓**.

**Plank:** 🪵 "Straight like a board!" · ✋ "Hands under shoulders." · 👀 "Look at the floor." · 🎈 "Breathe, like a balloon!" · side panel: "Knee plank is OK too!"

**Squats:**
1. 🦶🦶 "Feet apart!" (feet about shoulder-wide, toes pointing forward)
2. 🧟 "Arms out, like a zombie!" (arms straight in front help her balance, and it's funny)
3. 🪑 "Sit back on a chair!" (bottom goes back, as if sitting on an invisible chair)
4. 🦒 "Chest up tall!"
5. ⬆️ "Stand up tall!" (all the way up at the top)
- Side panel: "Use a real chair if you like!"
- Keep it **to these five**. Don't cue knees or depth for a 6-year-old; the chair image handles both.

### Squat-along: is it right for a 6-year-old? **Yes. Keep it as the default.**
- Copying a character on a beat is a classic, well-loved game at this age (Simon-says). It removes counting, which she can't do reliably while moving, and it **slows her down**. Left alone, kids this age do fast, shallow bounces.
- **Tempo:** the default of **1 rep every 2.5 s** is right: ~1.2 s down, a short sit, ~1.2 s up. Dad can set it from **2.0 s (fast) to 3.5 s (slow)** in Parent Corner. If she lags behind Pup, go slower; if she's bored or rushes ahead, go faster.
- **Beat design:** Pup goes down with a low "boop", then comes up and the voice says the number ("One!"). The number is said **on the way up**, so it rewards standing tall. Every 5th rep gets a tiny sparkle.
- **Speech timing:** iOS `speechSynthesis` can lag 0.2–0.5 s. If the count drifts from Pup's movement, the **tone and the on-screen number are the source of truth** and the spoken number is a bonus. Plan for a tone-only fallback (Dev agent).
- **Near goal:** the voice says "Two more!", then "One more!", then chimes at the goal. She can keep going to the cap.
- **Stopping:** she taps anywhere when tired. Reps count only when **completed** (reached the "up" beat).

---

## 5. Encouragement copy & voice

**Voice:** `speechSynthesis`, en voice (prefer "Samantha" on iOS if present), `rate 0.95`, `pitch 1.3`. The first utterance must follow a user tap (Start or Test sound) to unlock iOS audio. Every spoken line is **also shown as big text** in Pup's speech bubble. Pick lines at random within a category and **never repeat the same line twice in a row**. Keep all strings in one file for later translation. Placeholders: `{name}`, `{pup}`, `{n}`.

### Shared
| Category | Lines |
|---|---|
| **Home / hello** | "Hi {name}! Plank or squats?" · "Woof! Let's be strong, {name}!" · "Exercise time! I'm ready!" |
| **Sticker reveal** | "Pick a card!" · "A {sticker}! Into the book!" |
| **One more try** | "One more? Only if you want!" |
| **Offer the other exercise** (max once a day) | "Want to do squats too? Only if you want!" · "Want to plank too? Only if you want!" |
| **Double day** | "Plank AND squats! Double day!" · "Two paws today! Woof woof!" |
| **Done for today** | "See you tomorrow, {name}!" · "Great day! Bye bye!" |
| **Returning after a break** (2+ days) | "{name}! I missed you! Let's play!" · "Yay, you're back! Woof!" |
| **Stage-up** | "Look! I'm growing! Thank you, {name}!" · "I learned a new trick!" |
| **Tap Pup on Home** | "Hee hee!" · "Woof!" · "Again! Again!" |
| **Cap reached** | "Wow! Super! Rest now!" |

### Plank
| Category | Lines |
|---|---|
| **Countdown** | "Get in your plank! 3… 2… 1… Go!" · "Like a board! 3… 2… 1… Go!" |
| **Midway** | "You're doing great, {name}!" · "Breathe! Like a balloon!" · "Strong like a lion!" · "Wow, so steady!" |
| **Near goal** | "Almost at the bone! 3… 2… 1…" |
| **Goal** | "You did it! You got the bone!" · "{name}, you reached the bone!" |
| **PB** | "NEW RECORD! {n} seconds!" · "Your best plank ever!" |
| **Below goal** | "Good job, {name}! You tried!" · "Nice plank! So strong!" · "Every plank makes you stronger!" |

### Squats
| Category | Lines |
|---|---|
| **Countdown** | "Stand up tall! Feet apart! 3… 2… 1… Squat with me!" · "Copy me, {name}! 3… 2… 1… Go!" |
| **Count** (on the "up" beat) | "One!" · "Two!" · "Three!" … up to the cap |
| **Midway** (sprinkled between counts, not over them) | "Sit on the chair!" · "Strong legs, {name}!" · "Down… and up!" |
| **Near goal** | "Two more!" · "One more!" |
| **Goal** | "You did it! Squat star!" · "Yes! {n} squats!" |
| **PB** | "NEW RECORD! {n} squats!" · "Most squats ever, {name}!" |
| **Below goal** | "Good squatting, {name}!" · "{n} squats! Nice legs!" · "You copied me so well!" |
| **Count check** | "{n} squats! Is that right?" |

**Never say:** "failed", "too short", "you missed", "you lost", "don't forget", "only" (except in "only if you want"), "try harder", "you didn't do squats/plank".

---

## 6. Accessibility for a pre-reader
- **Icon first, always:** every child-facing button is a picture. Any text is for Dad.
- **Everything speaks:** tapping an icon button says its name ("Squats!") and acts immediately.
- **Consistent positions:**
  - **Home:** Plank big left and Squats big right (never swapped); 📖 Sticker Book bottom-left; 🏆 Progress bottom-right; small, dim 🔒 top-right.
  - **Every other child screen:** 🏠 top-left (64 pt) and ❓ form tip top-right (on the Plank/Squats ready state).
- **No hidden gestures for the child:** no swipes, long-press or pinch. The Sticker Book turns pages with big ◀ ▶.
- **One obvious next step per screen.** The main button pulses gently after 5 s of no taps (except the post-exercise 🎁 glow, which stays calm).
- **Colour is never the only signal:** 🦴 plus sound for the goal, 🏆 plus fanfare for a PB, ✅ for done.
- **Count check −/+ buttons** are 64 pt, and each tap speaks the new number.
- **Grown-up gate:** **press-and-hold 🔒 for 2 s** (a ring fills), then **"What is 6 × 4?"** with a number keypad answer (random 3–9 × 3–9). Never use multiple choice. A wrong answer quietly closes the gate.

---

## 7. Progress: Mia vs Dad

**Progress screen (Mia, pictures only)**
1. **Pup's path:** a winding road with 6 stage stops. Pup stands at the current one, and future stops are grey silhouettes with "?".
2. **Paw calendar:** this week's paw row (🐾 / 🐾🐾), plus a month grid with ⭐ week stamps.
3. **Two trophies side by side:** 🏆 Plank `42` (seconds, with a plank Pup icon) and 🏆 Squats `14` (reps, with a squat Pup icon). Tapping one speaks: "Your best plank: 42 seconds!" / "Your most squats: 14!"

**Parent Corner (Dad, numbers)**
- Stats per exercise: PB, current goal, 7-day average, days done this month. Overall: total exercise days, this week (x/7), double days, current and best streak.
- **Charts:** two small bar charts over the last 30 days: plank seconds (with a goal line) and squat reps (with a goal line).
- Settings: child name, pet name, goals (manual override), plank cap, squat cap, **squat tempo (2.0–3.5 s)**, countdown (3/5/10 s), sound on/off, page prize.
- Backup: export/import data (JSON).

---

## 8. Anti-patterns to avoid
- ❌ **"You must do both":** no half-filled paws, no "1 of 2 done" meters, no locked rewards that need both, no repeated nudges. One gentle offer a day, max.
- ❌ **Loot-box feel:** no rarities, no duplicates, no "spin again", no paid or bonus draws.
- ❌ **Extra currencies:** exactly two collectables (stickers, Pup growth). No coins, gems or shops.
- ❌ **Guilt/decay:** Pup never gets sad, hungry or sick; streaks are never visibly lost.
- ❌ **Nagging notifications:** none in v1.
- ❌ **Shame:** no red, no ✗, no "failed".
- ❌ **Pressure to overdo it:** hard caps, max 1 extra try per exercise, no "keep going!" after the goal.
- ❌ **Ads, links out, purchases, sign-ins, data leaving the phone.**
- ❌ **Feels like work:** no forms, typing or menus for her.
- ❌ **Endless variable rewards:** once today's exercises are done, there is nothing more to earn today.

### v1 scope
| **In v1** | **Later idea** |
|---|---|
| Grown-up setup (name, both starting goals, sound test) | Pup fur colour choice |
| Meet Pup + picture naming | Pup wardrobe / accessory picking |
| Home (two exercise buttons, ✅ + 🎁 glow), Plank, **Squats**, Celebrate, Sticker Book, Progress, Parent Corner | New themed books beyond Book 2 |
| Plank: stopwatch + goal ring + audio cues + tap-anywhere stop + 60 s cap | Knee vs full plank / chair vs free squat tracking |
| **Squats: Squat-along at an adjustable tempo, count on "up", tap-anywhere stop, −/+ count check, 20-rep cap** | More exercises (wall sit, jumping jacks, bear crawl) |
| Form tip cards for both exercises | Auto-detecting squats with motion sensors/camera |
| 1 sticker/day (either exercise), pick 1 of 3; 36 + 7 milestone stickers; gold PB frame; Book 2 | Sibling / second profile |
| **Double day:** +5 bonus treats, 🐾🐾 stamp, two-trick scene | Gentle opt-in daily reminder |
| Pup: 6 stages, 6 tricks, exercises alongside her | Recorded Dad voice lines / Dutch language pack |
| Weekly paw row, total-exercise-day milestones, tiered celebrations | Seasonal stickers |
| speechSynthesis lines with `{name}` + tone fallback | Printable certificate at book full |
| Page prize hook, grown-up gate, stats, two 30-day charts, backup | Music track for Squat-along |

---

## 9. Kid playtest script (10–12 minutes)

**Before (2 min, Dad only):** install to the home screen, turn the ring/silent switch on and volume up, and use a fresh install so Mia gets the real first launch. Have a sofa or chair ready to prop the phone for squats.

**During (7 min):** hand her the phone and say only *"This is your new exercise app. Show me!"* **Don't point or explain.** Let her choose which exercise to do first. Note:
| Watch for | Red flag → fix |
|---|---|
| Does she find the basket, then the exercise buttons, without help? | She hesitates > 5 s → pulse/bigger buttons |
| Does the naming work? Does she tap cards to hear them? | She gets stuck → a clearer ✅ |
| **Which exercise does she pick first, and why?** | — (useful to know) |
| Plank: can she get into position during the countdown, and see/hear from the floor? | She's late at "Go" → 10 s countdown; she lifts her head a lot → bigger/louder |
| **Squats: does she copy Pup in time?** | She lags → slower tempo (3.0 s); she rushes ahead or gets bored → 2.0–2.2 s |
| **Squats: does she sit back ("chair") or just bob her knees?** | Bobbing → show the form card again, or suggest a real chair |
| **Squats: can she see Pup where the phone is propped?** | She bends over to look → adjust the prop spot / make Pup bigger |
| **Squats: is the count right?** Count along silently yourself. | Often off by 2+ → Dev: check the rep logic; tone fallback |
| Does stopping work (her tap or yours)? | Accidental stops → false-start handling |
| Her face at the sticker cards and Pup's reactions | Flat → the reveal needs more sparkle/sound |
| **After the first exercise: does she want the other one? Any sign she feels she has to?** | Worry or "I have to…" → soften the 🎁 glow / drop the voice offer |
| Does she ask for "one more"? Does the limit cause tears? | Tears → make the "rest" message warmer |

**After (2 min): 5 questions in kid language**
1. "What was the most fun part?"
2. "Was anything tricky or confusing? Show me."
3. "Was {pup} too fast or too slow when you did squats?" *(tempo check)*
4. "What do you think happens if you do plank or squats again tomorrow?" *(does she understand the book and growth? does she think she needs both?)*
5. "If you could make {pup} do anything new, what would it be?"

**One week later:** is she still asking to exercise, or does Dad remind her? How often does she do both, and does she seem happy or obliged? If she needs reminding, look at the rewards' pacing, not the pressure.
