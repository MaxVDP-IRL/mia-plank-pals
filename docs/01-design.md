# 01 — Visual Design Spec (Plank Pals)

> Owner: Design agent. Read with `00-brief.md` (including "Added: Squats") and `03-kid-experience.md`. Behaviour, rules, copy and thresholds live there; **this doc covers only how things look and move.**
> Screens: **Home**, **Plank**, **Squats**, **Celebrate**, **Sticker Book**, **Progress**, **Parent Corner**, plus the one-time **First launch** (Setup + Meet Pup). The pet is **Pup** (renameable; show `{pup}`).
>
> **Rules for the builder**
> 1. **No image files** except the 3 generated icon PNGs (§9). All art is inline SVG from this doc, or emoji on CSS shapes. Copy the code blocks exactly.
> 2. **Never hardcode the child's name** (the repo is public). Any text with her name uses the stored `{name}`.
> 3. All URLs are **relative** (the site lives at `/mia-plank-pals/`).

---

## 1. Design direction

Plank Pals feels like a sunny picture book. Everything is round and chunky, the base colours are warm cream and honey, and the buttons look like soft toys you can squish. Pup, a golden puppy with floppy ears and one brown eye-patch, is always on screen. Pup is Mia's buddy, not a coach: he wags when idle, does a wobbly plank next to her, leads squats on the beat for her to copy, and jumps for joy when she finishes. Everything a child needs is shown with **pictures, colour, motion and Pup's voice**. Words are extra help for Dad and never required. Nothing is ever red or "wrong": an empty day is just an empty circle, and any attempt earns something.

**Rules of thumb**
- **One obvious big thing per screen.** Home has the two exercise buttons, Plank and Squats each have the whole screen as the stop area, and Celebrate has the cards.
- **Exercise colours never change:** Plank is always **green** and Squats is always **purple**. They share one screen layout.
- Child-facing tap targets are **≥ 64×64 px** with ≥ 16 px between them.
- Emoji are the icon set: 🏠 home, 📖 Sticker Book, 🏆 Progress, 🔒 grown-ups, ❓ form tip, ✅ done/confirm, 🔁 try again, 🎁 optional extra, 🦴 goal. There's no emoji for plank or squat, so those use **Pup in that pose** (inline SVG, §5).
- Light mode only (§2.3).

---

## 2. Design tokens

### 2.1 Font: system only, no Google Font
iOS ships **SF Pro Rounded** as `ui-rounded`. It is round, friendly, costs 0 KB and works offline without any font caching.
```css
font-family: ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", "Nunito", system-ui, -apple-system, "Segoe UI", sans-serif;
```

### 2.2 Ready-to-paste `:root`

```css
:root {
  color-scheme: light;

  /* ---------- Surfaces & text ---------- */
  --bg:            #FFF7EC;  /* warm cream page background */
  --bg-sunny:      #FFF0B3;  /* Celebrate background */
  --surface:       #FFFFFF;
  --surface-2:     #FDEFDC;  /* sunken areas */
  --line:          #EADBC8;
  --ink:           #3B2A20;  /* dark cocoa text */
  --ink-soft:      #7A6353;
  --ink-faint:     #B3A091;
  --night:         #2A211C;  /* Meet-Pup dark stage, big-moment dim */

  /* ---------- Exercise colours ---------- */
  --plank:         #1F9D5B;  /* green, white text 3.5:1 (large text OK) */
  --plank-dark:    #177A46;
  --plank-light:   #D4F5C9;
  --squat:         #8A4FC7;  /* purple, white text 5.2:1 */
  --squat-dark:    #6B3799;
  --squat-light:   #E8D9FF;
  --go:            #1F9D5B;  /* generic "yes / confirm" green (= plank) */
  --go-dark:       #177A46;

  /* ---------- Exercise screen background states (§7.3) ---------- */
  --ex-bg-run:     #DDF2FC;  /* soft blue while exercising */
  --ex-bg-goal:    #D4F5C9;  /* soft green once the goal is reached */
  --ex-bg-record:  #FFE9A8;  /* gold once the personal best is beaten */

  /* ---------- Accents ---------- */
  --sun:           #FFC83D;  /* gold: records, stars, medal */
  --sun-dark:      #E0A200;
  --sky:           #5EC8F2;
  --sky-dark:      #2FA3D1;
  --pink:          #FF9AA2;
  --empty:         #E6DFD6;  /* empty paw circle / locked sticker. NEVER red */
  --empty-line:    #CFC5B8;

  /* ---------- Pup ---------- */
  --pup-fur:       #E8A96B;
  --pup-fur-dark:  #B8733F;
  --pup-spot:      #D08A50;
  --pup-cream:     #FFF3E0;
  --pup-ink:       #3B2A20;
  --pup-cheek:     #FF9AA2;
  --pup-tongue:    #FF7A8A;

  /* ---------- Sticker page backgrounds ---------- */
  --st-garden:  #D4F5C9;
  --st-ocean:   #CDEFFF;
  --st-yummy:   #FFD6DA;
  --st-sky:     #2B3A67;   /* dark navy for the Sky page */
  --st-jungle:  #FFE0C2;
  --st-sparkle: #E8D9FF;

  /* ---------- Typography ---------- */
  --font: ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", "Nunito", system-ui, -apple-system, "Segoe UI", sans-serif;
  --fs-12: 12px;  --fs-14: 14px;  --fs-16: 16px;   /* Parent Corner / Setup only */
  --fs-20: 20px;                                   /* labels under icons */
  --fs-24: 24px;                                   /* chips, speech bubble */
  --fs-32: 32px;                                   /* titles, Pup's name */
  --fs-44: 44px;                                   /* emoji in tiles */
  --fs-64: 64px;                                   /* result on Celebrate */
  --fs-timer: 128px;                               /* Plank seconds (phone ~40 cm from her eyes) */
  --fs-count: 160px;                               /* Squat reps (phone 1–2 m away) */
  --fs-countdown: 200px;
  --fw-regular: 500; --fw-bold: 700; --fw-heavy: 800;
  --lh-body: 1.35;

  /* ---------- Spacing ---------- */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;

  /* ---------- Sizes ---------- */
  --tap-min: 64px;
  --tap-parent: 44px;
  --content-w: 343px;

  /* ---------- Radii ---------- */
  --r-sm: 12px; --r-md: 20px; --r-lg: 28px; --r-xl: 40px; --r-pill: 999px;

  /* ---------- Shadows ---------- */
  --sh-card:    0 2px 0 rgba(59,42,32,.06), 0 6px 16px rgba(59,42,32,.10);
  --sh-float:   0 10px 30px rgba(59,42,32,.18);
  --sh-sticker: 0 2px 0 rgba(59,42,32,.10), 0 6px 12px rgba(59,42,32,.22);
  --sh-plank:   0 8px 0 #177A46, 0 14px 24px rgba(23,122,70,.28);
  --sh-squat:   0 8px 0 #6B3799, 0 14px 24px rgba(107,55,153,.28);
  --sh-go:      0 8px 0 #177A46, 0 14px 24px rgba(23,122,70,.28);

  /* ---------- Motion (§8) ---------- */
  --dur-press: 120ms; --dur-fast: 180ms; --dur-base: 280ms; --dur-slow: 450ms; --dur-hero: 700ms;
  --ease-out:    cubic-bezier(.2, .8, .2, 1);
  --ease-in-out: cubic-bezier(.45, 0, .55, 1);
  --ease-bounce: cubic-bezier(.34, 1.56, .64, 1);
  --beat: 2.5s;   /* squat tempo; JS overwrites from settings (2.0–3.5 s) */

  /* ---------- Safe areas ---------- */
  --safe-top:    env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left:   env(safe-area-inset-left, 0px);
  --safe-right:  env(safe-area-inset-right, 0px);
}
```

### 2.3 Dark mode: **skip it**
A 6-year-old won't use dark mode, and one palette halves the testing. Keep `color-scheme: light`, `<meta name="color-scheme" content="light">`, and an explicit `body` background.

---

## 3. Layout for iPhone 13 mini

**Viewport:** 375 × 812 CSS px. In portrait, `safe-area-inset-top` ≈ 50 px and `safe-area-inset-bottom` = 34 px, so design to a **343 × ~728 px** content box (16 px gutters). Bigger phones centre the content at a max width of 480 px.

### 3.1 `<head>` tags
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#FFF7EC">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Plank Pals">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
```
Use `status-bar-style: default` (dark clock on a light bar). The `black-translucent` style gives a white clock over cream, which is unreadable.

### 3.2 Base CSS and screen shell
```css
*, *::before, *::after { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body {
  background: var(--bg); color: var(--ink);
  font-family: var(--font); font-weight: var(--fw-regular); line-height: var(--lh-body);
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;
  overscroll-behavior: none; touch-action: manipulation;
}
input, textarea { -webkit-user-select: text; user-select: text; font-size: 16px; } /* ≥16px or iOS zooms */

.screen {
  position: fixed; inset: 0;
  display: flex; flex-direction: column; align-items: center;
  padding: calc(var(--safe-top) + var(--sp-2)) calc(var(--safe-right) + var(--sp-4))
           calc(var(--safe-bottom) + var(--sp-4)) calc(var(--safe-left) + var(--sp-4));
  overflow: hidden;
  transition: background-color var(--dur-slow) var(--ease-out);
}
.screen[hidden] { display: none; }
.screen > * { width: 100%; max-width: 480px; }
.screen--scroll { overflow-y: auto; -webkit-overflow-scrolling: touch; }
.topbar { display: flex; align-items: center; justify-content: space-between; height: 64px; flex: none; }
.spacer { flex: 1 1 auto; }
.tnum { font-variant-numeric: tabular-nums; }
```

### 3.3 Buttons ("squishy toy" 3D)
```css
.btn {
  appearance: none; border: 0; margin: 0; font: inherit; font-weight: var(--fw-heavy); color: #fff;
  display: flex; align-items: center; justify-content: center; gap: var(--sp-3);
  min-width: var(--tap-min); min-height: var(--tap-min); border-radius: var(--r-lg); cursor: pointer;
  transition: transform var(--dur-press) var(--ease-out), box-shadow var(--dur-press) var(--ease-out);
}
.btn:active { transform: translateY(6px); }

/* Home exercise buttons (§4.2) */
.btn-ex { flex: 1; height: 200px; flex-direction: column; gap: 4px; position: relative;
          font-size: var(--fs-24); border-radius: var(--r-xl); }
.btn-ex--plank { background: var(--plank); box-shadow: var(--sh-plank); }
.btn-ex--squat { background: var(--squat); box-shadow: var(--sh-squat); }
.btn-ex--plank:active { box-shadow: 0 2px 0 var(--plank-dark); }
.btn-ex--squat:active { box-shadow: 0 2px 0 var(--squat-dark); }
.btn-ex .ex-pic { width: 139px; height: 112px; border-radius: var(--r-lg);
                  background: rgba(255,255,255,.22); display: grid; place-items: center; }
.btn-ex .ex-goal { font-size: var(--fs-20); font-weight: var(--fw-bold); opacity: .95; }

/* Big confirm (✅ / 🏠 on Celebrate / count check) */
.btn-big { width: 100%; height: 112px; background: var(--go); box-shadow: var(--sh-go);
           font-size: 56px; border-radius: var(--r-xl); }
.btn-big:active { box-shadow: 0 2px 0 var(--go-dark); }
.btn-big--soft { background: var(--surface); color: var(--ink); box-shadow: 0 8px 0 var(--line), var(--sh-card); }
.btn-big--soft:active { box-shadow: 0 2px 0 var(--line); }

/* White tiles (Sticker Book / Progress on Home) */
.btn-tile { flex: 1; height: 88px; background: var(--surface); color: var(--ink);
            box-shadow: 0 6px 0 var(--line), var(--sh-card); flex-direction: column; gap: 0;
            font-size: var(--fs-20); font-weight: var(--fw-bold); }
.btn-tile .emoji { font-size: 40px; line-height: 1; }

/* Round 64px icon buttons: 🏠 ❓ ◀ ▶ − + */
.btn-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--surface); color: var(--ink);
            box-shadow: 0 4px 0 var(--line), var(--sh-card); font-size: 34px; }
.btn-icon--xl { width: 96px; height: 96px; font-size: 56px; }
.btn-icon[disabled] { opacity: .35; }

/* Grown-up lock: small and quiet, NOT a child target */
.btn-lock { width: 44px; height: 44px; min-width: 44px; min-height: 44px; border-radius: 50%;
            background: transparent; font-size: 22px; opacity: .4; box-shadow: none; }

/* Parent Corner / Setup buttons */
.btn-parent { min-height: 48px; padding: 0 var(--sp-5); border-radius: var(--r-sm);
              background: var(--ink); color: #fff; font-size: var(--fs-16); font-weight: var(--fw-bold); }
.btn-parent--ghost { background: var(--surface); color: var(--ink); box-shadow: inset 0 0 0 2px var(--line); }

/* "Main button pulses gently after 5 s of no taps" (kid doc §6): add .invite via JS */
.invite { animation: invite 2.4s var(--ease-in-out) infinite; }
@keyframes invite { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
@keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.15); } 100% { transform: scale(1); } }
```

### 3.4 Tap-target sizes
| Element | Size |
|---|---|
| Home Plank / Squats buttons | 163 × 200 each, 17 px gap |
| Plank & Squats stop area | whole screen below the top bar (≈ 343 × 650) |
| Celebrate face-down cards | 104 × 150 each |
| ✅ / 🏠 big buttons | 343 × 112 (or 163 × 112 in pairs) |
| Count check − / + | 96 × 96 |
| Early-stop 🔁 / ✅ | 163 × 163 |
| Home tiles 📖 / 🏆 | 163 × 88 |
| 🏠 ❓ ◀ ▶ | 64 × 64 |
| Sticker (book) | 132 × 132 |
| Name cards (Meet Pup) | 163 × 132 |
| 🔒 lock | 44 × 44 (intentionally small) |
| Parent Corner rows | ≥ 48 tall |

### 3.5 Speech bubble (every spoken line is also shown as text)
```html
<div class="bubble" role="status"></div>   <!-- JS sets textContent = fill("Hi {name}! Plank or squats?", vars); never hardcode a name -->
```
```css
.bubble { position: absolute; left: 50%; bottom: calc(100% - 8px); translate: -50% 0;
  max-width: 300px; width: max-content; padding: 10px 18px; border-radius: 24px;
  background: #fff; box-shadow: var(--sh-float); color: var(--ink);
  font-size: var(--fs-24); font-weight: var(--fw-bold); line-height: 1.2; text-align: center;
  animation: bubble-in var(--dur-slow) var(--ease-bounce) both; z-index: 5; }
.bubble::after { content: ""; position: absolute; left: 50%; bottom: -8px; width: 18px; height: 18px;
  background: #fff; transform: translateX(-50%) rotate(45deg); border-radius: 3px; }
.bubble.is-leaving { animation: bubble-out 200ms var(--ease-out) both; }
@keyframes bubble-in  { from { transform: scale(.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes bubble-out { to { transform: scale(.8); opacity: 0; } }
```
The bubble lives inside `.pup-wrap` (which is `position: relative`) and stays up while the line is spoken, plus 800 ms. On Squats the bubble is hidden **during reps** so it doesn't cover Pup; there the count is spoken only.

---

## 4. Per-screen wireframes

Coordinates are CSS px inside the safe area (x 0–343, y 0 just below the notch). Everything sits in vertical flex columns, and `.spacer` elements take up the leftover height.

### 4.1 First launch (once)

**A. Grown-up setup (Dad).** Calm Parent Corner styling (§4.8).
```
┌───────────────────────────────────────────┐
│  🐾 Plank Pals: grown-up setup            │  fs 24 bold
│  Child's name                             │  fs 14 --ink-soft
│ ┌───────────────────────────────────────┐ │
│ │ Name                                  │ │  input 56 tall, fs 20, radius 12, 2px --line
│ └───────────────────────────────────────┘ │
│  Starting goals                           │
│ ┌───────────────────────────────────────┐ │
│ │ [plank pup] Plank     [−] 10 s [+]     │ │  rows 64 tall, steppers 48×48
│ │ [squat pup] Squats    [−]  5   [+]     │ │  mini pose SVGs 48px wide
│ └───────────────────────────────────────┘ │
│ [ 🔊 Test sound ]  Check the ring/silent switch   (fs 14)
│                 (spacer)                  │
│ ┌───────────────────────────────────────┐ │
│ │     Hand the phone to {name}  →       │ │  .btn-big, fs 24 text; disabled (opacity .4) until a name is typed
│ └───────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```

**B. Meet Pup (Mia).** The background is `--night` with a spotlight: `background: radial-gradient(circle at 50% 55%, #5A4638 0%, var(--night) 60%)`. The bubble text is white-on-white as usual (the bubble has its own white fill).
```
┌───────────────────────────────────────────┐
│                                           │
│        ( bubble: "{name}! Something is    │
│          in the basket! Tap it!" )        │
│                 ╭─────╮                   │  basket 240×260 stage, centred at y≈300;
│              ═══╡ ~~~ ╞═══  (wiggling)    │  the whole stage is the tap target
│               \_________/                 │
└───────────────────────────────────────────┘
```
Sequence: the basket wiggles in 3 bursts, pauses 1 s, and repeats. On tap it gets `.is-open`: the blanket flies off (600 ms), and Pup (stage 1) pops up from behind the basket front (700 ms bounce). He then plays `trick-sneeze` followed by idle, and the background eases to `--bg` over 1.2 s.

Basket SVG. Pup sits in a layer **between** `.basket-back` and `.basket-front`:
```html
<div class="basket-stage is-wiggling">
  <svg class="basket basket-back" viewBox="0 0 200 160" overflow="visible">
    <path d="M50 66 Q100 -12 150 66" fill="none" stroke="#8A5A2B" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="100" cy="70" rx="76" ry="12" fill="#6E4623"/>
  </svg>
  <div class="basket-pup pup-wrap" style="--pup-size:180px"><!-- Pup svg (stage 1) --></div>
  <svg class="basket basket-front" viewBox="0 0 200 160" overflow="visible">
    <path d="M28 72 L172 72 L154 150 Q100 160 46 150 Z" fill="#C98B4E" stroke="#8A5A2B" stroke-width="4" stroke-linejoin="round"/>
    <path d="M36 96 H164 M42 120 H158" stroke="#A86F38" stroke-width="5" stroke-linecap="round"/>
    <path d="M60 76 V148 M85 76 V152 M115 76 V152 M140 76 V148" stroke="#A86F38" stroke-width="3" opacity=".6"/>
    <rect x="20" y="62" width="160" height="16" rx="8" fill="#B8733F"/>
    <g class="basket-blanket">
      <path d="M30 66 Q58 30 100 46 Q142 28 170 66 Z" fill="#FF9AA2"/>
      <circle cx="70" cy="52" r="4" fill="#fff"/><circle cx="100" cy="44" r="4" fill="#fff"/>
      <circle cx="132" cy="50" r="4" fill="#fff"/><circle cx="116" cy="60" r="4" fill="#fff"/>
      <circle cx="84" cy="61" r="4" fill="#fff"/>
    </g>
  </svg>
</div>
```
```css
.basket-stage { position: relative; width: 240px; height: 260px; margin: 0 auto; }
.basket { position: absolute; left: 0; bottom: 0; width: 240px; height: 192px; overflow: visible; }
.basket-pup { position: absolute; left: 30px; bottom: 60px; opacity: 0; }
.basket-stage.is-wiggling .basket { animation: basket-wiggle 2.2s var(--ease-in-out) infinite; transform-origin: 50% 100%; }
@keyframes basket-wiggle { 0%,40%,100% { transform: rotate(0); } 5%,15%,25% { transform: rotate(-6deg); }
                           10%,20%,30% { transform: rotate(6deg); } }
.basket-blanket { transform-box: view-box; transform-origin: 100px 60px; }
.basket-stage.is-open .basket-blanket { animation: blanket-off 600ms var(--ease-out) forwards; }
@keyframes blanket-off { to { transform: translate(130px, -170px) rotate(50deg); opacity: 0; } }
.basket-stage.is-open .basket-pup { animation: pup-pop 700ms var(--ease-bounce) 250ms forwards; }
@keyframes pup-pop { from { opacity: 1; transform: translateY(70px) scale(.4); } to { opacity: 1; transform: none; } }
```
(Remove `.is-wiggling` when adding `.is-open`.)

**C. Naming (6 picture cards).**
```
┌───────────────────────────────────────────┐
│               [ Pup 140 ]  (tilts head)   │  y 0–170: Pup + bubble
│ ┌──────────────┐ ┌──────────────┐         │  2×3 grid of cards 163×132, gap 17 / 14
│ │     🐾       │ │     🍪       │         │  emoji 56px, name fs 24 bold (for Dad)
│ │     Pup      │ │   Biscuit    │         │  selected: 5px --sun ring + glow
│ ├──────────────┤ ├──────────────┤         │
│ │  ☀️ Sunny     │ │  🫧 Bubbles  │         │
│ ├──────────────┤ ├──────────────┤         │
│ │  ⭐ Star      │ │  🍜 Noodle   │         │
│ └──────────────┘ └──────────────┘         │
│ ┌───────────────────────────────────────┐ │
│ │                 ✅                    │ │  .btn-big 343×112
│ └───────────────────────────────────────┘ │
│        ✏️ Grown-up: type a name           │  fs 14 --ink-soft, 44 px tall text button
└───────────────────────────────────────────┘
```
```css
.name-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 17px; }
.name-card { height: 132px; border: 0; border-radius: var(--r-lg); background: var(--surface); box-shadow: var(--sh-card);
  display: grid; place-content: center; justify-items: center; gap: 2px; font: inherit;
  font-size: var(--fs-24); font-weight: var(--fw-bold); color: var(--ink); }
.name-card .emoji { font-size: 56px; line-height: 1; }
.name-card[aria-pressed="true"] { box-shadow: 0 0 0 5px var(--sun), 0 0 24px rgba(255,200,61,.7);
  animation: pop 450ms var(--ease-bounce); }
```

### 4.2 Home

```
┌───────────────────────────────────────────┐  ← safe-area top
│ (M)(T)(W)(T)(F)(S)(S)                 🔒  │  y 0–48: 7 paw circles 34px gap 6; 🔒 44px at 40% opacity
│                                           │
│         ( bubble: "Hi {name}! Plank or    │
│                    squats?" )             │
│               [  PUP 200  ]    [bowl]🦴   │  y 56–276: .pup-wrap --pup-size 200, centred;
│                                           │  treat bowl 72×40 at the right edge, bottom-aligned
│                   Pup                     │  y 280–316: {pup} name fs 32 heavy
│                 (spacer)                  │
│ ┌──────────────────┐ ┌──────────────────┐ │
│ │✅                │ │🎁                │ │  two .btn-ex 163×200; badge at the top-left corner
│ │ [plank-pup pic]  │ │ [squat-pup pic]  │ │  .ex-pic 139×112 with a pose SVG (§5.5, §5.6)
│ │     Plank        │ │     Squats       │ │  label fs 24 heavy white
│ │     🦴 10s       │ │     🦴 5         │ │  goal fs 20
│ └──────────────────┘ └──────────────────┘ │  Plank ALWAYS left, Squats ALWAYS right
│ ┌──────────────────┐ ┌──────────────────┐ │
│ │   📖  Stickers   │ │   🏆  Progress   │ │  two .btn-tile 163×88, gap 17
│ └──────────────────┘ └──────────────────┘ │  bottom = safe-area bottom − 16
└───────────────────────────────────────────┘
```
Vertical budget: 48 + 8 + 220 + 36 + spacer + 200 + 16 + 88 ≈ 616 of 728 px.

**Per-exercise "done today" check and 🎁 badge**
```html
<div class="ex-row">   <!-- display:flex; gap:17px -->
  <button class="btn btn-ex btn-ex--plank is-done">
    <span class="ex-badge">✅</span>
    <span class="ex-pic"><!-- #pup-plank-tpl, data-mood="still", .pup-wrap.fixed-size --pup-size:130px --></span>
    Plank <span class="ex-goal">🦴 10s</span>
  </button>
  <button class="btn btn-ex btn-ex--squat is-offer">
    <span class="ex-badge">🎁</span>
    <span class="ex-pic"><!-- #pup-tpl, data-mood="pose-squat", .pup-wrap.fixed-size --pup-size:104px --></span>
    Squats <span class="ex-goal">🦴 5</span>
  </button>
</div>
```
```css
.ex-row { display: flex; gap: 17px; }
.ex-badge { position: absolute; top: -10px; left: -8px; width: 52px; height: 52px; border-radius: 50%;
  background: #fff; box-shadow: var(--sh-card); display: none; place-items: center; font-size: 30px; }
.btn-ex.is-done  .ex-badge,
.btn-ex.is-offer .ex-badge { display: grid; animation: pop var(--dur-slow) var(--ease-bounce); }
/* soft, slow glow on the optional other exercise: no bounce, no sound loop */
.btn-ex.is-offer { animation: offer-glow 3.2s var(--ease-in-out) infinite; }
@keyframes offer-glow {
  0%,100% { filter: drop-shadow(0 0 0 rgba(255,200,61,0)); }
  50%     { filter: drop-shadow(0 0 14px rgba(255,200,61,.95)); }
}
```
- **Nothing done today:** no badges. After 5 s idle, both buttons get `.invite`.
- **One done:** that button gets `.is-done` (✅) and the other gets `.is-offer` (🎁 plus the glow). Pup plays `trick-jump` once, then idles.
- **Both done:** both get `.is-done`, and Pup uses `data-mood="sleepy"` with a 💤 bubble. The buttons still work (for the one more try), but nothing glows or pulses.

**Weekly paw row** (7 circles, resets Monday)
```css
.paws { display: flex; gap: 6px; }
.paw { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
  background: var(--surface); box-shadow: inset 0 0 0 2px var(--empty-line);
  font-size: 12px; font-weight: var(--fw-bold); color: var(--ink-faint); line-height: 1; }
.paw.is-today  { box-shadow: inset 0 0 0 3px var(--ink); }
.paw.is-done   { background: var(--sun); box-shadow: none; font-size: 18px; }                /* content: 🐾 */
.paw.is-double { background: var(--sun); box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--sun);
                 font-size: 12px; letter-spacing: -2px; }                                      /* content: 🐾🐾 */
.paw.stamp { animation: stamp 500ms var(--ease-bounce); }
@keyframes stamp { 0% { transform: scale(2.4); opacity: 0; } 60% { transform: scale(.9); opacity: 1; } 100% { transform: scale(1); } }
```
An empty circle shows its single-letter weekday (M T W T F S S) for Dad, and a done day swaps the letter for `🐾` or `🐾🐾`. A missed day stays plain. Never red, never ✗.

**Treat bowl** (Pup's growth meter; it never shows a number)
```html
<div class="bowl-wrap"><div class="bowl" style="--fill:.4"><div class="bowl-fill"></div></div><span class="bowl-bone">🦴</span></div>
```
```css
.bowl-wrap { display: flex; align-items: flex-end; gap: 2px; }
.bowl { position: relative; width: 72px; height: 40px; overflow: hidden;
  border: 4px solid var(--pup-fur-dark); border-top-width: 6px;
  border-radius: 6px 6px 40px 40px / 6px 6px 34px 34px; background: var(--surface-2); }
.bowl--big { width: 120px; height: 60px; }
.bowl-fill { position: absolute; left: 0; right: 0; bottom: 0; height: calc(var(--fill, 0) * 100%);
  background: radial-gradient(circle at 30% 40%, #C9824A 0 3px, transparent 3.5px) 0 0 / 10px 8px, var(--pup-fur);
  transition: height 1.2s var(--ease-out); }
.bowl-bone { font-size: 22px; }
```
`--fill` is the fraction of the way to the next stage (0–1). On Celebrate, set the new `--fill` 300 ms after the bowl appears so Mia sees it rise. If the bowl passes 1, fill it to 1, then trigger the stage-up big moment.

### 4.3 Plank (phone lies flat between her hands)

States: **countdown → running → goal → record → finished** (the rules are in the kid doc). The screen background shows the state (§7.3).

```
┌───────────────────────────────────────────┐
│ (🏠)                                (❓)   │  y 0–64 (❓ only during the countdown)
│                    🦴                     │  bone marker sits ON the ring at 12 o'clock
│            ╭───────────────╮              │
│          ╭─    ring 300     ─╮            │  y 72–372: ring 300×300, stroke 22 (§7.2)
│         │        23           │           │  seconds only, 128px heavy, tabular
│          ╰─                 ─╯            │
│            ╰───────────────╯              │
│      [ plank Pup, ~200×125, wobbling ]    │  y 392–520: side-view Pup (§5.6)
│                 (spacer)                  │
│                  ✋                       │  y ≈ 560–650: 96px ✋ hint, 50% opacity, pulsing
└───────────────────────────────────────────┘
  While running, the WHOLE screen below the top bar is one <button class="stop-area">.
```
```css
.stop-area { position: absolute; inset: calc(var(--safe-top) + 72px) 0 0 0; background: transparent; border: 0; z-index: 3; }
.stop-hint { font-size: 96px; line-height: 1; opacity: .5; animation: invite 2.4s var(--ease-in-out) infinite; pointer-events: none; }
```

**Countdown + form tip** (shared by Plank and Squats). The default is **5 s** (Dad can pick 3/5/10 s). Per PLAN §4.10 the tip card plays **before** the countdown (its tips, ~1.5 s each, each spoken; a tap skips), then stays visible but silent during the countdown. The **big digits appear only for the last 3 s** (3, 2, 1), in step with the dev doc's tick tones. A full-screen overlay sits over the running layout, with its background at `--bg`:
```
┌───────────────────────────────────────────┐
│ (🏠)                                (❓)   │
│ ┌───────────────────────────────────────┐ │
│ │               🪵  (96px)               │ │  tip card 343×210, --surface, radius 28
│ │      Straight like a board! (fs 28)    │ │  one tip at a time, dots ● ○ ○ ○ ○
│ │               ● ○ ○ ○ ○                │ │
│ └───────────────────────────────────────┘ │
│                     3                     │  countdown 200px heavy in --ex-color (last 3 s only)
│             [ Pup in pose 160 ]           │  pops 0.4 → 1.1 → 1 each second
└───────────────────────────────────────────┘
```
```css
.tip-card { background: var(--surface); border-radius: var(--r-lg); box-shadow: var(--sh-card); padding: 20px;
  display: grid; justify-items: center; gap: 8px; text-align: center; }
.tip-card .emoji { font-size: 96px; line-height: 1; }
.tip-card .text  { font-size: 28px; font-weight: var(--fw-bold); line-height: 1.15; }
.tip-dots { display: flex; gap: 8px; } .tip-dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--line); }
.tip-dots i.on { background: var(--ex-color); }
.tip-card.swap { animation: tip-swap 350ms var(--ease-out); }
@keyframes tip-swap { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
.countdown { font-size: var(--fs-countdown); font-weight: var(--fw-heavy); line-height: 1; color: var(--ex-color); }
.countdown.tick { animation: count-pop 450ms var(--ease-bounce); }
@keyframes count-pop { 0% { transform: scale(.4); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
```
When there's no tip (after the first 5 times), hide the card and move the countdown up to the centre.

**Early stop** (Plank < 3 s only; ✅ appears only at 2–3 s, PLAN §4.6. Squats always go to the count check below, where ✅ is disabled at 0 and 🔁 redoes). The exercise screen swaps its content for:
```
│             [ Pup, head tilted ]          │  Pup data-mood="idle", .pup-head rotate(-10deg)
│ ┌──────────────────┐ ┌──────────────────┐ │
│ │       🔁         │ │       ✅         │ │  163×163 each: 🔁 = .btn-big--soft, ✅ = .btn-big
│ └──────────────────┘ └──────────────────┘ │  emoji 72px
```

### 4.4 Squats (phone propped upright 1–2 m away)

Everything must be **readable from 2 m**: the count is 160 px (about 27 mm tall on a 13 mini), and Pup takes about 55% of the height.
```
┌───────────────────────────────────────────┐
│ (🏠)                                (❓)   │  y 0–64
│                    🦴                     │
│              ╭───────────╮                │  y 70–290: rep ring 220×220, stroke 20, --squat fill
│             │     7       │               │  count 160px heavy, tabular (fits "20")
│              ╰───────────╯                │
│         ┌─────────────────────┐           │
│         │                     │           │  y 300–680: Pup .pup-wrap --pup-size 340 (Pup ≈ 200–340 px
│         │   PUP doing squats  │           │  wide by stage), data-mood="squat", tempo = --beat
│         │   (biggest thing)   │           │
│         └─────────────────────┘           │
│      ~~~~ floor shadow ~~~~               │  .floor-shadow under his feet
└───────────────────────────────────────────┘
  The whole screen below the top bar = one .stop-area (tap anywhere to finish). There is no ✋ hint,
  because it would take space from Pup. The kid doc's spoken cue covers "tap when you're tired".
```
- **Why a ring and not a row of dots:** at 20 reps, a row of dots would be ~14 px each and unreadable from 2 m. The ring is one big colour shape that fills visibly, with 🦴 at 12 o'clock like Plank, and it reuses the same component (§7.2). *Note for the lead: the kid doc mentions "a row of dots"; this ring replaces it for distance legibility.*
- **Each rep (the "up" beat):** the count ticks (`.tick`, §7.4), and Pup's tail does a quick wag, which is built into the squat animation.
- **Every 5th rep:** the count gets `.sparkle` (§7.4).
- **Floor shadow:** `<div class="floor-shadow is-squatting">`, 60% of Pup's width, 18 px tall, `background: radial-gradient(ellipse, rgba(59,42,32,.18), transparent 70%)`. It widens at the bottom of each squat (§5.5).

**Count check** (after she taps to finish; no timeout):
```
┌───────────────────────────────────────────┐
│ (🏠)                                      │
│           ( bubble: "7 squats!            │
│             Is that right?" )             │
│         [ Pup 180, data-mood=idle ]       │  y 64–300
│                                           │
│   ( − )          7           ( + )        │  y 320–480: − and + are .btn-icon--xl 96×96
│  96×96      160px heavy      96×96        │  number in --squat; + disabled at counted+5, − at 0
│                 (spacer)                  │
│ ┌───────────────────────────────────────┐ │
│ │                 ✅                    │ │  .btn-big 343×112 → Celebrate
│ └───────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```
The screen background returns to `--bg` here. Each −/+ tap adds `.tick` to the number. The top bar also has a 🔁 `.btn-icon` (64 px) at top-right: redo without saving (02 §5.4).

### 4.5 Celebrate (same for both exercises)

The background is `--bg-sunny`, or `--ex-bg-record` for tier 2. Sections appear **in sequence**, never all at once (§8, rule 3).
```
┌───────────────────────────────────────────┐
│ ┌──────┐                                  │
│ │[pose]│    23s     ⭐/🦴/🏆               │  y 0–88: 72×72 rounded chip in the exercise colour with
│ └──────┘                                  │  the pose picture; result 64px heavy ("23s" or "7");
│                                           │  tier badge 56px circle (table below)
│         ( bubble: "You did it!" )         │
│              [ PUP 180, trick ]           │  y 100–290: Pup plays the tier's trick
│           [ big bowl ▓▓▓░░ ] 🦴           │  y 296–356: .bowl.bowl--big, fills
│                                           │
│   ┌──────┐   ┌──────┐   ┌──────┐          │  y 370–520: STICKER PICK: 3 face-down cards
│   │  🐾  │   │  🐾  │   │  🐾  │          │  104×150 each, gap 15, gentle staggered wobble
│   └──────┘   └──────┘   └──────┘          │  (or the DOUBLE DAY stamp card, below)
│                 (spacer)                  │
│ ┌──────────────────┐ ┌──────────────────┐ │  appears only after the reward is done:
│ │       🔁         │ │       🏠         │ │  🔁 one more try (if allowed) + 🏠, 163×112 each;
│ └──────────────────┘ └──────────────────┘ │  with no try left: 🏠 alone at 343×112
└───────────────────────────────────────────┘
```

**Tier visuals** (show the highest of 0–2, then at most one tier 3):
| Tier | Badge next to the result | Pup | Effects |
|---|---|---|---|
| 0 **Did it!** | ❤️ on a pink circle | `trick-wag` | `emojiFloat('❤️', 10)` |
| 1 **Goal!** | 🦴 on a green circle | newest learned trick | `confettiBurst(60)` |
| 2 **New record!** | 🏆 on a gold circle; screen bg `--ex-bg-record` | `trick-jump` (2 hops) | `confettiBurst(120, GOLD)`, 🏆 wiggles, and the picked sticker gets `.is-gold` (§6.3) |
| + **Double day** | (same as its tier) | two tricks back to back | 🐾🐾 stamp card replaces the cards |

```css
.tier-badge { width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; font-size: 32px;
  animation: pop var(--dur-slow) var(--ease-bounce) 300ms both; }
.tier-0 { background: #FFD6DA; } .tier-1 { background: var(--plank-light); } .tier-2 { background: var(--sun); }
```

**Sticker pick: 3 face-down cards** (first exercise of the day; the logic is in the kid doc)
```html
<div class="cards">
  <button class="card"><div class="card-inner">
    <div class="card-face card-back">🐾</div>
    <div class="card-face card-front"><div class="sticker" style="--c:var(--st-garden);--r:-4deg"><span>🦋</span></div></div>
  </div></button>
  <!-- ×3; render only the chosen card's front content after the pick if you want zero leakage -->
</div>
```
```css
.cards { display: flex; justify-content: center; gap: 15px; perspective: 900px; }
.card { width: 104px; height: 150px; padding: 0; border: 0; background: none; position: relative;
  animation: deal 450ms var(--ease-bounce) both; }
.card:nth-child(2) { animation-delay: 120ms; } .card:nth-child(3) { animation-delay: 240ms; }
.card-inner { position: absolute; inset: 0; transform-style: preserve-3d; -webkit-transform-style: preserve-3d;
  transition: transform var(--dur-hero) var(--ease-bounce); animation: card-wobble 2.6s var(--ease-in-out) infinite; }
.card:nth-child(2) .card-inner { animation-delay: -.8s; } .card:nth-child(3) .card-inner { animation-delay: -1.6s; }
.card-face { position: absolute; inset: 0; border-radius: 18px; display: grid; place-items: center;
  -webkit-backface-visibility: hidden; backface-visibility: hidden; }
.card-back { border: 5px solid #fff; box-shadow: var(--sh-float); font-size: 48px;
  background: repeating-linear-gradient(45deg, var(--sun) 0 12px, #FFD66B 12px 24px); }
.card-front { transform: rotateY(180deg); background: #fff; box-shadow: var(--sh-float); }
.card-front .sticker { --size: 88px; }

/* After a pick: the chosen card moves to the centre, grows and flips. The others drop away UNREVEALED. */
.cards.is-picked .card:not(.is-chosen) { animation: card-away 400ms var(--ease-out) forwards; }
.card.is-chosen { z-index: 2; transition: transform var(--dur-slow) var(--ease-out);
  transform: translateX(var(--to-center, 0px)) scale(1.5); }
.card.is-chosen .card-inner { animation: none; transform: rotateY(180deg); transition-delay: 250ms; }
.card.is-flying { transition: transform 700ms cubic-bezier(.5,-0.3,.7,1), opacity 700ms;
  transform: translate(var(--fly-x), var(--fly-y)) scale(.3) rotate(20deg); opacity: 0; }

@keyframes deal        { from { transform: translateY(80px) scale(.6); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes card-wobble { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes card-away   { to { transform: translateY(120px) scale(.7); opacity: 0; } }
```
```js
function pickCard(cardEl) {
  const cards = cardEl.parentElement;
  if (cards.classList.contains('is-picked')) return;
  cards.classList.add('is-picked');
  const cr = cards.getBoundingClientRect(), r = cardEl.getBoundingClientRect();
  cardEl.style.setProperty('--to-center', (cr.left + cr.width / 2) - (r.left + r.width / 2) + 'px');
  cardEl.classList.add('is-chosen');
  setTimeout(() => confettiBurst(60), 650);                  // as the front appears
  setTimeout(() => {                                          // after Pup names it (~2 s): fly to the top-right
    const r2 = cardEl.getBoundingClientRect();
    cardEl.style.setProperty('--fly-x', (window.innerWidth - 40 - r2.right) + 'px');
    cardEl.style.setProperty('--fly-y', (-r2.top) + 'px');
    cardEl.classList.add('is-flying');
  }, 2600);
}
```
If only 2 or 1 cards are left on a page, render 2 or 1; flex keeps them centred. As the card flies, a 📖 (48 px, white circle, `--sh-card`) pops in at the top-right to "catch" it, bounces once, and disappears. For zero leakage of the unpicked cards, fill in the front `<span>` of a card **only when it is picked**.

**Double day** (second exercise of the day; there are no cards):
```
│   ┌───────────────────────────────┐       │  card 343×150, --surface, radius 28
│   │  (M)(T)(W)(🐾🐾)(F)(S)(S)       │       │  the paw row at 40px circles
│   │        Double day!  fs 32     │       │  today's circle gets .is-double + .stamp
│   └───────────────────────────────┘       │
```
Pup plays two tricks back to back, and then `emojiFloat('🐾', 12)` runs.

**Big moment (tier 3, max 1 per session).** This is a full-screen overlay after the reward:
- Dim to `rgba(42,33,28,.82)` over 400 ms. Fade in a spotlight (`radial-gradient(circle at 50% 45%, rgba(255,230,160,.35), transparent 55%)`) with the `.sunburst` (§6.4) spinning behind the subject.
- **Stage-up:** Pup is centred at `--pup-size: 280px`. The drumroll is a shake (`translateX ±3px` in 60 ms steps for 1.2 s), then a glow (`filter: drop-shadow(0 0 24px #FFE08A)`). Then `data-stage` goes up by 1: his width animates to the new size (700 ms bounce, built into `.pup`), the new accessory drops in (`.acc-drop`, below), and the new trick plays.
- **Page full:** a 2×3 mini page (six 64 px stickers) scales in and shakes, and a ✅ (120 px) stamps on it (`stamp`). If a page prize is set, its emoji then appears in a gift outline (§4.6).
- **Milestone:** a rosette (§6.3) drops in from the top with a bounce and spins once (`rotate 360deg`, 700 ms).
- **Book full:** the Book 2 cover opens with a flip. It is a 200×260 rounded rectangle in `--st-sparkle` with a 6 px gold border, 📖 at 96 px, and "2" at 64 px heavy.
- It ends with a 🏠 `.btn-big` (or tap anywhere after 3 s).
```css
.acc-drop { animation: acc-drop var(--dur-slow) var(--ease-bounce) both; }
@keyframes acc-drop { from { transform: translateY(-40px); opacity: 0; } to { transform: none; opacity: 1; } }
.shake { animation: shake 1.2s steps(20) both; }
@keyframes shake { 0%,100% { translate: 0; } 25%,75% { translate: -3px 0; } 50% { translate: 3px 0; } }
```
(For `.acc-drop` on an SVG `<g>`, also set `transform-box: fill-box`.)

### 4.6 Sticker Book (6 pages × 6 + Pup page)

```
┌───────────────────────────────────────────┐
│ (🏠)        [ 🌻  ● ○ ○ ○ ○ ○ ○ ]          │  y 0–64: page chip: theme emoji 32 + 7 page dots 10px
│                                           │
│     ( 🌻 )              ( 🦋 )            │  grid 2 cols × 3 rows, stickers 132×132
│                                           │  column gap 48, row gap 24, centred
│     ( 🐞 )              (  ?  )           │  y 80–524
│                                           │
│     (  ?  )             ( 🍄 )            │
│                                           │
│  (◀)            3 / 6               (▶)   │  y 540–604: ◀ ▶ 64×64; count fs 24 bold
│ ┌───────────────────────────────────────┐ │
│ │  🎁  Fill this page → 🍦               │ │  y 620–692: page prize strip (only if set)
│ └───────────────────────────────────────┘ │  3px dashed --sun border, radius 20, fs 24
└───────────────────────────────────────────┘
```
```css
.book-grid { display: grid; grid-template-columns: repeat(2, 132px); justify-content: center; gap: 24px 48px; }
.book-grid.turn-next { animation: turn-next var(--dur-base) var(--ease-out); }
.book-grid.turn-prev { animation: turn-prev var(--dur-base) var(--ease-out); }
@keyframes turn-next { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: none; } }
@keyframes turn-prev { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: none; } }
.prize-strip { height: 72px; border: 3px dashed var(--sun); border-radius: var(--r-md); background: #FFFBEF;
  display: flex; align-items: center; justify-content: center; gap: 10px; font-size: var(--fs-24); font-weight: var(--fw-bold); }
```
- Pages 1–6 are the themes. Page 7 is the **Pup page**, with 7 milestone rosettes (96 px) laid out 3 + 3 + 1. On the Sky page (navy stickers), the page itself stays cream.
- Only ◀ ▶ change pages; there are no swipes. ◀ is hidden on page 1 and ▶ on page 7 (use `visibility: hidden` to keep the layout).
- Page background: `--bg` with a dotted paper texture: `background-image: radial-gradient(var(--line) 1.5px, transparent 1.5px); background-size: 22px 22px;`.
- **Tapping an owned sticker** opens a 220 px zoom (backdrop `rgba(59,42,32,.45)`, `pop`), and Pup says its name; tap anywhere to close. **Tapping a locked one** gives a `.wiggle`, and nothing else.
- **Book 2:** the same pages with `.book-2` on the container (§6.3). Once Book 2 exists, two 48 px cover chips (📖1 / 📖2) appear in the top bar.

### 4.7 Progress (Mia; pictures only, scrolls)

```
┌───────────────────────────────────────────┐
│ (🏠)                 🏆                    │  y 0–64
│ ┌───────────────────────────────────────┐ │
│ │   Pup's path (SVG 311×200)             │ │  card 343×232: winding road, 6 stops
│ │  ①──╮      ③──╮                        │ │  current stop: mini Pup 56px + glow
│ │     ╰─②──╯     ╰─④──⑤──⑥               │ │  future stops: grey circle + "?"
│ └───────────────────────────────────────┘ │
│ ┌───────────────────────────────────────┐ │
│ │ this week: (🐾)(🐾🐾)( )(🐾)( )( )( )  │ │  card: paw row (.paw at 40px)
│ │ month: 7-col grid of 30px circles  ⭐  │ │  ⭐ (24px) at the end of any week row with 5+ paws
│ └───────────────────────────────────────┘ │
│ ┌──────────────────┐ ┌──────────────────┐ │  two trophy cards 163×150
│ │ 🏆 [plank pic]   │ │ 🏆 [squat pic]   │ │  pose pic 64px in an exercise-colour circle
│ │      42          │ │      14          │ │  number 56px heavy; unit fs 16 ("sec" / "reps")
│ └──────────────────┘ └──────────────────┘ │  tap → speaks the line (kid doc §7)
└───────────────────────────────────────────┘
```
**Pup's path SVG** (`viewBox="0 0 311 200"`):
```html
<div class="path-card" style="position:relative">
<svg class="path" viewBox="0 0 311 200" width="100%">
  <path d="M24 160 C 60 160, 50 100, 72 110 S 100 70, 120 80 S 150 140, 168 130 S 210 80, 228 92 S 270 50, 290 50"
        fill="none" stroke="#EADBC8" stroke-width="22" stroke-linecap="round"/>
  <path d="M24 160 C 60 160, 50 100, 72 110 S 100 70, 120 80 S 150 140, 168 130 S 210 80, 228 92 S 270 50, 290 50"
        fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="2 12" stroke-linecap="round"/>
  <!-- stops at (24,160) (72,110) (120,80) (168,130) (228,92) (290,50) -->
  <g class="stop is-done"><circle cx="24" cy="160" r="16"/><text x="24" y="166">1</text></g>
  <g class="stop is-current"><circle cx="72" cy="110" r="16"/><text x="72" y="116">2</text></g>
  <g class="stop is-future"><circle cx="120" cy="80" r="16"/><text x="120" y="86">?</text></g>
  <!-- … stops 4–6 the same way -->
</svg>
<div class="path-pup pup-wrap" style="--pup-size:56px"><!-- Pup, current stage --></div>
</div>
```
```css
.path .stop circle { fill: var(--sun); stroke: #fff; stroke-width: 4; }
.path .stop text   { font: 800 16px var(--font); fill: var(--ink); text-anchor: middle; }
.path .stop.is-future circle { fill: var(--empty); }
.path .stop.is-future text   { fill: var(--ink-faint); }
.path .stop.is-current circle { filter: drop-shadow(0 0 8px rgba(255,200,61,.9)); }
.path-pup { position: absolute; }   /* left/top set by JS: stop x,y × (svg.clientWidth / 311), minus half the size, minus 36 px up */
```

### 4.8 Parent Corner (behind the grown-up gate)

**Gate** (mechanism from the kid doc: hold 🔒 for 2 s, then answer a multiplication question):
```
Step 1 (overlay):  120px circle with 🔒 at 56px. Around it, an SVG ring (r=54, stroke 8, --ink) fills over 2 s
                   while held and unwinds over 200 ms on release. Caption "Grown-ups: press and hold" (fs 16 --ink-soft).
Step 2:  card 343 wide, --surface, radius 28
         "What is 6 × 4?"        fs 32 heavy
         [    24    ]            answer box 160×64, fs 40, --surface-2, radius 12
         [1][2][3]
         [4][5][6]               keypad 3×4, keys 96×64, radius 16, fs 28 bold, --surface + --sh-card
         [7][8][9]
         [⌫][0][✓]               ✓ = --go key with white text
```
The hold ring uses the §7.2 technique (circumference `2π·54 = 339.29`, `transition: stroke-dashoffset 2s linear` while held).

**Parent Corner layout** (the one calm screen: no Pup animation, `--fs-16` body):
```
┌───────────────────────────────────────────┐
│ (🏠)   Parent Corner                       │
│  OVERVIEW                                 │  section labels fs 12 caps --ink-soft
│ ┌───────────────────────────────────────┐ │
│ │ Total exercise days 23 · This week 4/7 │ │  stat rows 48, tabular-nums
│ │ Double days (month) 6 · Streak 3 (best 8)│
│ └───────────────────────────────────────┘ │
│  PLANK                                    │
│ ┌───────────────────────────────────────┐ │
│ │ PB 42 s · Goal 20 s · 7-day avg 18 s   │ │
│ │ [ 30-day bar chart, --plank bars ]     │ │  chart 311×160
│ └───────────────────────────────────────┘ │
│  SQUATS                                   │
│ ┌───────────────────────────────────────┐ │
│ │ PB 14 · Goal 7 · 7-day avg 6           │ │
│ │ [ 30-day bar chart, --squat bars ]     │ │
│ └───────────────────────────────────────┘ │
│  SETTINGS                                 │
│ ┌───────────────────────────────────────┐ │
│ │ Child name                     {name}›│ │  rows 56
│ │ Pet name                        {pup}›│ │
│ │ Plank goal / cap      [−] 20 [+] / 60  │ │  steppers 48×48
│ │ Squat goal / cap      [−]  7 [+] / 20  │ │
│ │ Squat tempo [mini Pup] slow ◯──●── fast│ │  range 2.0–3.5 s, accent --squat
│ │ Countdown        (3) (5) (10)          │ │  segmented, 44 tall
│ │ Sound                          (◯━━)   │ │  switch 51×31, on = --go
│ │ Page prize                   🍦 every ›│ │
│ └───────────────────────────────────────┘ │
│  DATA   [ Export backup ] [ Import ]      │  .btn-parent--ghost
└───────────────────────────────────────────┘
```
Next to the **squat tempo** slider is a 64 px mini Pup with `data-mood="squat"`. Its `--beat` follows the slider live (`el.style.setProperty('--beat', v + 's')`), so Dad *sees* the tempo.

```css
.pc-group { background: var(--surface); border-radius: var(--r-md); box-shadow: var(--sh-card); overflow: hidden; }
.pc-row { min-height: 56px; padding: 0 var(--sp-4); display: flex; align-items: center; justify-content: space-between;
          gap: var(--sp-3); font-size: var(--fs-16); border-bottom: 1px solid var(--line); }
.pc-row:last-child { border-bottom: 0; }
.pc-label { margin: var(--sp-5) var(--sp-2) var(--sp-2); font-size: var(--fs-12); font-weight: var(--fw-bold);
            letter-spacing: .08em; text-transform: uppercase; color: var(--ink-soft); }
input[type=range] { accent-color: var(--squat); width: 140px; }
```

**30-day bar chart** (inline SVG, `viewBox="0 0 311 160"`, one per exercise):
- Plot area y 8–130. Bar step `311 / 30 = 10.37`, bar width 7, `rx=3.5`, x = `i * 10.37 + 1.7`.
- `h = 120 * v / max(maxValue, goal * 1.25)`, and y = `130 − h`.
- Colours: bars in `--plank` / `--squat` at 45% opacity; bars at or above that day's goal at 100%; today's bar in `--sun`.
- **No-exercise day:** `<circle r="2.5" cy="126">` in `--empty-line`. Neutral, never red.
- Goal line: dashed `6 6`, `--ink-faint`, 2 px, at the *current* goal.
- X labels at y 152, 11 px, `--ink-soft`: every 7th day as `d/m`.
- Bars grow with `transform: scaleY()` (`transform-box: fill-box; transform-origin: bottom`), 450 ms, staggered 15 ms.

---

## 5. Pup

### 5.1 Base Pup SVG (front view, with every accessory for all 6 stages)

Paste this **once** as `<template id="pup-tpl">` and clone it for every Pup. It uses a `0 0 200 200` coordinate system with the feet at y ≈ 192. **Keep `overflow="visible"`** so jumps, tricks and the cape aren't clipped.

```html
<template id="pup-tpl">
<svg class="pup" data-stage="1" data-mood="idle" viewBox="0 0 200 200" overflow="visible"
     xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pup">
  <g class="pup-root">

    <!-- Stage 4+: cape (behind everything) -->
    <path class="acc acc-cape" d="M62 124 Q34 170 44 196 L156 196 Q166 170 138 124 Z"
          fill="#E5484D" stroke="#FFC83D" stroke-width="4" stroke-linejoin="round"/>

    <!-- Body (breathes / squashes). The tail is inside so it moves with the body. -->
    <g class="pup-body">
      <g class="pup-tail">
        <path d="M140 156 Q176 146 172 112" fill="none" stroke="#E8A96B" stroke-width="13" stroke-linecap="round"/>
        <circle cx="172" cy="112" r="7" fill="#B8733F"/>
      </g>
      <ellipse cx="100" cy="152" rx="48" ry="38" fill="#E8A96B"/>
      <ellipse cx="100" cy="160" rx="28" ry="24" fill="#FFF3E0"/>
    </g>

    <!-- Paws (stay planted on the floor) -->
    <g class="pup-paws">
      <ellipse cx="78" cy="184" rx="15" ry="9" fill="#FFF3E0" stroke="#E8A96B" stroke-width="3"/>
      <g class="pup-paw-r">
        <ellipse cx="122" cy="184" rx="15" ry="9" fill="#FFF3E0" stroke="#E8A96B" stroke-width="3"/>
      </g>
      <!-- Stage 5+: sneakers -->
      <g class="acc acc-sneakers">
        <ellipse cx="78" cy="183" rx="17" ry="10" fill="#5EC8F2"/>
        <rect x="61" y="187" width="34" height="6" rx="3" fill="#fff"/>
        <path d="M71 180 H85" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="122" cy="183" rx="17" ry="10" fill="#5EC8F2"/>
        <rect x="105" y="187" width="34" height="6" rx="3" fill="#fff"/>
        <path d="M115 180 H129" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    </g>

    <!-- Head (tilts / bobs as one unit) -->
    <g class="pup-head">
      <circle cx="100" cy="88" r="50" fill="#E8A96B"/>
      <ellipse cx="121" cy="78" rx="15" ry="14" fill="#D08A50"/>              <!-- eye patch -->

      <g class="pup-eyes-size">                                                <!-- stage 1: bigger eyes -->
        <g class="pup-eyes">                                                   <!-- blink -->
          <circle cx="80"  cy="80" r="7.5" fill="#3B2A20"/>
          <circle cx="120" cy="80" r="7.5" fill="#3B2A20"/>
          <circle cx="82.5"  cy="77.5" r="2.6" fill="#fff"/>
          <circle cx="122.5" cy="77.5" r="2.6" fill="#fff"/>
        </g>
      </g>
      <g class="pup-eyes-happy" fill="none" stroke="#3B2A20" stroke-width="4.5" stroke-linecap="round">
        <path d="M72 83 Q80 73 88 83"/><path d="M112 83 Q120 73 128 83"/>
      </g>
      <g class="pup-eyes-sleepy" fill="none" stroke="#3B2A20" stroke-width="4" stroke-linecap="round">
        <path d="M72 80 Q80 87 88 80"/><path d="M112 80 Q120 87 128 80"/>
      </g>

      <ellipse cx="100" cy="110" rx="26" ry="19" fill="#FFF3E0"/>             <!-- muzzle -->
      <circle cx="70"  cy="104" r="7" fill="#FF9AA2" opacity=".55"/>
      <circle cx="130" cy="104" r="7" fill="#FF9AA2" opacity=".55"/>
      <path class="pup-tongue" d="M94 112 Q100 125 106 112 Z" fill="#FF7A8A"/>
      <ellipse cx="100" cy="100" rx="8.5" ry="6" fill="#3B2A20"/>             <!-- nose -->
      <circle cx="97" cy="98" r="2" fill="#fff" opacity=".7"/>
      <path d="M100 106 V110 M100 110 Q94 116 89 111 M100 110 Q106 116 111 111"
            fill="none" stroke="#3B2A20" stroke-width="3" stroke-linecap="round"/>

      <!-- Stage 5+: sporty headband (before the ears so the ears overlap its ends) -->
      <g class="acc acc-headband">
        <path d="M56 66 Q100 30 144 66" fill="none" stroke="#5EC8F2" stroke-width="11" stroke-linecap="round"/>
        <path d="M60 64 Q100 33 140 64" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>
      </g>

      <ellipse cx="54"  cy="86" rx="14" ry="28" fill="#B8733F" transform="rotate(18 54 86)"/>
      <ellipse cx="146" cy="86" rx="14" ry="28" fill="#B8733F" transform="rotate(-18 146 86)"/>
    </g>

    <!-- Neck accessories (move with the head in squats) -->
    <g class="pup-neck">
      <!-- Stage 2+: bandana -->
      <g class="acc acc-bandana">
        <path d="M64 130 Q100 142 136 130 L100 170 Z" fill="#E5484D" stroke-linejoin="round"/>
        <circle cx="86" cy="140" r="3" fill="#fff"/><circle cx="112" cy="141" r="3" fill="#fff"/>
        <circle cx="100" cy="156" r="3" fill="#fff"/>
      </g>
      <!-- Stage 3+: collar with star tag -->
      <g class="acc acc-collar">
        <rect x="64" y="128" width="72" height="10" rx="5" fill="#2FA3D1"/>
        <polygon class="acc-tag" fill="#FFC83D" stroke="#E0A200" stroke-width="1.5" stroke-linejoin="round"
          points="100,139 102.2,144.4 108,144.6 103.5,148.3 104.9,154 100,150.8 95.1,154 96.5,148.3 92,144.6 97.8,144.4"/>
      </g>
      <!-- Stage 6: gold medal -->
      <g class="acc acc-medal">
        <path d="M84 132 L96 132 L104 156 L94 156 Z" fill="#5EC8F2"/>
        <path d="M116 132 L104 132 L96 156 L106 156 Z" fill="#2FA3D1"/>
        <circle cx="100" cy="165" r="13" fill="#FFC83D" stroke="#E0A200" stroke-width="3"/>
        <polygon fill="#fff" points="100,158 101.8,162.6 106.7,162.8 102.9,165.9 104.1,170.7 100,168 95.9,170.7 97.1,165.9 93.3,162.8 98.2,162.6"/>
      </g>
    </g>

  </g>
</svg>
</template>
```

### 5.2 Six growth stages (matching the kid doc §3.2; accessories only add up, nothing is ever taken away)

| Stage | Name | Visual | Size (`--pup-scale`) |
|---|---|---|---|
| 1 | Tiny Pup | plain, **bigger eyes** (1.18×), wobbly | .58 |
| 2 | Puppy | + **red polka-dot bandana** | .68 |
| 3 | Buddy | + **blue collar with gold star tag** | .78 |
| 4 | Big Pup | + **little red cape** with gold edge | .87 |
| 5 | Sporty Pup | + **blue headband + blue sneakers** | .94 |
| 6 | Super Pup | + **gold medal** (the star tag hides under the ribbon) | 1.00 |

The treat thresholds are in the kid doc (0 / 80 / 200 / 380 / 620 / 950).

```css
.pup .acc { display: none; }
.pup:is([data-stage="2"],[data-stage="3"],[data-stage="4"],[data-stage="5"],[data-stage="6"]) .acc-bandana,
.pup:is([data-stage="3"],[data-stage="4"],[data-stage="5"],[data-stage="6"]) .acc-collar,
.pup:is([data-stage="4"],[data-stage="5"],[data-stage="6"]) .acc-cape,
.pup:is([data-stage="5"],[data-stage="6"]) .acc-headband,
.pup:is([data-stage="5"],[data-stage="6"]) .acc-sneakers,
.pup[data-stage="6"] .acc-medal { display: inline; }
.pup[data-stage="6"] .acc-tag { display: none; }

.pup .pup-eyes-size { transform-box: fill-box; transform-origin: center; }
.pup[data-stage="1"] .pup-eyes-size { transform: scale(1.18); }

.pup-wrap { --pup-size: 200px; position: relative; display: grid; place-items: end center; height: var(--pup-size); }
.pup { width: calc(var(--pup-size) * var(--pup-scale, 1)); height: auto; overflow: visible;
       transition: width var(--dur-hero) var(--ease-bounce); }
.pup[data-stage="1"] { --pup-scale: .58; }
.pup[data-stage="2"] { --pup-scale: .68; }
.pup[data-stage="3"] { --pup-scale: .78; }
.pup[data-stage="4"] { --pup-scale: .87; }
.pup[data-stage="5"] { --pup-scale: .94; }
.pup[data-stage="6"] { --pup-scale: 1; }
.pup-wrap.fixed-size .pup { --pup-scale: 1; }   /* pictures on buttons: always fill their box */
.pup-wrap.fixed-size { height: auto; }
```
Container sizes (`--pup-size`) are Home 200, Squats 340, Celebrate 180, Count check 180, Meet Pup 180, Progress mini 56, big moment 280, and Parent Corner tempo preview 64.

```js
// Signature matches 02-development.md (js/ui/pup.js). Pass tpl = 'pup-plank-tpl' for the side view.
function mountPup(container, stage = 1, mood = 'idle', tpl = 'pup-tpl') {
  const svg = document.getElementById(tpl).content.firstElementChild.cloneNode(true);
  svg.dataset.stage = String(stage);
  svg.dataset.mood = mood;
  container.replaceChildren(svg);
  return svg;
}
```

### 5.3 Pivot points and face switches (required in iOS Safari)
```css
.pup .pup-root  { transform-box: view-box; transform-origin: 100px 192px; }  /* feet */
.pup .pup-body, .pup .acc-cape { transform-box: view-box; transform-origin: 100px 190px; }
.pup .pup-head  { transform-box: view-box; transform-origin: 100px 132px; }  /* neck */
.pup .pup-neck  { transform-box: view-box; transform-origin: 100px 140px; }
.pup .pup-tail  { transform-box: view-box; transform-origin: 140px 156px; }
.pup .pup-paw-r { transform-box: view-box; transform-origin: 122px 184px; }
.pup .pup-eyes  { transform-box: fill-box; transform-origin: center; }

.pup .pup-eyes-happy, .pup .pup-eyes-sleepy, .pup .pup-tongue { display: none; }
.pup:is([data-mood="cheer"],[data-mood="jump"],[data-mood^="trick-"]) .pup-eyes { display: none; }
.pup:is([data-mood="cheer"],[data-mood="jump"],[data-mood^="trick-"]) :is(.pup-eyes-happy, .pup-tongue) { display: inline; }
.pup:is([data-mood="squat"],[data-mood="pose-squat"]) .pup-tongue { display: inline; }
.pup[data-mood="sleepy"] .pup-eyes { display: none; }
.pup[data-mood="sleepy"] .pup-eyes-sleepy { display: inline; }
```

### 5.4 Expression states: idle, cheer, jump for joy (+ sleepy)
```css
/* IDLE: breathing, head bob, gentle wag, blink */
.pup[data-mood="idle"] .pup-body { animation: pup-breathe 2.4s var(--ease-in-out) infinite; }
.pup[data-mood="idle"] .pup-head { animation: pup-head-bob 2.4s var(--ease-in-out) infinite; }
.pup[data-mood="idle"] .pup-tail { animation: pup-wag .9s var(--ease-in-out) infinite alternate; }
.pup[data-mood="idle"] .pup-eyes { animation: pup-blink 4.2s linear infinite; }
@keyframes pup-breathe  { 0%,100% { transform: scale(1,1); } 50% { transform: scale(1.02,1.04); } }
@keyframes pup-head-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes pup-wag      { from { transform: rotate(-10deg); } to { transform: rotate(14deg); } }
@keyframes pup-blink    { 0%,94%,100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }

/* CHEER: bounce, head tilt, fast wag, happy eyes + tongue */
.pup[data-mood="cheer"] .pup-root { animation: pup-bounce .6s var(--ease-out) infinite alternate; }
.pup[data-mood="cheer"] .pup-head { animation: pup-tilt 1.2s var(--ease-in-out) infinite; }
.pup[data-mood="cheer"] .pup-tail { animation: pup-wag .22s linear infinite alternate; }
@keyframes pup-bounce { from { transform: translateY(0) scale(1.03,.97); } to { transform: translateY(-10px) scale(.98,1.02); } }
@keyframes pup-tilt   { 0%,100% { transform: rotate(-7deg); } 50% { transform: rotate(7deg); } }

/* JUMP FOR JOY: squash-and-stretch hops */
.pup[data-mood="jump"] .pup-root { animation: pup-jump .8s var(--ease-out) infinite; }
.pup[data-mood="jump"] .pup-head { animation: pup-tilt .8s var(--ease-in-out) infinite; }
.pup[data-mood="jump"] .pup-tail { animation: pup-wag .18s linear infinite alternate; }
@keyframes pup-jump {
  0%   { transform: translateY(0)     scale(1.10,.88); }
  25%  { transform: translateY(-46px) scale(.94,1.08); }
  50%  { transform: translateY(-58px) rotate(-4deg); }
  75%  { transform: translateY(-20px) scale(.97,1.04); }
  90%  { transform: translateY(0)     scale(1.12,.86); }
  100% { transform: translateY(0)     scale(1,1); }
}

/* SLEEPY (both exercises done): slow breathing, closed eyes */
.pup[data-mood="sleepy"] .pup-body { animation: pup-breathe 3.6s var(--ease-in-out) infinite; }
.pup[data-mood="sleepy"] .pup-head { animation: pup-doze 3.6s var(--ease-in-out) infinite; }
@keyframes pup-doze { 0%,100% { transform: rotate(0) translateY(0); } 50% { transform: rotate(-5deg) translateY(3px); } }
```

### 5.5 Squat-along animation (Squats screen) and tricks

One animation cycle is **one rep**, lasting `--beat` (default 2.5 s): down for ~1.1 s, a short sit, then up for ~1.1 s. The "boop" plays at the start of each cycle, and the count goes up at the end ("on the way up").

```css
.pup[data-mood="squat"] :is(.pup-body, .acc-cape) { animation: squat-body var(--beat) var(--ease-in-out) infinite; }
.pup[data-mood="squat"] :is(.pup-head, .pup-neck) { animation: squat-head var(--beat) var(--ease-in-out) infinite; }
.pup[data-mood="squat"] .pup-tail { animation: squat-tail var(--beat) linear infinite; }
.pup[data-mood="squat"] .pup-eyes { animation: pup-blink 4.2s linear infinite; }
.floor-shadow { height: 18px; margin: -10px auto 0; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(59,42,32,.18), transparent 70%); }
.floor-shadow.is-squatting { animation: squat-shadow var(--beat) var(--ease-in-out) infinite; }

@keyframes squat-body   { 0%,100% { transform: scale(1,1); }    44%,56% { transform: scale(1.1,.78); } }
@keyframes squat-head   { 0%,100% { transform: translateY(0); } 44%,56% { transform: translateY(24px); } }
@keyframes squat-shadow { 0%,100% { transform: scaleX(1); }     44%,56% { transform: scaleX(1.15); } }
/* tail: still while going down, quick happy wag as he stands tall (the "rep!" moment) */
@keyframes squat-tail {
  0%,80% { transform: rotate(0); } 84% { transform: rotate(18deg); } 88% { transform: rotate(-12deg); }
  92% { transform: rotate(18deg); } 96% { transform: rotate(-8deg); } 100% { transform: rotate(0); } }

/* Static "bottom of the squat" pose: Home button picture, Setup row, Progress trophy */
.pup[data-mood="pose-squat"] :is(.pup-body, .acc-cape) { transform: scale(1.1,.78); }
.pup[data-mood="pose-squat"] :is(.pup-head, .pup-neck) { transform: translateY(24px); }
```
**Keep the count in sync with Pup.** The dev doc's squat clock is the source of truth: rep *n* completes at `t = n × beatMs` (`repsCompleted`, `squatCuesBetween`). Start the CSS animation **at that clock's t = 0**, so each animation cycle ends exactly as a rep completes:
```js
function startSquatAnimation(svg, beatMs) {
  document.documentElement.style.setProperty('--beat', beatMs + 'ms');
  svg.dataset.mood = 'idle'; void svg.getBoundingClientRect();   // force the CSS animation to restart
  svg.dataset.mood = 'squat';                                    // call in the same frame as the squat clock's t0
}
```
If the app is backgrounded or paused, call it again when the clock resumes, and set `animation-delay: -${elapsedMs % beatMs}ms` on the animated groups to re-align the phase. The squat animation is **essential content** (Mia copies it), so it stays on with reduced motion (§8).

**Tricks** (one-shot, ~1.2 s; the kid doc assigns one per stage: wag+sneeze, sit, high-five, spin, jump squat, backflip):
```css
.pup[data-mood="trick-wag"]  .pup-tail { animation: pup-wag .15s linear 8 alternate; }
.pup[data-mood="trick-wag"]  .pup-root { animation: pup-bounce .3s var(--ease-out) 4 alternate; }

.pup[data-mood="trick-sneeze"] .pup-head { animation: sneeze 1.1s var(--ease-out) both; }
@keyframes sneeze { 0% { transform: none; } 45% { transform: rotate(-8deg) translateY(-6px) scale(1.04); }
                    55% { transform: rotate(10deg) translateY(6px) scale(.96); } 70%,100% { transform: none; } }

.pup[data-mood="trick-sit"] .pup-root { animation: sit 1.2s var(--ease-bounce) both; }
@keyframes sit { 0%,100% { transform: none; } 30%,75% { transform: translateY(10px) scale(1.06,.9); } }

.pup[data-mood="trick-highfive"] .pup-paw-r { animation: highfive 1.2s var(--ease-bounce) both; }
.pup[data-mood="trick-highfive"] .pup-head  { animation: pup-tilt 1.2s var(--ease-in-out) both; }
@keyframes highfive { 0%,100% { transform: none; } 30%,70% { transform: translate(18px,-78px) rotate(-25deg); } }

.pup[data-mood="trick-spin"] .pup-root { animation: spin-fake .9s var(--ease-in-out) both; }
@keyframes spin-fake { 0%,100% { transform: scaleX(1); } 25% { transform: scaleX(0); } 50% { transform: scaleX(-1); } 75% { transform: scaleX(0); } }

.pup[data-mood="trick-jump"] .pup-root { animation: pup-jump .8s var(--ease-out) 2 both; }

.pup[data-mood="trick-flip"] .pup-root { transform-origin: 100px 120px; animation: backflip 1.1s var(--ease-in-out) both; }
@keyframes backflip { 0% { transform: none; } 15% { transform: translateY(6px) scale(1.08,.9); }
  55% { transform: translateY(-80px) rotate(-360deg); } 85% { transform: translateY(0) rotate(-360deg) scale(1.08,.9); }
  100% { transform: rotate(-360deg); } }
```
```js
function playTrick(svg, name, ms = 1700) {        // trick-jump runs 2 × .8 s; others ≤ 1.2 s
  const prev = svg.dataset.mood;
  svg.dataset.mood = 'trick-' + name;
  return new Promise(res => setTimeout(() => { svg.dataset.mood = prev; res(); }, ms));
}
// Double day: await playTrick(pup, 'sit'); await playTrick(pup, 'spin');
```

### 5.6 Side-view Pup in plank pose (Plank screen, Home "Plank" button, trophies)

This is a second template, `<template id="pup-plank-tpl">`. The wobble shrinks as Pup grows ("a wobbly baby plank gets steadier each stage"). It has no accessories, to keep the side view simple, and uses the same stage scale values.
```html
<template id="pup-plank-tpl">
<svg class="pup pup-plank" data-stage="1" data-mood="plank" viewBox="0 0 160 100" overflow="visible"
     xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pup doing a plank">
  <g class="pp-root">
    <g class="pp-tail"><path d="M126 50 Q146 38 146 22" fill="none" stroke="#B8733F" stroke-width="7" stroke-linecap="round"/></g>
    <path d="M122 56 L132 84" stroke="#E8A96B" stroke-width="11" stroke-linecap="round"/>
    <ellipse cx="136" cy="87" rx="9" ry="4.5" fill="#FFF3E0"/>
    <ellipse cx="88" cy="54" rx="44" ry="15" fill="#E8A96B" transform="rotate(-6 88 54)"/>
    <ellipse cx="88" cy="60" rx="30" ry="7"  fill="#FFF3E0" transform="rotate(-6 88 60)"/>
    <path d="M54 60 L54 80 M54 83 L32 83" stroke="#E8A96B" stroke-width="10" stroke-linecap="round" fill="none"/>
    <ellipse cx="28" cy="84" rx="8" ry="4.5" fill="#FFF3E0"/>
    <circle cx="38" cy="40" r="20" fill="#E8A96B"/>
    <ellipse cx="22" cy="46" rx="11" ry="8" fill="#FFF3E0"/>
    <ellipse cx="13" cy="43" rx="4" ry="3" fill="#3B2A20"/>
    <circle cx="30" cy="36" r="3.4" fill="#3B2A20"/><circle cx="31.2" cy="34.8" r="1.1" fill="#fff"/>
    <circle cx="33" cy="48" r="4" fill="#FF9AA2" opacity=".55"/>
    <path d="M16 50 Q21 53 26 50" fill="none" stroke="#3B2A20" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="48" cy="38" rx="7" ry="13" fill="#B8733F" transform="rotate(15 48 38)"/>
  </g>
  <path d="M4 92 H156" stroke="#EADBC8" stroke-width="4" stroke-linecap="round"/>
</svg>
</template>
```
```css
.pup-plank .pp-root { transform-box: view-box; transform-origin: 88px 86px;
  animation: pp-wobble 1.4s var(--ease-in-out) infinite; }
.pup-plank .pp-tail { transform-box: view-box; transform-origin: 126px 50px;
  animation: pup-wag .5s var(--ease-in-out) infinite alternate; }
@keyframes pp-wobble { 0%,100% { transform: rotate(calc(var(--wobble) * -1)); } 50% { transform: rotate(var(--wobble)); } }
.pup-plank[data-stage="1"] { --wobble: 4deg; }
.pup-plank[data-stage="2"] { --wobble: 3deg; }
.pup-plank[data-stage="3"] { --wobble: 2deg; }
.pup-plank[data-stage="4"] { --wobble: 1.2deg; }
.pup-plank[data-stage="5"] { --wobble: .6deg; }
.pup-plank[data-stage="6"] { --wobble: 0deg; }
.pup-plank[data-mood="still"] :is(.pp-root, .pp-tail) { animation: none; }         /* button pictures */
.is-goal .pup-plank .pp-tail, .is-record .pup-plank .pp-tail { animation-duration: .18s; }  /* happy fast wag */
```
On the Plank screen, use `<div class="pup-wrap" style="--pup-size:200px">`. The SVG is 160:100, so it renders about 200 × 125 at stage 6.

---

## 6. Stickers

### 6.1 The 36 page stickers + 7 milestones (matching the kid doc §3.1)

The **data** lives in `js/catalog.js` (`STICKER_PAGES`, `MILESTONE_STICKERS`; see the dev doc). The stored id is **page-prefixed**, e.g. `garden-sunflower` or `days-14`, never the emoji. This section adds only the **visual** fields: page background, shape and rotation. These emoji need iOS ≥ 15.4 (the 🫧 on the naming card is the newest); the iPhone 13 mini has that.

| Page | Theme | bg token | Stickers (id: emoji) |
|---|---|---|---|
| 1 | Garden 🌻 | `--st-garden` | sunflower 🌻 · butterfly 🦋 · ladybug 🐞 · rainbow 🌈 · snail 🐌 · mushroom 🍄 |
| 2 | Ocean 🐳 | `--st-ocean` | fish 🐠 · whale 🐳 · octopus 🐙 · shell 🐚 · crab 🦀 · starfish ⭐ |
| 3 | Yummy 🍓 | `--st-yummy` | strawberry 🍓 · icecream 🍦 · cupcake 🧁 · banana 🍌 · pizza 🍕 · watermelon 🍉 |
| 4 | Sky 🚀 | `--st-sky` (navy) | moon 🌙 · star 🌟 · rocket 🚀 · cloud ☁️ · balloon 🎈 · planet 🪐 |
| 5 | Jungle 🦁 | `--st-jungle` | lion 🦁 · monkey 🐒 · parrot 🦜 · elephant 🐘 · giraffe 🦒 · tiger 🐯 |
| 6 | Sparkle 💎 | `--st-sparkle` | crown 👑 · unicorn 🦄 · heart 💖 · gem 💎 · wand 🪄 · trophy 🏆 |
| 7 | Pup page 🐾 | gold rosettes | milestone days **7 · 14 · 21 · 30 · 50 · 75 · 100** |

```js
// Visual lookup only. Keys match catalog.js page ids; names match its sticker names.
const PAGES = [
  { id: 'garden',  icon: '🌻', bg: '--st-garden',  items: [['sunflower','🌻'],['butterfly','🦋'],['ladybug','🐞'],['rainbow','🌈'],['snail','🐌'],['mushroom','🍄']] },
  { id: 'ocean',   icon: '🐳', bg: '--st-ocean',   items: [['fish','🐠'],['whale','🐳'],['octopus','🐙'],['shell','🐚'],['crab','🦀'],['starfish','⭐']] },
  { id: 'yummy',   icon: '🍓', bg: '--st-yummy',   items: [['strawberry','🍓'],['icecream','🍦'],['cupcake','🧁'],['banana','🍌'],['pizza','🍕'],['watermelon','🍉']] },
  { id: 'sky',     icon: '🚀', bg: '--st-sky',     items: [['moon','🌙'],['star','🌟'],['rocket','🚀'],['cloud','☁️'],['balloon','🎈'],['planet','🪐']] },
  { id: 'jungle',  icon: '🦁', bg: '--st-jungle',  items: [['lion','🦁'],['monkey','🐒'],['parrot','🦜'],['elephant','🐘'],['giraffe','🦒'],['tiger','🐯']] },
  { id: 'sparkle', icon: '💎', bg: '--st-sparkle', items: [['crown','👑'],['unicorn','🦄'],['heart','💖'],['gem','💎'],['wand','🪄'],['trophy','🏆']] },
];
const SHAPES = ['circle', 'blob', 'square', 'circle', 'square', 'blob'];   // by position on the page
const rotFor = (pageIdx, i) => ((pageIdx * 6 + i) * 37) % 13 - 6;       // -6..+6 deg, deterministic
const MILESTONES = [7, 14, 21, 30, 50, 75, 100];
// stored id = `${page.id}-${name}` (e.g. "garden-sunflower"); milestone id = `days-${n}`
// render: <div class="sticker sticker--${SHAPES[i]}" style="--c: var(${page.bg}); --r: ${rotFor(p,i)}deg"><span>${emoji}</span></div>
```

### 6.2 Die-cut sticker, locked state
```html
<div class="sticker sticker--blob" style="--c: var(--st-garden); --r: -4deg"><span>🦋</span></div>
<div class="sticker is-locked" style="--r: 3deg"><span>🦋</span><b>?</b></div>
```
```css
.sticker {
  --size: 132px; position: relative; width: var(--size); height: var(--size);
  display: grid; place-items: center; background: var(--c, var(--st-garden));
  border: calc(var(--size) * .06) solid #fff;              /* white die-cut edge */
  border-radius: 50%; box-shadow: var(--sh-sticker);
  transform: rotate(var(--r, 0deg)); font-size: calc(var(--size) * .52); line-height: 1;
}
.sticker--square { border-radius: 28%; }
.sticker--blob   { border-radius: 58% 42% 55% 45% / 48% 58% 42% 52%; }
.sticker::before {                                          /* glossy highlight */
  content: ""; position: absolute; inset: 8% 40% 55% 12%; border-radius: 50%;
  background: rgba(255,255,255,.45); transform: rotate(-20deg); pointer-events: none; }

/* Locked: grey silhouette + "?" */
.sticker.is-locked { background: var(--empty); border-style: dashed; border-color: var(--empty-line); box-shadow: none; }
.sticker.is-locked::before { display: none; }
.sticker.is-locked span { filter: brightness(0); opacity: .12; }
.sticker.is-locked b { position: absolute; font-size: calc(var(--size) * .42); font-weight: var(--fw-heavy);
  color: #fff; text-shadow: 0 2px 0 var(--empty-line); }
```

### 6.3 Gold PB frame, Book 2 sparkle, milestone rosette
```css
/* Personal-best day: gold frame + shine sweep */
.sticker.is-gold { border-color: var(--sun); overflow: hidden;
  box-shadow: 0 0 0 3px var(--sun-dark), 0 0 18px rgba(255,200,61,.9), var(--sh-sticker); }
.sticker.is-gold::after { content: ""; position: absolute; inset: -20%;
  background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,.75) 50%, transparent 60%);
  animation: shine 3s var(--ease-in-out) infinite; pointer-events: none; }
@keyframes shine { 0% { transform: translateX(-60%); } 60%,100% { transform: translateX(60%); } }

/* Book 2: same stickers, sparkly */
.book-2 .sticker:not(.is-locked) { border-color: #FFE08A; }
.book-2 .sticker:not(.is-locked) span { filter: saturate(1.4) drop-shadow(0 0 6px #fff) drop-shadow(0 0 2px #FFC83D); }

/* Milestone rosette (Pup page) */
.rosette { --size: 96px; position: relative; isolation: isolate; width: var(--size); height: var(--size); border-radius: 50%;
  display: grid; place-content: center; justify-items: center; line-height: 1;
  background: radial-gradient(circle, #FFF3C4 0 56%, transparent 57%),
              repeating-conic-gradient(var(--sun) 0 15deg, var(--sun-dark) 15deg 30deg);
  box-shadow: var(--sh-sticker); }
.rosette .r-paw { font-size: 22px; }
.rosette .r-num { font-size: 32px; font-weight: var(--fw-heavy); color: var(--ink); }
.rosette::before, .rosette::after { content: ""; position: absolute; bottom: -18px; width: 20px; height: 34px;
  background: var(--sky); z-index: -1; clip-path: polygon(0 0,100% 0,100% 100%,50% 80%,0 100%); }
.rosette::before { left: 26%; transform: rotate(14deg); }  .rosette::after { right: 26%; transform: rotate(-14deg); }
.rosette.is-locked { filter: grayscale(1) opacity(.45); }
```
HTML: `<div class="rosette"><span class="r-paw">🐾</span><span class="r-num">14</span></div>`.

### 6.4 Reveal extras: sunburst and ring burst
These go behind the chosen card and in big-moment scenes:
```css
.sunburst { position: absolute; inset: -40px; border-radius: 50%; pointer-events: none; z-index: -1;
  background: repeating-conic-gradient(from 0deg, #FFE08A 0 10deg, transparent 10deg 20deg);
  -webkit-mask: radial-gradient(circle, #000 35%, transparent 70%); mask: radial-gradient(circle, #000 35%, transparent 70%);
  animation: spin 12s linear infinite; }
.ring-burst { position: absolute; inset: 0; border-radius: 50%; border: 6px solid var(--sun); pointer-events: none;
  animation: ring-burst 700ms var(--ease-out) both; }
@keyframes spin       { to { transform: rotate(360deg); } }
@keyframes ring-burst { from { transform: scale(.6); opacity: 1; } to { transform: scale(1.7); opacity: 0; } }
```

### 6.5 Confetti and floating emoji (pure CSS + JS, no library)
```css
.fx-layer { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 50; }
.confetti { position: absolute; top: -24px; left: var(--x); width: 10px; height: 14px; border-radius: 3px;
  animation: confetti-fall var(--dur) cubic-bezier(.25,.6,.4,1) var(--delay) both; will-change: transform; }
.confetti.round { width: 11px; height: 11px; border-radius: 50%; }
@keyframes confetti-fall {
  0%   { transform: translate3d(0,0,0) rotate(0deg); opacity: 1; }
  85%  { opacity: 1; }
  100% { transform: translate3d(var(--drift),110vh,0) rotate(var(--rot)); opacity: 0; } }
.float-emoji { position: absolute; bottom: -40px; left: var(--x); font-size: var(--fs, 32px);
  animation: float-up var(--dur) var(--ease-out) var(--delay) both; }
@keyframes float-up { 0% { transform: translateY(0) scale(.6); opacity: 0; } 15% { opacity: 1; }
  100% { transform: translate(var(--drift), -70vh) scale(1.1); opacity: 0; } }
```
```js
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const PARTY = ['#FFC83D', '#FF9AA2', '#5EC8F2', '#1F9D5B', '#8A4FC7', '#FF8A5B'];
const GOLD  = ['#FFC83D', '#FFE08A', '#E0A200', '#FFFFFF'];

function fxLayer(ms) {
  const l = document.createElement('div'); l.className = 'fx-layer';
  document.body.appendChild(l); setTimeout(() => l.remove(), ms); return l;
}

function confettiBurst(count = 80, colors = PARTY) {
  if (reduceMotion()) return;
  const layer = fxLayer(3500);
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    p.className = 'confetti' + (i % 3 === 0 ? ' round' : '');
    p.style.setProperty('--x', Math.random() * 100 + 'vw');
    p.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
    p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    p.style.setProperty('--delay', Math.random() * 300 + 'ms');
    p.style.setProperty('--dur', 1600 + Math.random() * 1200 + 'ms');
    p.style.background = colors[i % colors.length];
    layer.appendChild(p);
  }
}

function emojiFloat(emoji = '❤️', count = 10) {
  if (reduceMotion()) return;
  const layer = fxLayer(3200);
  for (let i = 0; i < count; i++) {
    const e = document.createElement('span');
    e.className = 'float-emoji'; e.textContent = emoji;
    e.style.setProperty('--x', 10 + Math.random() * 80 + 'vw');
    e.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    e.style.setProperty('--delay', Math.random() * 600 + 'ms');
    e.style.setProperty('--dur', 1800 + Math.random() * 800 + 'ms');
    e.style.setProperty('--fs', 24 + Math.random() * 20 + 'px');
    layer.appendChild(e);
  }
}
```
Usage: tier 0 is `emojiFloat('❤️')`, tier 1 is `confettiBurst(60)`, and tier 2 is `confettiBurst(120, GOLD)` followed 300 ms later by `confettiBurst(60)`. The double day is `emojiFloat('🐾', 12)`, and reaching the goal *during* an exercise is `confettiBurst(30)`.

---

## 7. Exercise screen visuals (Plank & Squats)

### 7.1 Big numbers
```css
.timer, .count { font-weight: var(--fw-heavy); line-height: 1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.timer { font-size: var(--fs-timer); color: var(--ink); }    /* Plank: whole seconds, "23", never "0:23" (cap ≤ 90 s → ≤ 2 digits) */
.count { font-size: var(--fs-count); color: var(--squat); }  /* Squat reps (cap ≤ 30 → ≤ 2 digits) */
```
Both numbers fit inside their rings: two digits at 128 px ≈ 150 px wide, inside a 256 px inner diameter; two at 160 px ≈ 185 px, inside 180 px, with `letter-spacing: -.04em` on `.count`. If "20"+ ever looks tight, drop `.count` to 148 px.

### 7.2 Goal ring with 🦴 marker (shared component)
The ring fills clockwise from 12 o'clock, and the goal bone sits **at 12 o'clock**, where the ring completes. Plank: `size 300, r 138, stroke 22`. Squats: `size 220, r 100, stroke 20`.
```html
<div class="ring-wrap" style="--size:300px; --stroke:22">
  <svg class="ring" viewBox="0 0 300 300" aria-hidden="true">
    <circle class="ring-track"   cx="150" cy="150" r="138"/>
    <circle class="ring-fill"    cx="150" cy="150" r="138"/>
    <circle class="ring-sparkle" cx="150" cy="150" r="148"/>
  </svg>
  <span class="ring-bone">🦴</span>
  <div class="ring-center"><div class="timer" id="timer">0</div></div>
</div>
```
Squats: `viewBox="0 0 220 220"`, `cx=cy=110`, `r=100`, sparkle `r=110`, `style="--size:220px; --stroke:20"`, and `.count` in the centre.
```css
.ring-wrap { position: relative; width: var(--size); height: var(--size); margin: 0 auto; flex: none; }
.ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible; }
.ring-track { fill: none; stroke: rgba(255,255,255,.75); stroke-width: var(--stroke); }
.ring-fill  { fill: none; stroke: var(--ex-color); stroke-width: var(--stroke); stroke-linecap: round;
  transition: stroke-dashoffset 250ms linear, stroke var(--dur-slow) var(--ease-out); }
.ring-sparkle { fill: none; stroke: var(--sun); stroke-width: 4; stroke-dasharray: 2 18; stroke-linecap: round;
  opacity: 0; transform-box: view-box; transform-origin: center; }
.ring-bone { position: absolute; left: 50%; top: 0; translate: -50% -50%; width: 52px; height: 52px; border-radius: 50%;
  background: #fff; box-shadow: var(--sh-card); display: grid; place-items: center; font-size: 30px; z-index: 2; }
.ring-center { position: absolute; inset: 0; display: grid; place-items: center; }
```
```js
function setupRing(wrap) {
  const c = wrap.querySelector('.ring-fill');
  const C = 2 * Math.PI * Number(c.getAttribute('r'));   // Plank 867.08, Squats 628.32
  c.style.strokeDasharray = C; c.style.strokeDashoffset = C;
  return (value, goal) => { c.style.strokeDashoffset = C * (1 - Math.min(value / goal, 1)); };
}
// const updatePlankRing = setupRing(document.querySelector('#screen-plank .ring-wrap'));
// updatePlankRing(elapsedSec, goalSec);   // call every 100–250 ms, or on each rep
```

### 7.3 Background states: blue → green at goal → gold at record
```css
.screen.ex            { --ex-color: var(--plank); }
#screen-squats.ex            { --ex-color: var(--squat); }
.screen.ex.is-running { background: var(--ex-bg-run); }
.screen.ex.is-goal    { background: var(--ex-bg-goal); }
.screen.ex.is-record  { background: var(--ex-bg-record); }

.is-goal .ring-bone, .is-record .ring-bone { animation: pop var(--dur-slow) var(--ease-bounce), wiggle 600ms 450ms; }
.is-goal .ring-bone::after, .is-record .ring-bone::after { content: "✓"; position: absolute; right: -6px; bottom: -6px;
  width: 24px; height: 24px; border-radius: 50%; background: var(--plank); color: #fff;
  font-size: 15px; font-weight: 800; display: grid; place-items: center; }
.is-record .ring-fill { stroke: var(--sun); filter: drop-shadow(0 0 8px rgba(255,200,61,.8)); }
.is-record .ring-sparkle { opacity: 1; animation: spin 6s linear infinite; }
.record-cup { position: absolute; right: 8px; top: 40%; font-size: 56px; animation: pop var(--dur-slow) var(--ease-bounce), wiggle 600ms 450ms; }
```
- **Reaching the goal (first time):** add `.is-running.is-goal` and run `confettiBurst(30)`. The big Squats Pup plays **no** trick (he must keep the beat), and the side-view Pup's tail wags fast. The chime comes from the kid doc.
- **Beating the PB:** add `.is-record`. The ring turns gold, the sparkle ring spins, and a `<span class="record-cup">🏆</span>` pops in beside the ring.
- After the goal, the ring stays full and the number keeps counting.

### 7.4 Number feedback
```css
.tick    { animation: count-bump var(--dur-fast) var(--ease-out); }   /* each second / rep / −+ tap */
@keyframes count-bump { from { transform: scale(1.12); } to { transform: scale(1); } }
.sparkle { animation: count-sparkle 600ms var(--ease-out); }          /* every 5th rep */
@keyframes count-sparkle { 0% { transform: scale(1.25); text-shadow: 0 0 0 #FFE08A; }
  40% { text-shadow: 0 0 24px #FFC83D, 0 0 48px #FFE08A; } 100% { transform: scale(1); text-shadow: none; } }
```
```js
function retrigger(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
```

---

## 8. Motion principles

| Use | Duration | Easing |
|---|---|---|
| Button press (down 6 px, shadow shrinks) | 120 ms | `--ease-out` |
| Number tick, small state changes | 180 ms | `--ease-out` |
| Screen change (fade + 16 px rise) | 280 ms | `--ease-out` |
| Pop-ins, badges, bubble, bone | 450 ms | `--ease-bounce` |
| Card flip, stage-up grow | 700 ms | `--ease-bounce` |
| Background state (blue/green/gold) | 450 ms | `--ease-out` |
| Treat bowl fill | 1200 ms | `--ease-out` |
| Idle loops | 0.9–3.6 s, infinite | `--ease-in-out` |
| Squat-along | `--beat` (2.0–3.5 s) | `--ease-in-out` |
| Confetti / floating emoji | 1.6–2.8 s | custom / `--ease-out` |

1. **Bouncy in, soft out.** Things that appear overshoot a little. Things that leave fade out in 200 ms.
2. **Every child tap responds within 120 ms** (press-down plus a sound), so Mia knows it worked.
3. **One hero moment at a time, in sequence.** On Celebrate the order is result → Pup trick → bowl → cards → flip → fly → buttons, and tier 3 comes last.
4. **Idle is calm** (≤ 4% scale, ≤ 14° wag). The 🎁 glow is slow and never bounces.
5. **Nothing flashes** more than 3 times a second.

```css
.screen-enter { animation: screen-in var(--dur-base) var(--ease-out) both; }
@keyframes screen-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.wiggle { animation: wiggle 400ms var(--ease-in-out); }
@keyframes wiggle { 0%,100% { rotate: 0deg; } 25% { rotate: -8deg; } 75% { rotate: 8deg; } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important;
  }
  /* EXCEPTION: the squat-along demo is content, not decoration. Keep it. */
  .pup[data-mood="squat"] :is(.pup-body, .acc-cape, .pup-head, .pup-neck, .pup-tail),
  .floor-shadow.is-squatting {
    animation-duration: var(--beat) !important; animation-iteration-count: infinite !important; }
}
```
With reduced motion, `confettiBurst` and `emojiFloat` do nothing (built in), and card flips happen instantly. Colour and state changes (blue, green, gold, ✅) still happen, so the feedback stays.

---

## 9. App icon & splash

### 9.1 Icon SVG (pup face, full-bleed square; iOS rounds the corners)
Save this as `icons/icon.svg`. It is only the source for the PNGs.
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect width="180" height="180" fill="#FFD66B"/>
  <circle cx="90" cy="98" r="78" fill="#FFE7A3"/>
  <circle cx="90" cy="98" r="56" fill="#E8A96B"/>
  <ellipse cx="111" cy="88" rx="17" ry="16" fill="#D08A50"/>
  <circle cx="68"  cy="90" r="8.5" fill="#3B2A20"/>
  <circle cx="112" cy="90" r="8.5" fill="#3B2A20"/>
  <circle cx="71"  cy="87" r="3"   fill="#fff"/>
  <circle cx="115" cy="87" r="3"   fill="#fff"/>
  <ellipse cx="90" cy="120" rx="30" ry="22" fill="#FFF3E0"/>
  <circle cx="58"  cy="114" r="8" fill="#FF9AA2" opacity=".6"/>
  <circle cx="122" cy="114" r="8" fill="#FF9AA2" opacity=".6"/>
  <path d="M84 123 Q90 137 96 123 Z" fill="#FF7A8A"/>
  <ellipse cx="90" cy="109" rx="10" ry="7" fill="#3B2A20"/>
  <path d="M90 116 V120 M90 120 Q83 127 77 121 M90 120 Q97 127 103 121" fill="none" stroke="#3B2A20" stroke-width="3.5" stroke-linecap="round"/>
  <ellipse cx="38"  cy="96" rx="16" ry="32" fill="#B8733F" transform="rotate(18 38 96)"/>
  <ellipse cx="142" cy="96" rx="16" ry="32" fill="#B8733F" transform="rotate(-18 142 96)"/>
</svg>
```

### 9.2 PNGs (generate once, commit to the repo)
| File | Size | Used by |
|---|---|---|
| `icons/apple-touch-icon.png` | 180×180 | iOS home screen (**required**; iOS ignores SVG here) |
| `icons/icon-192.png` | 192×192 | manifest |
| `icons/icon-512.png` | 512×512 | manifest (`"purpose": "any maskable"`; the face is inside the safe 80% circle) |

SVG→PNG is an **optional tooling step**. Pick one of these:

**A. Generator page** `tools/make-icons.html`. Open it once in desktop Chrome or Safari, then click the three links to save the files. Don't list it in the service worker.
```html
<!doctype html>
<meta charset="utf-8"><title>Make icons</title>
<body style="font-family:system-ui;padding:20px">
<div id="out"></div>
<script>
const SVG = `PASTE THE <svg>…</svg> FROM §9.1 HERE`;
const sizes = [[180,'apple-touch-icon.png'],[192,'icon-192.png'],[512,'icon-512.png']];
const img = new Image();
img.onload = () => {
  for (const [s, name] of sizes) {
    const c = document.createElement('canvas'); c.width = c.height = s;
    c.getContext('2d').drawImage(img, 0, 0, s, s);
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png'); a.download = name;
    a.textContent = `Download ${name} (${s}×${s})`; a.style.cssText = 'display:block;margin:8px 0';
    const preview = new Image(); preview.src = a.href; preview.width = 90;
    document.getElementById('out').append(preview, a);
  }
};
img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SVG);
</script>
```
**B. Headless Chrome.** Wrap the SVG in `icon-180.html` (`<body style="margin:0">` with the SVG at width/height 180), then run:
```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --hide-scrollbars --window-size=180,180 --screenshot=icons/apple-touch-icon.png icon-180.html
```
Repeat at 192 and 512 (change the SVG width/height and `--window-size`).

### 9.3 Manifest (visual fields)
```json
"name": "Plank Pals", "short_name": "Plank Pals",
"start_url": "./", "scope": "./",
"display": "standalone", "orientation": "portrait",
"background_color": "#FFF7EC", "theme_color": "#FFF7EC",
"icons": [
  { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
]
```

### 9.4 Splash
**Skip `apple-touch-startup-image`**: it needs one exact PNG per device, which is fragile. Use an **in-app splash** instead. The first paint is `#splash`, a full-screen `--bg` with Pup (the stored stage, `data-mood="jump"`) and 🐾. It fades out 600 ms after `DOMContentLoaded`. Because `body` is cream from the first CSS byte, the app never flashes white. On first launch, the splash hands over to Setup (§4.1), and it shows 🐾 only, because Pup hasn't been "met" yet.
```css
#splash { position: fixed; inset: 0; z-index: 100; background: var(--bg); display: grid; place-items: center;
          transition: opacity var(--dur-base) var(--ease-out); }
#splash.is-gone { opacity: 0; pointer-events: none; }
```
```js
setTimeout(() => { const s = document.getElementById('splash'); s.classList.add('is-gone'); setTimeout(() => s.remove(), 300); }, 600);
```

---

## 10. Builder checklist (design)
- [ ] The `:root` from §2.2 is pasted verbatim, `body` has an explicit `--bg`, and the meta tags from §3.1 use `viewport-fit=cover`.
- [ ] Plank is always green and on the left; Squats is always purple and on the right. Each has a ✅ when done today, and the other gets a 🎁 glow.
- [ ] Every child target is ≥ 64 px. On Plank and Squats, the whole screen below the top bar is the stop target.
- [ ] Pup comes from `#pup-tpl` (front) and `#pup-plank-tpl` (side), driven only by `data-stage` (1–6) and `data-mood`.
- [ ] The squat animation starts at the squat clock's t0 (`startSquatAnimation`, the same `beatMs`), and it survives reduced motion.
- [ ] The Squats count and ring are readable from 2 m (160 px digits, Pup ≈ 55% of the height).
- [ ] Rings use `setupRing()`, with 🦴 at 12 o'clock and a blue → green → gold background.
- [ ] Sticker data comes from `catalog.js` and the visuals from `PAGES`/`SHAPES`/`rotFor`. The stored value is the page-prefixed id. Locked stickers show a silhouette + "?", PB stickers get `.is-gold`, and Book 2 uses `.book-2`.
- [ ] The 3-card pick never reveals the unpicked cards.
- [ ] The only image files are the 3 icon PNGs. The child's name is never in code, and all URLs are relative.
- [ ] No red, no ✗, no "fail" styling anywhere in the child UI.
