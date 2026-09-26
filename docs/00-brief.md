# Project Brief — Mia's Plank App

## Who & why
- **User:** Mia, age 6. Early/pre-reader, so the app must work mostly through pictures, icons, sound and big buttons.
- **Goal:** Mia wants to plank **every day** and **get better** (hold longer). Dad (the requester) wants to track her progress.
- **Builder:** The final build plan will be handed to a *weaker coding model (Claude Sonnet)*. The plan must be explicit, step-by-step, low-ambiguity, and use simple, well-known tech.

## Decisions already made (by Dad + Mia)
| Topic | Decision |
|---|---|
| Device | **Dad's iPhone 13 mini** (iOS Safari, 375×812 CSS px viewport, notch + home indicator safe areas). Phone likely placed on the floor next to Mia during the plank, or held by Dad. |
| Theme | **🐶 Animal friends**: a cute pet companion |
| Rewards (Mia's picks) | **⭐ Stickers to collect** (sticker book) **and 🐣 a pet that grows** (gets bigger / learns tricks as she keeps planking) |
| Timer | **Stopwatch + goal**: tap Start, tap Stop when she drops; app records time, cheers when she beats her goal or personal best. Goal grows gradually. |

## Constraints / defaults
- Deliver as a **Progressive Web App** (installable to iPhone home screen, works offline). No App Store, no accounts, no backend.
- Data stored **on-device** (localStorage). A single child profile (Mia) is fine.
- Needs a simple way to host over HTTPS so the iPhone can load/install it (e.g. GitHub Pages or Netlify Drop).
- Child safety: no ads, no external links for the child, no data leaves the phone, no in-app purchases.
- Healthy framing: age-appropriate planking (short holds, a few seconds up to ~60s max is plenty for a 6-year-old). Encourage consistency and effort, never shame a missed day or a shorter time.

## Shared vocabulary (use these names so the docs line up)
Screens: **Home**, **Plank** (timer), **Celebrate** (reward reveal), **Sticker Book**, **Progress** (for Dad and Mia), **Parent Corner** (behind a grown-up gate).
Pet: working name **"Pup"**. Mia can rename it (the Usability agent should propose how).

## Deliverables folder
All specialist docs go in `docs/`. The final consolidated build plan will be `PLAN.md` at the project root.
