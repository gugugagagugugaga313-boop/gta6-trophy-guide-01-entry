/* Progress storage for the Leonida Platinum tracker.
   Earned trophies live in localStorage only. Export downloads a JSON file,
   import reads one back, and a #earned=1,2,3 link shares a checklist.
   Nothing leaves the browser and nothing is fetched from the network. */

export const STORAGE_KEY = 'leonida-platinum-progress-v1';
export const TROPHY_COUNT = 55;

/** Drop duplicates and anything outside the trophy range, then sort. */
function normaliseIds(ids) {
  return [...new Set(ids)]
    .filter((id) => Number.isInteger(id) && id >= 1 && id <= TROPHY_COUNT)
    .sort((a, b) => a - b);
}

/** Earned trophies from localStorage, as a Set of ids. */
export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(normaliseIds(parsed));
  } catch {
    return new Set();
  }
}

/** Write the earned set to localStorage. */
export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normaliseIds([...earned])));
  } catch {
    /* Storage full or blocked: the checklist still works for this visit. */
  }
}

/** Flip one trophy's earned state, save, and return the new set. */
export function toggleEarned(earned, id) {
  const next = new Set(earned);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  saveEarned(next);
  return next;
}

/** Progress as exportable JSON text. */
export function exportProgressText(earned) {
  return JSON.stringify(
    { game: 'Grand Theft Auto VI', tracker: 'Leonida Platinum', exportedAt: new Date().toISOString(), earned: normaliseIds([...earned]) },
    null,
    2,
  );
}

/** Parse an imported progress file. Throws when the shape is wrong. */
export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('Expected a JSON list of trophy ids.');
  const clean = normaliseIds(ids);
  if (clean.length === 0 && ids.length > 0) throw new Error('No valid trophy ids found.');
  return new Set(clean);
}

/** Earned ids from a #earned=1,2,3 link, or null when the hash has none. */
export function earnedFromHash() {
  const match = location.hash.match(/earned=([0-9,]+)/);
  if (!match) return null;
  return new Set(normaliseIds(match[1].split(',').map(Number)));
}

/** Download the exported progress file. */
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
