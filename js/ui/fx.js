// Confetti and floating emoji (01 §6.5). Pure CSS + JS, no library.
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const PARTY = ['#FFC83D', '#FF9AA2', '#5EC8F2', '#1F9D5B', '#8A4FC7', '#FF8A5B'];
export const GOLD  = ['#FFC83D', '#FFE08A', '#E0A200', '#FFFFFF'];

function fxLayer(ms) {
  const l = document.createElement('div'); l.className = 'fx-layer';
  document.body.appendChild(l); setTimeout(() => l.remove(), ms); return l;
}

export function confettiBurst(count = 80, colors = PARTY) {
  if (reduceMotion()) return;
  const layer = fxLayer(3500);
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    p.className = 'confetti' + (i % 3 === 0 ? ' round' : '');
    p.style.setProperty('--x', Math.random() * 100 + 'vw');
    p.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
    p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    p.style.setProperty('--delay', Math.random() * 300 + 'ms');
    p.style.setProperty('--dur', 1600 + Math.random() * 1200 + 'ms');
    p.style.background = colors[i % colors.length];
    layer.appendChild(p);
  }
}

export function emojiFloat(emoji = '❤️', count = 10) {
  if (reduceMotion()) return;
  const layer = fxLayer(3200);
  for (let i = 0; i < count; i++) {
    const e = document.createElement('span');
    e.className = 'float-emoji'; e.textContent = emoji;
    e.style.setProperty('--x', 10 + Math.random() * 80 + 'vw');
    e.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    e.style.setProperty('--delay', Math.random() * 600 + 'ms');
    e.style.setProperty('--dur', 1800 + Math.random() * 800 + 'ms');
    e.style.setProperty('--fs', 24 + Math.random() * 20 + 'px');
    layer.appendChild(e);
  }
}
