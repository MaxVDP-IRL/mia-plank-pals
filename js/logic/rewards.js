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
