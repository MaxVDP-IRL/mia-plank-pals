const ROUTES = ['setup', 'meet', 'home', 'plank', 'squats', 'celebrate', 'stickers', 'progress', 'parent'];
const registry = {};
let current = null;
let onEnterHome = null;
export const setOnEnterHome = (fn) => { onEnterHome = fn; };   // used for the update reload (§9.4)

export function registerScreen(id, mod) { registry[id] = mod; }
export function currentRoute() { return current; }
export function go(id, { replace = false } = {}) {
  const hash = '#/' + id;
  if (location.hash === hash) { render(); return; }
  if (replace) location.replace(hash); else location.hash = hash;   // both fire 'hashchange'
}
function parse() {
  const m = location.hash.match(/^#\/([a-z]+)/);
  return m && ROUTES.includes(m[1]) ? m[1] : 'home';
}
function render() {
  const id = parse();
  const mod = registry[id];
  if (mod?.canEnter && mod.canEnter() === false) {
    const fallback = registry.home?.canEnter?.() === false ? (registry.setup?.canEnter?.() !== false ? 'setup' : 'meet') : 'home';
    if (fallback !== id) go(fallback, { replace: true });
    return;
  }
  if (id === current) return;
  if (current) {
    registry[current]?.hide?.();
    document.getElementById('screen-' + current).hidden = true;
  }
  const el = document.getElementById('screen-' + id);
  el.hidden = false;
  el.classList.remove('screen-enter'); void el.offsetWidth; el.classList.add('screen-enter');
  current = id;
  mod?.show?.();
  if (id === 'home' && onEnterHome) onEnterHome();
}
/** Cold start always lands on `startId` (never mid-exercise or on Celebrate). */
export function startRouter(startId) {
  history.replaceState(null, '', '#/' + startId);      // doesn't fire hashchange
  window.addEventListener('hashchange', render);
  render();
}
