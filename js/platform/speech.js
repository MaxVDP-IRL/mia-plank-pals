import { SPEECH } from '../config.js';
export const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let voice = null, enabled = true, unlocked = false;
export const setSpeechEnabled = (on) => { enabled = on; if (!on && speechSupported) speechSynthesis.cancel(); };
export const isSpeechUnlocked = () => unlocked;

function pickVoice() {
  const vs = speechSynthesis.getVoices();
  voice = SPEECH.preferredVoices.map((n) => vs.find((v) => v.name.includes(n) && v.lang.startsWith('en'))).find(Boolean)
       || vs.find((v) => v.lang === SPEECH.lang) || vs.find((v) => v.lang.startsWith('en')) || null;
}
export function initSpeech() {
  if (!speechSupported) return;
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);  // voices load async
}
/** Call inside a user gesture once (Start / Test sound). */
export function unlockSpeech() {
  if (!speechSupported || unlocked) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  speechSynthesis.speak(u);
  unlocked = true;
}
export function say(text) {
  if (!enabled || !speechSupported || !text) return;
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang || SPEECH.lang;
  u.rate = SPEECH.rate; u.pitch = SPEECH.pitch; u.volume = 1;
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel();
    setTimeout(() => speechSynthesis.speak(u), 60);   // iOS sometimes swallows a speak() right after cancel()
  } else {
    speechSynthesis.speak(u);
  }
}
export function stopSpeech() { if (speechSupported) speechSynthesis.cancel(); }
