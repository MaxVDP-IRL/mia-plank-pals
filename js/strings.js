// js/strings.js — every spoken/shown line (03 §5, §4, §2). Placeholders: {name} {pup} {n} {sticker}.
// Never put the child's real name here: it comes from settings at runtime.
export const LINES = {
  // Shared
  homeHello:        ['Hi {name}! Plank or squats?', "Woof! Let's be strong, {name}!", "Exercise time! I'm ready!"],
  homeFirst:        ["Let's do our first exercise together! Plank or squats?"],
  homeReturning:    ["{name}! I missed you! Let's play!", "Yay, you're back! Woof!"],
  homeDoneForToday: ['See you tomorrow, {name}!', 'Great day! Bye bye!'],
  homeDoubleDone:   ['Double day! See you tomorrow!'],
  offerOtherSquats: ['Want to do squats too? Only if you want!'],
  offerOtherPlank:  ['Want to plank too? Only if you want!'],
  tapPup:           ['Hee hee!', 'Woof!', 'Again! Again!'],
  stickerPick:      ['Pick a card!'],
  stickerReveal:    ['A {sticker}! Into the book!'],
  stickerLast:      ['The last one! Page done!'],
  oneMoreTry:       ['One more? Only if you want!'],
  doubleDay:        ['Plank AND squats! Double day!', 'Two paws today! Woof woof!'],
  stageUp:          ["Look! I'm growing! Thank you, {name}!", 'I learned a new trick!'],
  pageFull:         ['Page full! Hooray!'],
  pagePrize:        ['Page full! Show Dad!'],
  bookFull:         ['A whole book! New book!'],
  milestone:        ['{n} exercise days! Wow, {name}!'],
  showOff:          ['Watch this, {name}!'],
  newGoal:          ['New bone! You can do it!'],
  capReached:       ['Wow! Super! Rest now!'],
  go:               ['Go!'],
  tryAgain:         ["Oops! Let's try again!"],
  countIt:          ['Count it?'],
  bestPlankTrophy:  ['Your best plank: {n} seconds!'],
  bestSquatTrophy:  ['Your most squats: {n}!'],
  noTrophyYet:      ["Let's find out!"],
  squatsName:       ['Squats!'],
  plankName:        ['Plank!'],
  squatPropTip:     ['Put the phone where {name} can see {pup}!'],

  // Plank
  plankCountdownIntro: ['Get in your plank!', 'Like a board!'],
  plankMidway:      ["You're doing great, {name}!", 'Breathe! Like a balloon!', 'Strong like a lion!', 'Wow, so steady!'],
  plankNearGoal:    ['Almost at the bone!'],
  plankGoalLive:    ['You did it! You got the bone!', '{name}, you reached the bone!'],
  plankGoal:        ['You did it! You got the bone!', '{name}, you reached the bone!'],
  plankBestLive:    ['New record!'],
  plankBest:        ['NEW RECORD! {n} seconds!', 'Your best plank ever!'],
  plankBelowGoal:   ['Good job, {name}! You tried!', 'Nice plank! So strong!', 'Every plank makes you stronger!'],

  // Squats
  squatCountdownIntro: ['Stand up tall! Feet apart!', 'Copy me, {name}!'],
  squatMidway:      ['Sit on the chair!', 'Strong legs, {name}!', 'Down… and up!'],
  squatTwoMore:     ['Two more!'],
  squatOneMore:     ['One more!'],
  squatGoalLive:    ['You did it! Squat star!'],
  squatGoal:        ['You did it! Squat star!', 'Yes! {n} squats!'],
  squatBest:        ['NEW RECORD! {n} squats!', 'Most squats ever, {name}!'],
  squatBelowGoal:   ['Good squatting, {name}!', '{n} squats! Nice legs!', 'You copied me so well!'],
  countCheck:       ['{n} squats! Is that right?'],

  // Form tips are read from catalog FORM_TIPS; these are the category wrappers
  formTipPlank:     ['Knee plank is OK too!'],
  formTipSquat:     ['Use a real chair if you like!'],

  // Onboarding
  setupTestSound:   ['Hi {name}! Can you hear me?'],
  meetBasket:       ['{name}! Something is in the basket! Tap it!'],
  meetHello:        ["Hi {name}! I'm your new puppy!"],
  meetPickName:     ['What is my name? Tap a card!'],
  meetAsk:          ['Call me {pup}?'],
  meetNamed:        ["I love it! I'm {pup}!"],
};

export function fill(template, vars = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}

const lastIndex = new Map();
/** Random line from a category, never the same index twice in a row. Returns the filled text. */
export function pickLine(category, vars = {}, rng = Math.random) {
  const list = LINES[category];
  if (!list || !list.length) return '';
  let i = Math.floor(rng() * list.length);
  if (list.length > 1 && i === lastIndex.get(category)) i = (i + 1) % list.length;
  lastIndex.set(category, i);
  return fill(list[i], vars);
}

const WORDS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
  'Twenty-one', 'Twenty-two', 'Twenty-three', 'Twenty-four', 'Twenty-five', 'Twenty-six', 'Twenty-seven',
  'Twenty-eight', 'Twenty-nine', 'Thirty'];
export function numberWord(n) {
  return (WORDS[n - 1] || String(n)) + '!';
}
