import { test, eq, ok } from './harness.js';
import { LINES, fill, pickLine, numberWord } from '../js/strings.js';

const REQUIRED = ['homeHello', 'homeReturning', 'homeDoneForToday', 'offerOtherSquats', 'offerOtherPlank', 'tapPup',
  'stickerPick', 'stickerReveal', 'oneMoreTry', 'doubleDay', 'stageUp', 'capReached', 'go', 'plankCountdownIntro',
  'plankMidway', 'plankNearGoal', 'plankGoalLive', 'plankGoal', 'plankBestLive', 'plankBest', 'plankBelowGoal',
  'squatCountdownIntro', 'squatMidway', 'squatTwoMore', 'squatOneMore', 'squatGoalLive', 'squatGoal', 'squatBest',
  'squatBelowGoal', 'countCheck', 'formTipPlank', 'formTipSquat', 'setupTestSound', 'meetBasket', 'meetHello', 'meetNamed'];

test('strings: every required category exists and is non-empty', () => {
  for (const k of REQUIRED) ok(Array.isArray(LINES[k]) && LINES[k].length > 0, 'missing ' + k);
});
test('strings: fill replaces placeholders', () => {
  eq(fill('Hi {name}! I am {pup}. {n}!', { name: 'TestKid', pup: 'Biscuit', n: 7 }), 'Hi TestKid! I am Biscuit. 7!');
  eq(fill('{missing}!', {}), '!');
});
test('strings: pickLine never repeats the same line twice in a row', () => {
  let prev = null;
  for (let i = 0; i < 50; i++) {
    const t = pickLine('plankMidway', { name: 'X' }, () => 0.1);
    ok(t !== prev, 'repeat: ' + t); prev = t;
  }
});
test('strings: numberWord', () => {
  eq(numberWord(1), 'One!'); eq(numberWord(20), 'Twenty!'); eq(numberWord(31), '31!');
});
test('strings: no banned words in child copy', () => {
  const banned = /\b(failed|too short|you missed|you lost|try harder)\b/i;
  for (const [k, list] of Object.entries(LINES)) for (const l of list) ok(!banned.test(l), `${k}: ${l}`);
});
