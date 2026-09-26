import { test, eq, ok, seqRng } from './harness.js';
import { currentPage, makeStickerOffer, claimSticker, computeXp, stageForXp, crossedShowOff, milestonesDue, pickBigMoment } from '../js/logic/rewards.js';
import { CATALOG } from '../js/catalog.js';
import { defaultState } from '../js/storage.js';

const page0 = CATALOG.pages[0].ids;
const allIds = CATALOG.pages.flatMap((p) => p.ids);
const own = (ids, book = 1) => ids.map((id) => ({ id, book, date: '2026-09-01', gold: false }));

test('rewards: currentPage walks pages then books', () => {
  eq(currentPage([]).pageIndex, 0);
  eq(currentPage(own(page0)).pageIndex, 1);
  const full = own(allIds);
  eq([currentPage(full).book, currentPage(full).pageIndex], [2, 0]);
});
test('rewards: offer has ≤ 3 distinct missing ids from one page', () => {
  const o = makeStickerOffer(own(page0.slice(0, 2)), seqRng([0.1, 0.9, 0.5, 0.3]));
  eq(o.choices.length, 3);
  eq(new Set(o.choices).size, 3);
  ok(o.choices.every((id) => page0.slice(2).includes(id)), 'all from missing on page 0');
});
test('rewards: with 1 missing → 1 choice', () => {
  eq(makeStickerOffer(own(page0.slice(0, 5))).choices, [page0[5]]);
});
function stateWithPick(choices, extra = {}) {
  const s = defaultState();
  Object.assign(s, extra);
  s.pendingStickerPick = { date: '2026-09-26', book: 1, pageIndex: 0, choices, gold: false };
  return s;
}
test('rewards: claimSticker rejects ids not offered', () => {
  const s = stateWithPick([page0[0]]);
  eq(claimSticker(s, page0[1]).claimed, null);
  const r = claimSticker(s, page0[0]);
  eq(r.claimed, page0[0]); eq(r.state.pendingStickerPick, null); eq(r.state.stickers.length, 1);
  eq(s.stickers.length, 0, 'input not mutated');
});
test('rewards: page and book completion flags', () => {
  const r = claimSticker(stateWithPick([page0[5]], { stickers: own(page0.slice(0, 5)) }), page0[5]);
  eq([r.pageCompleted, r.bookCompleted], [true, false]);
  const last = allIds[allIds.length - 1];
  const s2 = stateWithPick([last], { stickers: own(allIds.slice(0, -1)) });
  s2.pendingStickerPick.pageIndex = 5;
  const r2 = claimSticker(s2, last);
  eq([r2.pageCompleted, r2.bookCompleted], [true, true]);
});
test('rewards: prize modes page / twoPages / book', () => {
  const mk = (mode) => { const s = stateWithPick([page0[5]], { stickers: own(page0.slice(0, 5)) }); s.settings.pagePrize.mode = mode; return claimSticker(s, page0[5]); };
  ok(mk('page').prize, 'page mode gives a prize');
  eq(mk('twoPages').prize, null, 'first page with twoPages: no prize');
  eq(mk('book').prize, null);
  eq(mk('off').prize, null);
  eq(mk('page').state.prizes.length, 1);
});
test('rewards: computeXp table', () => {
  const base = { attempt: 'main', extraIndex: 0, firstExerciseOfDay: true, doubleDay: false, beatGoal: false, goalBonusAvailable: true, beatBest: false };
  eq(computeXp(base), 10);
  eq(computeXp({ ...base, firstExerciseOfDay: false, doubleDay: true }), 10);            // 5 + 5
  eq(computeXp({ ...base, beatGoal: true }), 15);
  eq(computeXp({ ...base, beatGoal: true, goalBonusAvailable: false }), 10);
  eq(computeXp({ ...base, beatBest: true }), 15);
  eq(computeXp({ ...base, attempt: 'extra', firstExerciseOfDay: false }), 3);
  eq(computeXp({ ...base, attempt: 'extra', firstExerciseOfDay: false, extraIndex: 1 }), 0);
});
test('rewards: stageForXp boundaries', () => {
  eq(stageForXp(0).index, 0); eq(stageForXp(79).index, 0); eq(stageForXp(80).index, 1);
  eq(stageForXp(949).index, 4); eq(stageForXp(950).index, 5);
  eq(stageForXp(950).progress, 1); eq(stageForXp(40).progress, 0.5);
});
test('rewards: crossedShowOff', () => {
  eq(crossedShowOff(900, 960), false);
  eq(crossedShowOff(1090, 1101), true);
  eq(crossedShowOff(1000, 1010), false);
});
test('rewards: milestonesDue at 7 and 14, no repeats', () => {
  eq(milestonesDue(6, []), []);
  eq(milestonesDue(7, []), ['days-7']);
  eq(milestonesDue(14, [{ id: 'days-7' }]), ['days-14']);
  eq(milestonesDue(14, [{ id: 'days-7' }, { id: 'days-14' }]), []);
});
test('rewards: pickBigMoment priority and queue', () => {
  const r = pickBigMoment([{ type: 'milestone', id: 'days-7' }, { type: 'stageUp', stage: 1 }], []);
  eq(r.show.type, 'stageUp'); eq(r.queue.map((m) => m.type), ['milestone']);
  const r2 = pickBigMoment([], r.queue);
  eq(r2.show.type, 'milestone'); eq(r2.queue, []);
  eq(pickBigMoment([], []).show, null);
});
