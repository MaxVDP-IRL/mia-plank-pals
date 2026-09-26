// Sticker and rosette elements (01 §6.2–6.3). Data comes from catalog.js; stored ids stay page-prefixed.
import { STICKER_EMOJI, stickerLook } from '../catalog.js';
import { el } from './dom.js';

export function stickerEl(id, { gold = false, locked = false, size = null } = {}) {
  const look = stickerLook(id);
  const style = { '--c': `var(${look.bg})`, '--r': `${look.rot}deg` };
  if (size) style['--size'] = size + 'px';
  const cls = ['sticker', `sticker--${look.shape}`];
  if (locked) cls.push('is-locked');
  if (gold && !locked) cls.push('is-gold');
  return el('div', { class: cls.join(' '), style }, el('span', {}, STICKER_EMOJI[id] || '⭐'), locked ? el('b', {}, '?') : null);
}
export function rosetteEl(days, { locked = false, big = false } = {}) {
  return el('div', { class: 'rosette' + (locked ? ' is-locked' : '') + (big ? ' rosette--big' : '') },
    el('span', { class: 'r-paw' }, '🐾'), el('span', { class: 'r-num' }, String(days)));
}
