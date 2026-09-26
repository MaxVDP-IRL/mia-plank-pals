// js/main.js — boot order (02 §7.3 + §9.4).
import { initStore, getState, app } from './store.js';
import { startRouter, registerScreen, currentRoute, setOnEnterHome } from './router.js';
import { setSoundEnabled, unlockAudio } from './platform/audio.js';
import { initSpeech, setSpeechEnabled, unlockSpeech } from './platform/speech.js';
import { requestPersistence, isLocalDev } from './platform/device.js';
import { mountPup, stageNumForXp } from './ui/pup.js';
import setup from './screens/setup.js';
import meet from './screens/meet.js';
import home from './screens/home.js';
import plank from './screens/plank.js';
import squats from './screens/squats.js';
import celebrate from './screens/celebrate.js';
import stickers from './screens/stickers.js';
import progress from './screens/progress.js';
import parent from './screens/parent.js';

function showBanner(text) {
  const b = document.getElementById('banner');
  b.replaceChildren(document.createTextNode(text));
  const x = document.createElement('button');
  x.type = 'button'; x.textContent = '✕'; x.setAttribute('aria-label', 'Close');
  x.addEventListener('click', () => { b.hidden = true; });
  b.appendChild(x);
  b.hidden = false;
}

const { status } = initStore();
const st = getState();
setSoundEnabled(st.settings.soundOn);
setSpeechEnabled(st.settings.speechOn);
initSpeech();
const unlockAll = () => { unlockAudio(); unlockSpeech(); };
document.addEventListener('touchend', unlockAll, { passive: true });
document.addEventListener('click', unlockAll);
document.addEventListener('storage-failed', () => showBanner('Could not save! Export a backup in Parent Corner.'));
if (status === 'corrupt' || status === 'newer') showBanner('Saved data could not be read. A copy was kept. Restore a backup in Parent Corner.');
if (status === 'unavailable') showBanner('This browser cannot save progress (Private Browsing?).');

// Splash: Pup (once met) or just a paw
const splash = document.getElementById('splash');
if (st.meta.metPup) {
  const wrap = document.createElement('div');
  wrap.className = 'pup-wrap'; wrap.style.setProperty('--pup-size', '220px');
  splash.replaceChildren(wrap);
  mountPup(wrap, stageNumForXp(st.pet.xp), 'jump');
}

[setup, meet, home, plank, squats, celebrate, stickers, progress, parent].forEach((s) => {
  s.mount(document.getElementById('screen-' + s.id));
  registerScreen(s.id, s);
});
startRouter(st.meta.onboarded ? (st.meta.metPup ? 'home' : 'meet') : 'setup');
requestPersistence();
registerServiceWorker();
setTimeout(() => { splash.classList.add('is-gone'); setTimeout(() => splash.remove(), 300); }, 600);

// ---------- Service worker + update strategy (02 §9.4) ----------
function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || isLocalDev()) return;   // no SW on localhost (add ?sw to test it)
  navigator.serviceWorker.register('./sw.js', { scope: './' }).then((reg) => {
    // iOS standalone apps rarely check for updates on their own: check every time the app comes to the front.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(() => {});
    });
  }).catch((e) => console.warn('SW registration failed', e));

  let hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) { hadController = true; return; }         // first install: nothing to reload
    app.updateReady = true;
    maybeReloadForUpdate();
  });
  setOnEnterHome(maybeReloadForUpdate);
}
let reloading = false;
function maybeReloadForUpdate() {
  // Never reload mid-exercise or mid-celebration: only when Home is showing.
  if (app.updateReady && currentRoute() === 'home' && !reloading) { reloading = true; location.reload(); }
}
