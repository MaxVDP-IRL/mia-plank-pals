# Build decisions

Choices made during the build where the plan was silent, ambiguous, or needed a small fix. Newest at the bottom.

| # | Where | Decision | Why |
|---|---|---|---|
| 1 | PLAN §5.6 | Shipped straight to **v1.1.0** (plank + squats together) instead of a separate plank-only v1.0.0. | Dad asked for the full version in one go. `APP_VERSION` and `sw.js VERSION` are both `1.1.0`. |
| 2 | Plank & Squats screens | The 🏠 and ❓ buttons are **hidden while the exercise is running**. | The whole screen is the stop area. A slap near the top could otherwise hit 🏠 and throw the plank away. |
| 3 | `js/ui/exercise.js` (new) | The tips → countdown → phase logic shared by both exercise screens lives in one module. | Avoids two copies of the same countdown and tip-card code. Added to `ASSETS`. |
| 4 | `js/ui/stickerArt.js` (new) | Sticker and rosette elements built in one place, used by Celebrate and the Sticker Book. | Same look everywhere. Added to `ASSETS`. |
| 5 | Squats speech | A spoken count carries its helper words in the same utterance ("Four! One more!"). When counting is tone-only, the helper lines are spoken at the rep instead. | `say()` cancels whatever is speaking, so separate utterances 200 ms apart would cut each other off. |
| 6 | Squats midway lines | The "Sit on the chair!" style lines during squats are **not** spoken in v1. | With a count every 2.5 s there is no gap to say them without talking over the count. The form-tip cards cover the same ground. |
| 7 | First squat ever | The squat tip cards start with an extra card: "Put the phone where {name} can see {pup}!" | 03 §1 asks for this tip on first use. |
| 8 | Squats Pup size | On the Squats screen (and the running Plank screen) Pup shrinks only half as much by stage as elsewhere. | At stage 1 the normal scale made him ~200 px, too small to copy from 2 m. |
| 9 | Home pictures | The Plank/Squats button pictures and the Setup row pictures show Pup at his **current** stage. | Showing the stage-6 cape and medal on day 1 would spoil the surprise. |
| 10 | `storage.js normSession` | Output key order is `id, exercise, date, …`, matching `applySession`. | Makes a save → load round trip byte-identical (the storage and backup tests compare JSON). |
| 11 | `gate.js checkGateAnswer` | An empty answer is always wrong. | `Number('')` is `0`; defensive only (the answer is never 0). |
| 12 | Celebrate | A "New 🦴 12s" note appears when the goal went up. It is shown, not spoken. | 02 §4.6 says only raises are announced; a quiet note keeps the celebration about her effort. |
| 13 | Celebrate big moment | The overlay's ✅ (or a tap anywhere) appears 1.5 s after the scene finishes, then the normal 🔁/🏠 buttons show. | 01 §4.5 says a big moment "ends with 🏠"; ✅ keeps "One more try?" reachable afterwards. |
| 14 | `stats.js dadStats` | Also returns `thisWeek` and per-exercise `month` counts. | Parent Corner rows in 03 §7 need them. |
| 15 | Home greeting | When the child has rested (main + one more try) without the other exercise, Pup says "See you tomorrow" once the one gentle offer has already been made. | Matches 03 §4 "Pup rests happily". |
