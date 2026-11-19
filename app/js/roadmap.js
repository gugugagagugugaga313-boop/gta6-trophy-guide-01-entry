/* Roadmap and missables views, built from the official descriptions:
   the stages order the trophies, and the missable flags follow the rule in
   trophies.json (one named mission, one character final, a partner window,
   or a single story beat). */

import { escapeHtml, gradeLabel } from './tracker.js';

/** Render the five roadmap stages with per-stage progress. */
export function renderRoadmap(stagesEl, titleEl, noteEl, roadmap, trophies, earned) {
  titleEl.textContent = roadmap.title;
  noteEl.textContent = roadmap.note;
  const byId = new Map(trophies.map((t) => [t.id, t]));
  stagesEl.innerHTML = roadmap.stages
    .map((stage) => {
      const stageTrophies = stage.trophyIds.map((id) => byId.get(id)).filter(Boolean);
      const done = stageTrophies.filter((t) => earned.has(t.id)).length;
      const names = stageTrophies.map((t) => escapeHtml(t.name)).join(' · ');
      return `<li class="roadmap-stage">
        <h3>Stage ${stage.stage} — ${escapeHtml(stage.name)}</h3>
        <p class="stage-goal">${escapeHtml(stage.goal)}</p>
        <p><span class="stage-count">${done} of ${stageTrophies.length} earned</span> — ${stageTrophies.filter((t) => t.missable).length} missable in this stage</p>
        <p>${escapeHtml(stage.advice)}</p>
        <p class="stage-trophies">${names}</p>
      </li>`;
    })
    .join('');
}

/** Render the missable list with the flag rule up top. */
export function renderMissables(listEl, ruleEl, trophies, missableRule) {
  ruleEl.textContent = missableRule;
  const missable = trophies.filter((t) => t.missable);
  listEl.innerHTML = missable
    .map(
      (t) => `<li class="trophy-row" data-id="${t.id}">
        <span></span>
        <span><span class="trophy-name">${escapeHtml(t.name)}</span><br>
        <span class="trophy-desc">${escapeHtml(t.description)}</span><br>
        <span class="trophy-desc">${escapeHtml(t.guide)}</span></span>
        <span class="grade-mark grade-${t.grade}">${gradeLabel(t.grade)}</span>
      </li>`,
    )
    .join('');
}
