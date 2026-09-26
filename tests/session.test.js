import { test, eq, ok } from './harness.js';
import { applySession, canTryExtra, exerciseDayState, attemptKindFor } from '../js/logic/session.js';
import { defaultState } from '../js/storage.js';

const rng = () => 0.42;
const at = (d, h = 9) => { const [y, m, dd] = d.split('-').map(Number); return new Date(y, m - 1, dd, h, 0); };
const plank = (ms) => ({ exercise: 'plank', durationMs: ms, autoFinished: false });
const squat = (reps, counted = reps) => ({ exercise: 'squat', reps, countedReps: counted, beatMs: 2500, elapsedMs: reps * 2500 });
const fresh = () => { const s = defaultState('2026-09-01T00:00:00.000Z'); s.settings.childName = 'TestKid'; s.meta.onboarded = true; s.meta.metPup = true; return s; };

test('session: first plank of the day → sticker offer, main, 10 treats', () => {
  const { state, result } = applySession(fresh(), plank(8000), at('2026-09-26'), rng);
  eq(result.attempt, 'main');
  ok(result.stickerOffer && result.stickerOffer.choices.length === 3, 'offer');
  eq(result.xpGained, 10);
  eq(result.firstEver, true); eq(result.beatBest, false); eq(result.tier, 0);
  eq(state.sessions.length, 1); eq(state.sessions[0].date, '2026-09-26');
});
test('session: second plank same day → extra, no offer, +3 treats', () => {
  let s = applySession(fresh(), plank(8000), at('2026-09-26'), rng).state;
  const { result } = applySession(s, plank(7000), at('2026-09-26', 10), rng);
  eq(result.attempt, 'extra'); eq(result.stickerOffer, null); eq(result.xpGained, 3); eq(result.canTryExtra, false);
});
test('session: a squat after a plank same day → doubleDay, 10 treats (+goal)', () => {
  let s = applySession(fresh(), plank(8000), at('2026-09-26'), rng).state;
  const r = applySession(s, squat(4), at('2026-09-26', 10), rng).result;
  eq(r.doubleDay, true); eq(r.xpGained, 10); eq(r.stickerOffer, null);
  const r2 = applySession(s, squat(5), at('2026-09-26', 10), rng).result;
  eq(r2.xpGained, 15, 'goal met adds 5');
});
test('session: squat first → offer; plank later → no offer, double day', () => {
  let s = applySession(fresh(), squat(3), at('2026-09-26'), rng).state;
  ok(s.pendingStickerPick, 'pending pick after squat');
  const r = applySession(s, plank(4000), at('2026-09-26', 11), rng).result;
  eq(r.stickerOffer, null); eq(r.doubleDay, true);
});
test('session: PB on the second exercise upgrades a pending or claimed sticker to gold', () => {
  let s = applySession(fresh(), plank(8000), at('2026-09-25'), rng).state;       // prior best 8 s
  s.pendingStickerPick = null;
  s = applySession(s, squat(5), at('2026-09-26'), rng).state;                    // today: pending pick
  const r = applySession(s, plank(9000), at('2026-09-26', 10), rng);
  eq(r.result.stickerUpgraded, true); eq(r.state.pendingStickerPick.gold, true);
  // claimed variant
  const s2 = structuredClone(s);
  s2.stickers.push({ id: s2.pendingStickerPick.choices[0], book: 1, date: '2026-09-26', gold: false });
  s2.pendingStickerPick = null;
  const r2 = applySession(s2, plank(9000), at('2026-09-26', 10), rng);
  eq(r2.state.stickers.find((x) => x.date === '2026-09-26').gold, true);
});
test('session: PB in squats gives tier 2 and beatBest', () => {
  let s = applySession(fresh(), squat(5), at('2026-09-25'), rng).state;
  const r = applySession(s, squat(7), at('2026-09-26'), rng).result;
  eq(r.beatBest, true); eq(r.tier, 2); eq(r.stickerOffer.gold, true);
});
test('session: goal moves only on main attempts', () => {
  let s = fresh();
  for (const d of ['2026-09-20', '2026-09-21']) s = applySession(s, plank(11000), at(d), rng).state;
  s = applySession(s, plank(11000), at('2026-09-22'), rng).state;             // 3rd main hit → 12 s
  eq(s.settings.goals.plank.current, 12000);
  const before = s.goalProgress.plank.hits;
  s = applySession(s, plank(13000), at('2026-09-22', 12), rng).state;         // extra
  eq(s.goalProgress.plank.hits, before, 'extra does not count');
});
test('session: squat goal 5 → 6 after 3 main hits', () => {
  let s = fresh();
  for (const d of ['2026-09-20', '2026-09-21', '2026-09-22']) s = applySession(s, squat(5), at(d), rng).state;
  eq(s.settings.goals.squat.current, 6);
});
test('session: milestone at the 7th distinct day', () => {
  let s = fresh();
  for (let i = 1; i <= 6; i++) s = applySession(s, plank(5000), at(`2026-09-0${i}`), rng).state;
  const r = applySession(s, squat(3), at('2026-09-07'), rng);
  eq(r.result.newMilestones, ['days-7']);
  ok(r.result.bigMoments.some((m) => m.type === 'milestone'), 'milestone big moment');
});
test('session: an old unclaimed pick gets auto-claimed on a new day', () => {
  let s = applySession(fresh(), plank(5000), at('2026-09-25'), rng).state;
  const oldChoice = s.pendingStickerPick.choices[0];
  const r = applySession(s, plank(5000), at('2026-09-26'), rng);
  ok(r.state.stickers.some((x) => x.id === oldChoice && x.date === '2026-09-25'), 'old sticker kept');
  eq(r.state.pendingStickerPick.date, '2026-09-26');
});
test('session: stage-up big moment at 80 treats', () => {
  const s = fresh(); s.pet.xp = 75;
  const r = applySession(s, plank(5000), at('2026-09-26'), rng).result;
  eq(r.grew, true); eq(r.stageAfter.index, 1);
  ok(r.bigMoments.some((m) => m.type === 'stageUp'));
});
test('session: input state is not mutated', () => {
  const s = fresh();
  const snap = JSON.stringify(s);
  applySession(s, plank(12000), at('2026-09-26'), rng);
  applySession(s, squat(6), at('2026-09-26'), rng);
  eq(JSON.stringify(s), snap);
});
test('session: helpers', () => {
  const S = [{ exercise: 'plank', date: '2026-09-26' }];
  eq(attemptKindFor(S, 'plank', '2026-09-26'), 'extra');
  eq(attemptKindFor(S, 'squat', '2026-09-26'), 'main');
  eq(canTryExtra(S, 'plank', '2026-09-26'), true);
  eq(exerciseDayState(S, 'plank', '2026-09-26'), 'done');
  eq(exerciseDayState([...S, ...S], 'plank', '2026-09-26'), 'rested');
  eq(exerciseDayState(S, 'squat', '2026-09-26'), 'fresh');
});
