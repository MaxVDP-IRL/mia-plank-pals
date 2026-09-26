import { AUDIO } from '../config.js';
let ctx = null;
let enabled = true;
export const setSoundEnabled = (on) => { enabled = on; };
export const audioState = () => (ctx ? ctx.state : 'none');

/** Call inside a user gesture (click/touchend). Safe to call on every tap. */
export function unlockAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try {
    if (!ctx) ctx = new AC();
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    const b = ctx.createBuffer(1, 1, 22050);                 // 1-sample silent buffer: fully unlocks older iOS
    const src = ctx.createBufferSource(); src.buffer = b; src.connect(ctx.destination); src.start(0);
  } catch (e) { console.warn('audio unlock failed', e); }
}
function tone(freq, at, dur, type = 'sine', gain = 1) {
  const t0 = ctx.currentTime + at;
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t0);
  const peak = AUDIO.masterGain * gain;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.05);
}
function play(fn) {
  if (!enabled || !ctx) return;
  if (ctx.state !== 'running') { ctx.resume().catch(() => {}); }
  try { fn(); } catch (e) { console.warn('sound failed', e); }
}
export const sounds = {
  tick:    () => play(() => tone(660, 0, 0.12, 'triangle')),
  go:      () => play(() => { tone(880, 0, 0.18, 'triangle'); tone(1320, 0.12, 0.25, 'triangle'); }),
  boop:    () => play(() => tone(330, 0, 0.14, 'sine', 0.7)),              // plank 5 s boop / squat "down"
  up:      () => play(() => tone(784, 0, 0.16, 'triangle')),               // squat rep completed ("up")
  stop:    () => play(() => tone(523, 0, 0.15, 'sine')),
  tap:     () => play(() => tone(700, 0, 0.07, 'triangle', 0.5)),         // button press feedback
  chime:   () => play(() => [1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.09, 0.35, 'sine'))),
  fanfare: () => play(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, i === 3 ? 0.6 : 0.2, 'square', 0.5))),
  sticker: () => play(() => [1568, 2093, 2637].forEach((f, i) => tone(f, i * 0.06, 0.2, 'sine', 0.6))),
  drumroll:() => play(() => { for (let i = 0; i < 14; i++) tone(140 + (i % 2) * 20, i * 0.07, 0.06, 'triangle', 0.6); }),
  grow:    () => play(() => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.3, 'triangle'))),
  soft:    () => play(() => tone(587, 0, 0.3, 'sine', 0.6)),               // tier 0 "did it" chime
};
