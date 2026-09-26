import { test, eq, ok } from './harness.js';
import { makeGateQuestion, checkGateAnswer } from '../js/logic/gate.js';

test('gate: factors are always 3–9', () => {
  for (let i = 0; i < 200; i++) {
    const q = makeGateQuestion(Math.random);
    ok(q.a >= 3 && q.a <= 9 && q.b >= 3 && q.b <= 9, `bad factors ${q.a} ${q.b}`);
    eq(q.answer, q.a * q.b);
  }
});
test('gate: checkGateAnswer trims and parses', () => {
  const q = { a: 6, b: 4, answer: 24 };
  eq(checkGateAnswer(q, ' 24 '), true);
  eq(checkGateAnswer(q, '25'), false);
  eq(checkGateAnswer(q, ''), false);
});
