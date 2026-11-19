/* Saved progress for the Leonida Platinum tracker.
   Progress lives in localStorage only. Export writes a JSON file, import reads
   one back, and a #earned=1,2,3 link shares a checklist. Nothing leaves the
   browser and nothing is fetched from the network. */

export const STORAGE_KEY = 'leonida-platinum-progress-v1';
export const TOTAL_TROPHIES = 55;

/** Keep only ids in the trophy range, as a sorted array. */
function cleanIds(ids) {
  return [...new Set(ids)]
    .filter((id) => Number.isInteger(id) && id >= 1 && id <= TOTAL_TROPHIES)
    .sort((a, b) => a - b);
}

/** Read the earned set from localStorage. Returns a Set of trophy ids. */
export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(cleanIds(parsed));
  } catch {
    return new Set();
  }
}

/** Persist the earned set to localStorage. */
export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanIds([...earned])));
  } catch {
    /* Storage full or blocked: the checklist still works for this visit. */
  }
}

/** Flip one trophy's earned state and save. Returns the new set. */
export function toggleEarned(earned, id) {
  const next = new Set(earned);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  saveEarned(next);
  return next;
}

/** Serialise progress for export. */
export function exportProgressText(earned) {
  return JSON.stringify(
    { game: 'Grand Theft Auto VI', tracker: 'Leonida Platinum', exportedAt: new Date().toISOString(), earned: cleanIds([...earned]) },
    null,
    2,
  );
}

/** Parse an imported progress file. Throws on bad shape. */
export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('Expected a JSON list of trophy ids.');
  const clean = cleanIds(ids);
  if (clean.length === 0 && ids.length > 0) throw new Error('No valid trophy ids found.');
  return new Set(clean);
}

/** Earned ids from a #earned=1,2,3 link, or null when the hash has none. */
export function earnedFromHash() {
  const match = location.hash.match(/earned=([0-9,]+)/);
  if (!match) return null;
  return new Set(cleanIds(match[1].split(',').map(Number)));
}

/** Trigger a download of the exported progress file. */
export function downloadExport(earned) {
  const blob = new Blob([exportProgressText(earned)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
