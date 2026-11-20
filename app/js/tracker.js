/* Checklist rendering: rows, kind/grade/search filters, the spoiler rule,
   and the detail pane with the official description, the guide and sources. */

export const KIND_NAMES = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };

export function gradeName(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

/** Does a trophy pass the active kind, grade and search filters? */
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

function tagsFor(trophy) {
  const tags = [`<span class="tag">${KIND_NAMES[trophy.kind] || trophy.kind}</span>`];
  if (trophy.missable) tags.push('<span class="tag missable">Missable</span>');
  if (trophy.target) tags.push(`<span class="tag">${escapeHtml(trophy.target)}</span>`);
  return tags.join('');
}

function rowMarkup(trophy, state) {
  const earned = state.earned.has(trophy.id);
  const hidden = isSpoilerHidden(trophy, state.earned, state.spoilerOn);
  const name = hidden ? '<span class="masked">Hidden story trophy — earn it to reveal</span>' : escapeHtml(trophy.name);
  const desc = hidden ? 'Name and description hidden by the spoiler setting.' : escapeHtml(trophy.description);
  const selected = state.selectedId === trophy.id ? ' is-selected' : '';
  const done = earned ? ' is-earned' : '';
  const label = hidden ? 'story trophy' : escapeHtml(trophy.name);
  return `<li class="trophy-row${done}${selected}" data-id="${trophy.id}">
    <input type="checkbox" ${earned ? 'checked' : ''} aria-label="Mark ${label} earned">
    <span><span class="row-name">${name}</span><br><span class="row-desc">${desc}</span>
    <span class="row-tags">${tagsFor(trophy)}</span></span>
    <span class="grade-label grade-${trophy.grade}">${gradeName(trophy.grade)}</span>
  </li>`;
}

/** Render the checklist rows into listEl. Returns how many are visible. */
export function renderChecklist(listEl, trophies, state, callbacks) {
  const visible = trophies.filter((t) => trophyMatches(t, state.filters));
  listEl.innerHTML = visible.map((t) => rowMarkup(t, state)).join('');
  listEl.querySelectorAll('.trophy-row').forEach((row) => {
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
  const missableTag = trophy.missable ? '<span class="tag missable">Missable</span>' : '';
  const targetTag = trophy.target ? `<span class="tag">${escapeHtml(trophy.target)}</span>` : '';
  paneEl.innerHTML = `
    <h2>${name}</h2>
    <p class="tag-row"><span class="tag grade-${trophy.grade}">${gradeName(trophy.grade)}</span>
    <span class="tag">${KIND_NAMES[trophy.kind] || trophy.kind}</span>
    ${missableTag}
    ${targetTag}
    <span class="tag">Roadmap stage ${trophy.stage}</span></p>
    <p class="official"><b>Official description</b>${desc}</p>
    <h3>Guide</h3>
    <p class="guide-text">${guide}</p>
    <h3>Sources</h3>
    <ul>${sources}</ul>
    <p class="source-note">The guide above is written for this entry from the official description. Where the description names no place or step, the guide says so instead of inventing one.</p>
    <button type="button" class="mark-btn${earned ? ' is-earned' : ''}" data-id="${trophy.id}">${earned ? '✓ Earned — click to unmark' : 'Mark as earned'}</button>`;
  paneEl.querySelector('.mark-btn').addEventListener('click', () => callbacks.onToggle(trophy.id));
}

/** Update the header progress bar and per-grade counts. */
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
    .map((g) => `${gradeName(g)} ${byGrade[g] || 0}/${trophies.filter((t) => t.grade === g).length}`)
    .join(' · ');
}
