import { test, eq, ok } from './harness.js';
import meet from '../js/screens/meet.js';
import { initStore, getState, setState } from '../js/store.js';
import { defaultState } from '../js/storage.js';
import { STORAGE_KEY } from '../js/config.js';
import { setSoundEnabled } from '../js/platform/audio.js';
import { setSpeechEnabled } from '../js/platform/speech.js';

function snapshotStorage() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_KEY)) data[k] = localStorage.getItem(k);
  }
  return data;
}
function restoreStorage(data) {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
  for (const k of keys) if (k && k.startsWith(STORAGE_KEY)) localStorage.removeItem(k);
  for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v);
}
function waitFor(fn, ms = 8000) {
  const t0 = performance.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      let ready = false;
      try { ready = !!fn(); }
      catch (e) { reject(e); return; }
      if (ready) resolve();
      else if (performance.now() - t0 > ms) reject(new Error('timed out'));
      else setTimeout(tick, 40);
    };
    tick();
  });
}

test('meet: tapping a name asks yes or no, and only yes saves it', async () => {
  const saved = snapshotStorage();
  const prevUrl = location.pathname + location.search + location.hash;
  let section = null;
  let tpl = null;
  setSoundEnabled(false);
  setSpeechEnabled(false);
  try {
    const html = await (await fetch('./index.html', { cache: 'no-store' })).text();
    ok(!html.includes('id="meet-ok"'), 'bottom tick button is gone');
    ok(html.includes('id="meet-ask"'), 'confirm popup is in the page');

    const doc = new DOMParser().parseFromString(html, 'text/html');
    tpl = document.importNode(doc.getElementById('pup-tpl'), true);
    section = document.importNode(doc.getElementById('screen-meet'), true);
    document.body.append(tpl, section);
    section.hidden = false;

    initStore();
    const s = defaultState();
    s.meta.onboarded = true;
    s.meta.metPup = false;
    s.settings.childName = 'TestKid';
    s.settings.petName = 'Pup';
    setState(s);

    meet.mount(section);
    meet.show();
    ok(section.querySelector('#meet-ok') === null, 'no tick button on the screen');
    ok(section.querySelector('#meet-ask').hidden, 'popup stays hidden until a name is tapped');

    section.querySelector('#meet-basket').click();
    await waitFor(() => !section.querySelector('#meet-names-phase').hidden);
    const card = (name) => section.querySelector(`.name-card[data-name="${name}"]`);
    ok(card('Biscuit'), 'name cards are showing');

    card('Biscuit').click();
    const ask = section.querySelector('#meet-ask');
    ok(!ask.hidden, 'tapping a name opens the popup');
    eq(section.querySelector('#meet-ask-q').textContent, 'Call me Biscuit?');
    eq(section.querySelector('#meet-ask-emoji').textContent, '🍪');
    ok(section.querySelector('#meet-ask-yes').textContent.includes('Yes'), 'yes button');
    ok(section.querySelector('#meet-ask-no').textContent.includes('No'), 'no button');
    eq(getState().settings.petName, 'Pup');
    eq(getState().meta.metPup, false);

    section.querySelector('#meet-ask-no').click();
    ok(ask.hidden, 'no closes the popup');
    eq(getState().settings.petName, 'Pup', 'cancel does not save a name');
    eq(getState().meta.metPup, false, 'cancel does not finish meeting Pup');
    ok(!section.querySelector('#meet-names-phase').hidden, 'still on the name screen');
    ok([...section.querySelectorAll('.name-card')].every((c) => c.getAttribute('aria-pressed') === 'false'), 'no card stays chosen');

    section.querySelector('#meet-type').click();
    const input = section.querySelector('#meet-type-input');
    input.value = '   ';
    section.querySelector('#meet-type-ok').click();
    ok(ask.hidden, 'a blank typed name does not ask');
    input.value = 'Waffles';
    section.querySelector('#meet-type-ok').click();
    ok(!ask.hidden, 'a typed name asks before saving');
    eq(section.querySelector('#meet-ask-q').textContent, 'Call me Waffles?');
    ask.click();
    ok(ask.hidden, 'tapping outside cancels');
    eq(getState().settings.petName, 'Pup');
    eq(getState().meta.metPup, false);

    card('Sunny').click();
    section.querySelector('#meet-ask-yes').click();
    eq(getState().settings.petName, 'Sunny');
    eq(getState().meta.metPup, true);
    await waitFor(() => location.hash === '#/home');
  } finally {
    section?.remove();
    tpl?.remove();
    restoreStorage(saved);
    history.replaceState(null, '', prevUrl || location.pathname);
  }
});
