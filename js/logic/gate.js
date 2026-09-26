import { GATE } from '../config.js';
export function makeGateQuestion(rng = Math.random, G = GATE) {
  const r = () => G.factorMin + Math.floor(rng() * (G.factorMax - G.factorMin + 1));
  const a = r(), b = r();
  return { a, b, answer: a * b, text: `What is ${a} × ${b}?` };
}
export const checkGateAnswer = (q, typed) => {
  const t = String(typed).trim();
  return t !== '' && Number(t) === q.answer;
};
