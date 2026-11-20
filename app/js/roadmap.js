/* Roadmap and missables views, built from the official descriptions:
   the stages order the trophies, and the missable flags follow the rule in
   trophies.json (one named mission, one character final, a partner window,
   or a single story beat). */

import { escapeHtml, gradeName } from './tracker.js';

/** Render the five roadmap stages with per-stage progress. */
export function renderRoadmap(stagesEl, titleEl, noteEl, roadmap, trophies, earned) {
  titleEl.textContent = roadmap.title;
  noteEl.textContent = roadmap.note;
  const byId = new Map(trophies.map((t) => [t.id, t]));
  stagesEl.innerHTML = roadmap.stages
    .map((stage) => {
      const inStage = stage.trophyIds.map((id) => byId.get(id)).filter(Boolean);
      const done = inStage.filter((t) => earned.has(t.id)).length;
      const missableCount = inStage.filter((t) => t.missable).length;
      const names = inStage.map((t) => escapeHtml(t.name)).join(' · ');
      return `<li class="stage-card">
        <h3>Stage ${stage.stage} — ${escapeHtml(stage.name)}</h3>
        <p class="stage-goal">${escapeHtml(stage.goal)}</p>
        <p><span class="stage-count">${done} of ${inStage.length} earned</span> — ${missableCount} missable in this stage</p>
        <p>${escapeHtml(stage.advice)}</p>
        <p class="stage-trophies">${names}</p>
      </li>`;
    })
    .join('');
}

/** Render the missable list with the flag rule up top.
    Rows are clickable: picking one jumps to its guide in the tracker. */
export function renderMissables(listEl, ruleEl, trophies, missableRule, callbacks) {
  ruleEl.textContent = missableRule;
  const missable = trophies.filter((t) => t.missable);
  listEl.innerHTML = missable
    .map(
      (t) => `<li class="trophy-row" data-id="${t.id}">
        <span></span>
        <span><span class="row-name">${escapeHtml(t.name)}</span><br>
        <span class="row-desc">${escapeHtml(t.description)}</span><br>
        <span class="row-desc">${escapeHtml(t.guide)}</span></span>
        <span class="grade-label grade-${t.grade}">${gradeName(t.grade)}</span>
      </li>`,
    )
    .join('');
  if (callbacks) {
    listEl.querySelectorAll('.trophy-row').forEach((row) => {
      row.addEventListener('click', () => callbacks.onSelectMissable(Number(row.dataset.id)));
    });
  }
}
