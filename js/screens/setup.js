// Grown-up setup (first launch): child's name, starting goals, sound test.
import { EXERCISES } from '../config.js';
import { getState, update } from '../store.js';
import { go } from '../router.js';
import { clampGoal } from '../logic/goal.js';
import { unlockAudio, sounds } from '../platform/audio.js';
import { unlockSpeech, say } from '../platform/speech.js';
import { fill, pickLine } from '../strings.js';
import { mountExercisePic } from '../ui/pup.js';
import { $ } from '../ui/dom.js';

let section, nameInput, goBtn;
const goals = { plank: EXERCISES.plank.defaultGoal, squat: EXERCISES.squat.defaultGoal };

function renderSteppers() {
  $('#setup-plank output', section).textContent = `${goals.plank / 1000} s`;
  $('#setup-squat output', section).textContent = String(goals.squat);
}
function renderGo() {
  const name = nameInput.value.trim();
  goBtn.disabled = !name;
  $('#setup-go-text', section).textContent = name ? `Hand the phone to ${name} →` : 'Hand the phone over →';
}

export default {
  id: 'setup',
  mount(sectionEl) {
    section = sectionEl;
    nameInput = $('#setup-name', section);
    goBtn = $('#setup-go', section);
    section.querySelectorAll('[data-pic]').forEach((n) => { mountExercisePic(n, n.dataset.pic, 1).style.width = '48px'; });
    nameInput.addEventListener('input', renderGo);
    for (const ex of ['plank', 'squat']) {
      section.querySelectorAll(`#setup-${ex} [data-step]`).forEach((b) => b.addEventListener('click', () => {
        const E = EXERCISES[ex];
        const cap = getState().settings[ex === 'plank' ? 'plank' : 'squat'][ex === 'plank' ? 'capMs' : 'capReps'];
        goals[ex] = clampGoal(ex, goals[ex] + Number(b.dataset.step) * E.manualGoalStep, cap);
        renderSteppers();
      }));
    }
    $('#setup-test', section).addEventListener('click', () => {
      unlockAudio(); unlockSpeech();
      sounds.chime();
      const name = nameInput.value.trim() || 'friend';
      setTimeout(() => say(fill(pickLine('setupTestSound'), { name })), 350);
    });
    goBtn.addEventListener('click', () => {
      const name = nameInput.value.trim().slice(0, 20);
      if (!name) return;
      unlockAudio(); unlockSpeech();
      update((s) => {
        s.settings.childName = name;
        s.settings.goals.plank.current = goals.plank;
        s.settings.goals.squat.current = goals.squat;
        s.meta.onboarded = true;
      });
      nameInput.blur();
      go('meet');
    });
  },
  canEnter() { return !getState().meta.onboarded; },
  show() {
    const st = getState();
    nameInput.value = st.settings.childName || '';
    goals.plank = st.settings.goals.plank.current;
    goals.squat = st.settings.goals.squat.current;
    renderSteppers();
    renderGo();
  },
};
