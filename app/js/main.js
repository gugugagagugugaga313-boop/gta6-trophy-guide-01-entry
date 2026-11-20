/* Leonida Platinum boot: load the trophy and roadmap data, wire the tracker
   controls, and keep the checklist, detail pane, roadmap and missables views
   in sync. Everything runs from local files; no network request is made. */

import { loadEarned, saveEarned, toggleEarned, downloadExport, parseImportedProgress, earnedFromHash } from './store.js';
import { renderChecklist, renderDetail, updateProgress, KIND_NAMES } from './tracker.js';
import { renderRoadmap, renderMissables } from './roadmap.js';

const state = {
  trophies: [],
  roadmap: null,
  missableRule: '',
  earned: loadEarned(),
  filters: { kind: 'all', grade: 'all', query: '' },
  spoilerOn: false,
  selectedId: 17,
  view: 'tracker',
};

const el = {
  progressText: document.getElementById('progressText'),
  progressFill: document.getElementById('progressFill'),
  gradeCounts: document.getElementById('gradeCounts'),
  searchInput: document.getElementById('searchInput'),
  kindFilters: document.getElementById('kindFilters'),
  gradeFilter: document.getElementById('gradeFilter'),
  spoilerToggle: document.getElementById('spoilerToggle'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
  resetBtn: document.getElementById('resetBtn'),
  filterNote: document.getElementById('filterNote'),
  trophyList: document.getElementById('trophyList'),
  emptyNote: document.getElementById('emptyNote'),
  detailPane: document.getElementById('detailPane'),
  roadmapTitle: document.getElementById('roadmapTitle'),
  roadmapNote: document.getElementById('roadmapNote'),
  roadmapStages: document.getElementById('roadmapStages'),
  missableRule: document.getElementById('missableRule'),
  missableList: document.getElementById('missableList'),
};

const viewSections = {
  tracker: document.getElementById('trackerView'),
  roadmap: document.getElementById('roadmapView'),
  missables: document.getElementById('missablesView'),
};

function selectedTrophy() {
  return state.trophies.find((t) => t.id === state.selectedId) || state.trophies[0];
}

function refresh() {
  const visible = renderChecklist(el.trophyList, state.trophies, state, actions);
  el.emptyNote.hidden = visible > 0;
  renderDetail(el.detailPane, selectedTrophy(), state, actions);
  updateProgress(el.progressText, el.progressFill, el.gradeCounts, state.trophies, state.earned);
  if (state.roadmap) renderRoadmap(el.roadmapStages, el.roadmapTitle, el.roadmapNote, state.roadmap, state.trophies, state.earned);
  renderMissables(el.missableList, el.missableRule, state.trophies, state.missableRule, actions);
  const kindName = state.filters.kind === 'all' ? 'all kinds' : (KIND_NAMES[state.filters.kind] || state.filters.kind);
  el.filterNote.textContent =
    state.filters.kind === 'online'
      ? 'Online: the official list names no online trophy, so this filter is empty by design.'
      : `Showing ${visible} of ${state.trophies.length} trophies — ${kindName}, grade ${state.filters.grade}${state.spoilerOn ? ', spoilers hidden' : ''}.`;
}

function switchView(name) {
  state.view = name;
  Object.entries(viewSections).forEach(([key, section]) => {
    section.hidden = key !== name;
  });
  document.querySelectorAll('.view-btn').forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.view === name);
  });
  if (name === 'roadmap' && state.roadmap) renderRoadmap(el.roadmapStages, el.roadmapTitle, el.roadmapNote, state.roadmap, state.trophies, state.earned);
  if (name === 'missables') renderMissables(el.missableList, el.missableRule, state.trophies, state.missableRule, actions);
}

const actions = {
  onSelect(id) {
    state.selectedId = id;
    refresh();
    el.detailPane.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  onSelectMissable(id) {
    state.selectedId = id;
    switchView('tracker');
    refresh();
    el.detailPane.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  onToggle(id) {
    state.earned = toggleEarned(state.earned, id);
    refresh();
  },
};

function wireControls() {
  el.searchInput.addEventListener('input', () => {
    state.filters.query = el.searchInput.value.trim();
    refresh();
  });
  el.kindFilters.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-kind]');
    if (!btn) return;
    state.filters.kind = btn.dataset.kind;
    el.kindFilters.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
    refresh();
  });
  el.gradeFilter.addEventListener('change', () => {
    state.filters.grade = el.gradeFilter.value;
    refresh();
  });
  el.spoilerToggle.addEventListener('change', () => {
    state.spoilerOn = el.spoilerToggle.checked;
    refresh();
  });
  el.exportBtn.addEventListener('click', () => downloadExport(state.earned));
  el.importInput.addEventListener('change', async () => {
    const file = el.importInput.files[0];
    if (!file) return;
    try {
      const imported = parseImportedProgress(await file.text());
      state.earned = imported;
      saveEarned(state.earned);
      refresh();
    } catch {
      alert('That file is not a Leonida Platinum progress export.');
    }
    el.importInput.value = '';
  });
  el.resetBtn.addEventListener('click', () => {
    if (!confirm('Clear all earned trophies?')) return;
    state.earned = new Set();
    saveEarned(state.earned);
    refresh();
  });
  document.querySelectorAll('.view-btn').forEach((tab) => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });
}

/** Read deep links: #view=roadmap, #trophy=17, #earned=1,2,3, #spoilers=on. */
function readHash() {
  const viewMatch = location.hash.match(/view=(tracker|roadmap|missables)/);
  if (viewMatch) state.view = viewMatch[1];
  const trophyMatch = location.hash.match(/trophy=(\d+)/);
  if (trophyMatch) {
    const id = Number(trophyMatch[1]);
    if (state.trophies.some((t) => t.id === id)) state.selectedId = id;
  }
  const shared = earnedFromHash();
  if (shared && shared.size > 0) {
    state.earned = shared;
    saveEarned(state.earned);
  }
  if (/spoilers=on/.test(location.hash)) {
    state.spoilerOn = true;
    el.spoilerToggle.checked = true;
  }
}

async function boot() {
  const [trophyData, roadmapData] = await Promise.all([
    fetch('data/trophies.json').then((r) => r.json()),
    fetch('data/roadmap.json').then((r) => r.json()),
  ]);
  state.trophies = trophyData.trophies;
  state.missableRule = trophyData.missableRule;
  state.roadmap = roadmapData;
  readHash();
  wireControls();
  switchView(state.view);
  refresh();
}

boot();
