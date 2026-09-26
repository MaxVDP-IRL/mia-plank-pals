import { test, eq, ok } from './harness.js';
import { loadState, saveState, normalize, defaultState, createMemoryStore, migrate } from '../js/storage.js';
import { STORAGE_KEY } from '../js/config.js';

test('storage: missing key → new', () => {
  eq(loadState(createMemoryStore()).status, 'new');
});
test('storage: bad JSON → corrupt + quarantine key', () => {
  const store = createMemoryStore({ [STORAGE_KEY]: '{bad json' });
  const r = loadState(store);
  eq(r.status, 'corrupt');
  ok(store.keys().some((k) => k.startsWith(STORAGE_KEY + '.quarantine.')), 'quarantine key');
});
test('storage: unversioned object migrates to v1', () => {
  const store = createMemoryStore({ [STORAGE_KEY]: JSON.stringify({ sessions: [{ date: '2026-09-26', durationMs: 5000 }] }) });
  const r = loadState(store);
  eq(r.status, 'ok'); eq(r.state.schemaVersion, 1); eq(r.state.sessions[0].exercise, 'plank');
});
test('storage: schemaVersion 99 → newer', () => {
  const store = createMemoryStore({ [STORAGE_KEY]: JSON.stringify({ schemaVersion: 99, sessions: [] }) });
  eq(loadState(store).status, 'newer');
});
test('storage: normalize clamps goals to caps and drops invalid sessions', () => {
  const n = normalize({ settings: { plank: { capMs: 30000 }, goals: { plank: { current: 90000 }, squat: { current: 1 } } },
    sessions: [{ date: 'nope', durationMs: 1 }, { date: '2026-09-26', durationMs: -5 }, { date: '2026-09-26', exercise: 'squat', reps: 4 }] });
  eq(n.settings.goals.plank.current, 30000);
  eq(n.settings.goals.squat.current, 3);
  eq(n.sessions.length, 1); eq(n.sessions[0].reps, 4);
});
test('storage: save/load roundtrip is identical', () => {
  const store = createMemoryStore();
  const s = defaultState('2026-09-26T00:00:00.000Z');
  s.settings.childName = 'TestKid'; s.pet.xp = 42;
  s.sessions.push({ id: 'a', exercise: 'plank', date: '2026-09-26', startedAt: null, attempt: 'main', durationMs: 11000, goalMs: 10000, beatGoal: true, beatBest: false, autoFinished: false });
  ok(saveState(s, store));
  eq(loadState(store).state, s);
});
test('storage: saveState returns false when setItem throws', () => {
  const bad = { getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); }, removeItem: () => {} };
  eq(saveState(defaultState(), bad), false);
});
test('storage: migrate rejects non-objects', () => {
  let threw = false; try { migrate([]); } catch { threw = true; }
  ok(threw);
});
