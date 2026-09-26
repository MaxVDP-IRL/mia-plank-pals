// Tiny DOM helpers. Never put user data in innerHTML: el() uses textContent for strings.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** el('button', { class: 'btn', onclick: fn, 'aria-label': 'Go', style: {...}, dataset: {...} }, 'text', childNode) */
export function el(tag, props = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'style' && typeof v === 'object') for (const [sk, sv] of Object.entries(v)) {
      if (sk.startsWith('--')) n.style.setProperty(sk, sv); else n.style[sk] = sv;
    }
    else if (k === 'dataset') Object.assign(n.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else if (v === true) n.setAttribute(k, '');
    else n.setAttribute(k, String(v));
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    n.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return n;
}
export function clear(node) { node.replaceChildren(); return node; }
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export function retrigger(elm, cls) { elm.classList.remove(cls); void elm.offsetWidth; elm.classList.add(cls); }

/** Bind a tap handler that also fires a small press sound (sound module passed in to avoid a cycle). */
export function onTap(node, fn) { node.addEventListener('click', fn); return node; }
