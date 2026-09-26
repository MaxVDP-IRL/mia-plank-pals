// js/config.js — the single source of tunable numbers.
export const APP_VERSION = '1.1.0';               // MUST equal VERSION in sw.js (tests/pwa.test.js checks)
export const STORAGE_KEY = 'plankPals.state';
export const SCHEMA_VERSION = 1;

export const EXERCISES = {
  plank: {
    unit: 'ms',
    defaultGoal: 10000, minGoal: 5000, goalRoundTo: 1000, manualGoalStep: 1000,
    defaultCap: 60000, capMin: 30000, capMax: 90000, capStep: 5000,      // cap = auto-finish AND max goal
    goalSteps: [ { below: 30000, step: 2000 }, { below: null, step: 3000 } ], // +2 s up to 30 s, then +3 s
    lowerBy: 2000,
    defaultRaiseAfterHits: 3,
    defaultLowerAfterMisses: 0,                   // 0 = never lower automatically
  },
  squat: {
    unit: 'reps',
    defaultGoal: 5, minGoal: 3, goalRoundTo: 1, manualGoalStep: 1,
    defaultCap: 20, capMin: 10, capMax: 30, capStep: 1,
    goalSteps: [ { below: null, step: 1 } ],
    lowerBy: 1,
    defaultRaiseAfterHits: 3,
    defaultLowerAfterMisses: 0,
  },
};
export const GOAL_POLICY = {
  hitsMustBeConsecutive: false,   // false: "met the goal 3 times since the last change"; true: "3 in a row"
};

export const TIMING = {
  countdownOptionsSec: [3, 5, 10],
  defaultCountdownSec: 5,
  countdownTickFromSec: 3,        // tick tones + big digits for the last 3 s
  stopIgnoreMs: 600,              // taps in the first 0.6 s of running are ignored (double-tap guard)
  formTipTimes: 5,                // form tip card plays before the first 5 starts of each exercise
  formTipStepMs: 1500,            // each tip shows ~1.5 s
  plank: {
    minValidMs: 2000,             // under this: only "try again" is offered (accidental tap)
    falseStartMs: 3000,           // under this: offer 🔁 try again (not saved) or ✅ count it
    boopEveryMs: 5000,
    midwayMinGoalMs: 8000,        // no midway cue for tiny goals
    nearGoalLeadMs: 3000,         // "Almost at the bone! 3… 2… 1…"
  },
  squat: {
    defaultBeatMs: 2500, beatMinMs: 2000, beatMaxMs: 3500, beatStepMs: 250,
    downFraction: 0.45, holdFraction: 0.10,       // pose: 45% down, 10% sit, 45% up
    minValidReps: 1,
    maxCorrectionAbove: 5,        // "+" can go at most 5 above the counted reps
    speechLeadMs: 200,            // start speaking the number slightly early to hide iOS speech lag
    speechMinBeatMs: 2000,        // faster than this → tone-only counting
    sparkleEvery: 5,
  },
};

export const STREAK = {
  restDaysAllowed: 1,             // Dad-only streak number: one missed day between exercise days doesn't break it
  weekStartsOn: 1,                // 1 = Monday (paw row resets Monday)
  starWeekMinDays: 5,             // 5+ exercise days in a Mon–Sun week = ⭐ week
};

export const REWARDS = {
  treats: {
    firstExerciseOfDay: 10,
    secondExercise: 5,            // main attempt of the other exercise, same day
    doubleDayBonus: 5,            // added on that same second exercise
    goal: 5,                      // once per exercise per day
    personalBest: 5,              // every attempt that sets a PB
    oneMoreTry: 3,                // extra attempt, max 1 per exercise per day
  },
  maxExtraPerExercisePerDay: 1,
  stickerChoices: 3,
  milestoneDays: [7, 14, 21, 30, 50, 75, 100],
  showOffEveryTreats: 150,        // after the final stage
  bigMomentPriority: ['bookFull', 'stageUp', 'pageFull', 'milestone'],
};

export const GATE = { holdMs: 2000, factorMin: 3, factorMax: 9, unlockMs: 5 * 60 * 1000 };

export const UI = {
  inviteAfterMs: 5000,            // main buttons pulse gently after 5 s without taps
  returningAfterDays: 2,          // "I missed you!" greeting
  backupReminderDays: 30,
  backupReminderMinSessions: 5,
  chartDays: 30,
  bubbleMsPerChar: 70,
  bubbleExtraMs: 800,
};

export const AUDIO = { masterGain: 0.35 };
export const SPEECH = { rate: 0.95, pitch: 1.3, preferredVoices: ['Samantha', 'Karen', 'Moira'], lang: 'en-US' };
