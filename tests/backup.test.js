import { test, eq, ok } from './harness.js';
import { makeBackup, parseBackup, backupFilename } from '../js/logic/backup.js';
import { defaultState } from '../js/storage.js';

const sample = () => {
  const s = defaultState('2026-09-01T00:00:00.000Z');
  s.settings.childName = 'TestKid'; s.pet.xp = 30;
  s.sessions = [
    { id: 'a', exercise: 'plank', date: '2026-09-20', startedAt: null, attempt: 'main', durationMs: 11000, goalMs: 10000, beatGoal: true, beatBest: false, autoFinished: false },
    { id: 'b', exercise: 'squat', date: '2026-09-26', startedAt: null, attempt: 'main', reps: 5, goalReps: 5, beatGoal: true, beatBest: false, countedReps: 5, beatMs: 2500 },
  ];
  s.stickers = [{ id: 'garden-snail', book: 1, date: '2026-09-20', gold: false }];
  return s;
};

test('backup: makeBackup → parseBackup roundtrip', () => {
  const s = sample();
  const r = parseBackup(JSON.stringify(makeBackup(s)));
  ok(r.ok); eq(r.state, s);
});
test('backup: raw state accepted', () => {
  ok(parseBackup(JSON.stringify(sample())).ok);
});
test('backup: garbage → ok:false', () => {
  eq(parseBackup('hello').ok, false);
  eq(parseBackup('{"a":1}').ok, false);
  eq(parseBackup(JSON.stringify({ schemaVersion: 99, sessions: [] })).ok, false);
});
test('backup: summary counts', () => {
  const r = parseBackup(JSON.stringify(makeBackup(sample())));
  eq(r.summary, { sessions: 2, stickers: 1, treats: 30, firstDate: '2026-09-20', lastDate: '2026-09-26', childName: 'TestKid', petName: 'Pup' });
});
test('backup: filename uses the local date', () => {
  eq(backupFilename(new Date(2026, 8, 26, 23, 50)), 'plank-pals-backup-2026-09-26.json');
});
