# 🐶 Plank Pals

A tiny, offline-first web app that helps a 6-year-old build a daily **plank** and **squat** habit. A puppy friend grows through 6 stages, and every exercise day she picks a sticker for her sticker book.

- **Live app:** https://maxvdp-irl.github.io/mia-plank-pals/
- **Status:** v1.1.0: plank and squats, both complete
- **Tests:** https://maxvdp-irl.github.io/mia-plank-pals/tests.html
- **Build plan:** [PLAN.md](PLAN.md). Specialist docs are in [docs/](docs/), and build-time choices are in [docs/DECISIONS.md](docs/DECISIONS.md)

## Install on the iPhone
1. Open the live link in **Safari** (not Chrome).
2. Tap **Share** (the square with an arrow) → **Add to Home Screen** → **Add**.
3. Open it **from the new icon** and do the grown-up setup. Always use the icon from then on, because the Safari tab keeps separate data.
4. Optional: if Parent Corner → Diagnostics says the screen may turn off, set Settings → Display & Brightness → Auto-Lock to 2 minutes or more.

Grown-ups reach **Parent Corner** by pressing and holding the faint 🔒 on Home for 2 seconds, then answering a times-table question. It has stats, charts, settings, and **backup/restore**. Save a backup now and then, because deleting the Home Screen icon deletes the data.

## Tech
Vanilla HTML/CSS/JS (ES modules), no build step, no dependencies. It is a PWA with a service worker, so it works in airplane mode. All data stays on the device in `localStorage`. Nothing is sent anywhere.

Run locally with `py -m http.server 8000`, then open `http://localhost:8000/` (the app) or `/tests.html` (the tests).

**Shipping an update:** bump `APP_VERSION` in `js/config.js` **and** `VERSION` in `sw.js` to the same value, add any new files to `ASSETS` in `sw.js`, make sure `tests.html` is all green, then push. The installed app reloads itself the next time Home is showing.
