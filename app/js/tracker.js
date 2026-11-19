/* Checklist rendering: rows, kind/grade/search filters, the spoiler rule,
   and the detail pane with the official description, the guide and its sources. */

export const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

/** True when a trophy passes the active kind, grade and search filters. */
export function trophyMatches(trophy, filters) {
  if (filters.kind === 'missable' && !trophy.missable) return false;
  if (filters.kind === 'online') return false; // The official list names no online trophy.
  if (filters.kind !== 'all' && filters.kind !== 'missable' && trophy.kind !== filters.kind) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
    if (!haystack.includes(filters.query.toLowerCase())) return false;
  }
  return true;
}

/** Spoiler rule: a story trophy stays hidden until it is earned. */
export function isSpoilerHidden(trophy, earned, spoilerOn) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.id);
}

function chipsFor(trophy) {
  const chips = [`<span class="chip">${KIND_LABELS[trophy.kind] || trophy.kind}</span>`];
  if (trophy.missable) chips.push('<span class="chip missable">Missable</span>');
  if (trophy.target) chips.push(`<span class="chip">${escapeHtml(trophy.target)}</span>`);
  return chips.join('');
}

function rowHtml(trophy, state) {
  const earned = state.earned.has(trophy.id);
  const hidden = isSpoilerHidden(trophy, state.earned, state.spoilerOn);
  const name = hidden ? '<span class="masked">Hidden story trophy — earn it to reveal</span>' : escapeHtml(trophy.name);
  const desc = hidden ? 'Name and description hidden by the spoiler setting.' : escapeHtml(trophy.description);
  const selected = state.selectedId === trophy.id ? ' is-selected' : '';
  const done = earned ? ' is-earned' : '';
  const label = hidden ? 'story trophy' : escapeHtml(trophy.name);
  return `<li class="row${done}${selected}" data-id="${trophy.id}">
    <input type="checkbox" ${earned ? 'checked' : ''} aria-label="Mark ${label} earned">
    <span><span class="row-name">${name}</span><br><span class="row-desc">${desc}</span>
    <span class="row-tags">${chipsFor(trophy)}</span></span>
    <span class="grade-mark grade-${trophy.grade}">${gradeLabel(trophy.grade)}</span>
  </li>`;
}

/** Render the checklist rows into listEl. Returns how many are visible. */
export function renderChecklist(listEl, trophies, state, callbacks) {
  const visible = trophies.filter((t) => trophyMatches(t, state.filters));
  listEl.innerHTML = visible.map((t) => rowHtml(t, state)).join('');
  listEl.querySelectorAll('.row').forEach((row) => {
    const id = Number(row.dataset.id);
    row.addEventListener('click', (event) => {
      if (event.target.tagName === 'INPUT') return;
      callbacks.onSelect(id);
    });
    row.querySelector('input').addEventListener('click', (event) => {
      event.stopPropagation();
      callbacks.onToggle(id);
    });
  });
  return visible.length;
}

/** Render the selected trophy's guide pane. */
export function renderDetail(paneEl, trophy, state, callbacks) {
  if (!trophy) {
    paneEl.innerHTML = '<h2>Pick a trophy</h2><p>Select any trophy in the checklist to see its official description, guide and sources here.</p>';
    return;
  }
  const earned = state.earned.has(trophy.id);
  const hidden = isSpoilerHidden(trophy, state.earned, state.spoilerOn);
  const name = hidden ? 'Hidden story trophy' : escapeHtml(trophy.name);
  const desc = hidden ? 'This story trophy is hidden by the spoiler setting. Earn it to reveal its name and description.' : escapeHtml(trophy.description);
  const guide = hidden ? 'Guide hidden with the trophy. Earn it to reveal the guide.' : escapeHtml(trophy.guide);
  const sources = trophy.sources
    .map((s) => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a></li>`)
    .join('');
  const missableChip = trophy.missable ? '<span class="chip missable">Missable</span>' : '';
  const targetChip = trophy.target ? `<span class="chip">${escapeHtml(trophy.target)}</span>` : '';
  paneEl.innerHTML = `
    <h2>${name}</h2>
    <p class="chip-row"><span class="chip grade-${trophy.grade}">${gradeLabel(trophy.grade)}</span>
    <span class="chip">${KIND_LABELS[trophy.kind] || trophy.kind}</span>
    ${missableChip}
    ${targetChip}
    <span class="chip">Roadmap stage ${trophy.stage}</span></p>
    <p class="official"><b>Official description</b>${desc}</p>
    <h3>Guide</h3>
    <p class="guide-body">${guide}</p>
    <h3>Sources</h3>
    <ul>${sources}</ul>
    <p class="source-note">The guide above is written for this entry from the official description. Where the description names no place or step, the guide says so instead of inventing one.</p>
    <button type="button" class="earn-btn${earned ? ' is-earned' : ''}" data-id="${trophy.id}">${earned ? '✓ Earned — click to unmark' : 'Mark as earned'}</button>`;
  paneEl.querySelector('.earn-btn').addEventListener('click', () => callbacks.onToggle(trophy.id));
}

/** Update the header progress bar and counts. */
export function updateProgress(progressText, progressFill, gradeCounts, trophies, earned) {
  const total = trophies.length;
  const done = earned.size;
  progressText.textContent = `${done} of ${total} earned`;
  progressFill.style.width = total ? `${Math.round((done / total) * 100)}%` : '0%';
  const byGrade = {};
  trophies.forEach((t) => {
    if (earned.has(t.id)) byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
  });
  gradeCounts.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${gradeLabel(g)} ${byGrade[g] || 0}/${trophies.filter((t) => t.grade === g).length}`)
    .join(' · ');
}
