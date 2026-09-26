// js/logic/backup.js — pure
import { migrate, normalize } from '../storage.js';
import { toLocalDateStr } from './dates.js';

export const BACKUP_APP_ID = 'plank-pals';

export function makeBackup(state, now = new Date()) {
  return { app: BACKUP_APP_ID, kind: 'backup', exportedAt: now.toISOString(), schemaVersion: state.schemaVersion, data: state };
}
export function backupFilename(now = new Date()) {
  return `plank-pals-backup-${toLocalDateStr(now)}.json`;
}
/** Accepts the wrapper from makeBackup() OR a raw state object. */
export function parseBackup(text) {
  let obj;
  try { obj = JSON.parse(String(text).trim()); } catch { return { ok: false, error: 'This is not a backup file (not JSON).' }; }
  const data = obj && obj.app === BACKUP_APP_ID && obj.data ? obj.data : obj;
  if (!data || typeof data !== 'object' || !Array.isArray(data.sessions)) {
    return { ok: false, error: 'This file does not look like a Plank Pals backup.' };
  }
  try {
    const state = normalize(migrate(data));
    const dates = state.sessions.map((s) => s.date).sort();
    return { ok: true, state, summary: {
      sessions: state.sessions.length, stickers: state.stickers.length, treats: state.pet.xp,
      firstDate: dates[0] || null, lastDate: dates[dates.length - 1] || null,
      childName: state.settings.childName, petName: state.settings.petName } };
  } catch (e) {
    return { ok: false, error: e.message === 'newer-version'
      ? 'This backup is from a newer version of the app. Update the app first.' : 'The backup is damaged.' };
  }
}
