// js/catalog.js — sticker pages, milestone stickers and Pup stages (data only).
import { REWARDS } from './config.js';

// 6 pages × 6 stickers. Store ONLY ids ("garden-sunflower"), never emoji.
// bg = CSS custom property for the sticker background (01 §6.1).
export const STICKER_PAGES = [
  { id: 'garden',  emoji: '🌻', bg: '--st-garden',  stickers: [['sunflower','🌻'],['butterfly','🦋'],['ladybug','🐞'],['rainbow','🌈'],['snail','🐌'],['mushroom','🍄']] },
  { id: 'ocean',   emoji: '🐳', bg: '--st-ocean',   stickers: [['fish','🐠'],['whale','🐳'],['octopus','🐙'],['shell','🐚'],['crab','🦀'],['starfish','⭐']] },
  { id: 'yummy',   emoji: '🍓', bg: '--st-yummy',   stickers: [['strawberry','🍓'],['icecream','🍦'],['cupcake','🧁'],['banana','🍌'],['pizza','🍕'],['watermelon','🍉']] },
  { id: 'sky',     emoji: '🚀', bg: '--st-sky',     stickers: [['moon','🌙'],['star','🌟'],['rocket','🚀'],['cloud','☁️'],['balloon','🎈'],['planet','🪐']] },
  { id: 'jungle',  emoji: '🦁', bg: '--st-jungle',  stickers: [['lion','🦁'],['monkey','🐒'],['parrot','🦜'],['elephant','🐘'],['giraffe','🦒'],['tiger','🐯']] },
  { id: 'sparkle', emoji: '💎', bg: '--st-sparkle', stickers: [['crown','👑'],['unicorn','🦄'],['heart','💖'],['gem','💎'],['wand','🪄'],['trophy','🏆']] },
];
export const CATALOG = {
  pages: STICKER_PAGES.map((p) => ({ id: p.id, ids: p.stickers.map(([n]) => `${p.id}-${n}`) })),
};
export const STICKER_EMOJI = Object.fromEntries(
  STICKER_PAGES.flatMap((p) => p.stickers.map(([n, e]) => [`${p.id}-${n}`, e])));
export const STICKER_NAME = Object.fromEntries(          // spoken: "A butterfly! Into the book!"
  STICKER_PAGES.flatMap((p) => p.stickers.map(([n]) => [`${p.id}-${n}`, n.replace('icecream', 'ice cream')])));

/** Visual info for a sticker id: page background, shape and a small deterministic tilt (01 §6.1). */
const SHAPES = ['circle', 'blob', 'square', 'circle', 'square', 'blob'];
export function stickerLook(id) {
  const pageIdx = STICKER_PAGES.findIndex((p) => id.startsWith(p.id + '-'));
  if (pageIdx < 0) return { bg: '--st-garden', shape: 'circle', rot: 0 };
  const i = CATALOG.pages[pageIdx].ids.indexOf(id);
  return { bg: STICKER_PAGES[pageIdx].bg, shape: SHAPES[i] || 'circle', rot: ((pageIdx * 6 + i) * 37) % 13 - 6 };
}

export const MILESTONE_STICKERS = REWARDS.milestoneDays.map((days) => ({ id: `days-${days}`, days }));

// Pup stages (03 §3.2). index 0..5. Design art uses data-stage = index + 1.
export const PET_STAGES = [
  { id: 'tiny',   name: 'Tiny Pup',   minXp: 0,   trick: 'wag' },
  { id: 'puppy',  name: 'Puppy',      minXp: 80,  trick: 'sit' },
  { id: 'buddy',  name: 'Buddy',      minXp: 200, trick: 'highfive' },
  { id: 'big',    name: 'Big Pup',    minXp: 380, trick: 'spin' },
  { id: 'sporty', name: 'Sporty Pup', minXp: 620, trick: 'jump' },        // "jump squat" = 01's trick-jump
  { id: 'super',  name: 'Super Pup',  minXp: 950, trick: 'flip' },        // "backflip"   = 01's trick-flip
];
// trick names MUST match 01 §5.5 CSS: data-mood = 'trick-' + trick (wag, sit, highfive, spin, jump, flip).
// Art uses data-stage = stageForXp(xp).index + 1 (1–6). Never pass the 0-based index to mountPup().

// Meet Pup name cards (03 §2 Part B)
export const PET_NAMES = [
  { name: 'Pup', emoji: '🐾' }, { name: 'Biscuit', emoji: '🍪' }, { name: 'Sunny', emoji: '☀️' },
  { name: 'Bubbles', emoji: '🫧' }, { name: 'Star', emoji: '⭐' }, { name: 'Noodle', emoji: '🍜' },
];

// Form tips (03 §4)
export const FORM_TIPS = {
  plank: [['🪵', 'Straight like a board!'], ['✋', 'Hands under shoulders.'], ['👀', 'Look at the floor.'], ['🎈', 'Breathe, like a balloon!']],
  squat: [['🦶', 'Feet apart!'], ['🧟', 'Arms out, like a zombie!'], ['🪑', 'Sit back on a chair!'], ['🦒', 'Chest up tall!'], ['⬆️', 'Stand up tall!']],
};
export const FORM_TIP_SIDE = { plank: 'Knee plank is OK too!', squat: 'Use a real chair if you like!' };

// Page prize pictures (03 §3.6)
export const PRIZES = [
  { emoji: '🍦', label: 'Ice cream' }, { emoji: '🏞️', label: 'Park trip' }, { emoji: '🎬', label: 'Movie night' },
  { emoji: '🥞', label: 'Pancake breakfast' }, { emoji: '🎨', label: 'Craft time' }, { emoji: '📚', label: 'New book' },
];
