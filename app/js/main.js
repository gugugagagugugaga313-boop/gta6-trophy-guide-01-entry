/* Leonida Platinum boot: load the trophy and roadmap data, wire the tracker
   controls, and keep the checklist, detail pane, roadmap and missables views
   in sync. Everything runs from local files; no network request is made. */

import { loadEarned, saveEarned, toggleEarned, downloadExport, parseImportedProgress, earnedFromHash } from './store.js';
import { renderChecklist, renderDetail, updateProgress, KIND_LABELS } from './tracker.js';
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

const els = {
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

const views = {
  tracker: document.getElementById('trackerView'),
  roadmap: document.getElementById('roadmapView'),
  missables: document.getElementById('missablesView'),
};

function selectedTrophy() {
  return state.trophies.find((t) => t.id === state.selectedId) || state.trophies[0];
}

function refreshAll() {
  const visible = renderChecklist(els.trophyList, state.trophies, state, callbacks);
  els.emptyNote.hidden = visible > 0;
  renderDetail(els.detailPane, selectedTrophy(), state, callbacks);
  updateProgress(els.progressText, els.progressFill, els.gradeCounts, state.trophies, state.earned);
  if (state.roadmap) renderRoadmap(els.roadmapStages, els.roadmapTitle, els.roadmapNote, state.roadmap, state.trophies, state.earned);
  renderMissables(els.missableList, els.missableRule, state.trophies, state.missableRule);
  const kindName = state.filters.kind === 'all' ? 'all kinds' : (KIND_LABELS[state.filters.kind] || state.filters.kind);
  els.filterNote.textContent =
    state.filters.kind === 'online'
      ? 'Online: the official list names no online trophy, so this filter is empty by design.'
      : `Showing ${visible} of ${state.trophies.length} trophies — ${kindName}, grade ${state.filters.grade}${state.spoilerOn ? ', spoilers hidden' : ''}.`;
}

function showView(name) {
  state.view = name;
  Object.entries(views).forEach(([key, el]) => {
    el.hidden = key !== name;
  });
  document.querySelectorAll('.view-tab').forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.view === name);
  });
  if (name === 'roadmap' && state.roadmap) renderRoadmap(els.roadmapStages, els.roadmapTitle, els.roadmapNote, state.roadmap, state.trophies, state.earned);
  if (name === 'missables') renderMissables(els.missableList, els.missableRule, state.trophies, state.missableRule);
}

const callbacks = {
  onSelect(id) {
    state.selectedId = id;
    refreshAll();
    els.detailPane.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  onToggle(id) {
    state.earned = toggleEarned(state.earned, id);
    refreshAll();
  },
};

function wireControls() {
  els.searchInput.addEventListener('input', () => {
    state.filters.query = els.searchInput.value.trim();
    refreshAll();
  });
  els.kindFilters.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-kind]');
    if (!btn) return;
    state.filters.kind = btn.dataset.kind;
    els.kindFilters.querySelectorAll('.kind-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
    refreshAll();
  });
  els.gradeFilter.addEventListener('change', () => {
    state.filters.grade = els.gradeFilter.value;
    refreshAll();
  });
  els.spoilerToggle.addEventListener('change', () => {
    state.spoilerOn = els.spoilerToggle.checked;
    refreshAll();
  });
  els.exportBtn.addEventListener('click', () => downloadExport(state.earned));
  els.importInput.addEventListener('change', async () => {
    const file = els.importInput.files[0];
    if (!file) return;
    try {
      const imported = parseImportedProgress(await file.text());
      state.earned = imported;
      saveEarned(state.earned);
      refreshAll();
    } catch {
      alert('That file is not a Leonida Platinum progress export.');
    }
    els.importInput.value = '';
  });
  els.resetBtn.addEventListener('click', () => {
    if (!confirm('Clear all earned trophies?')) return;
    state.earned = new Set();
    saveEarned(state.earned);
    refreshAll();
  });
  document.querySelectorAll('.view-tab').forEach((tab) => {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  });
}

/** Read deep links: #view=roadmap, #trophy=17, #earned=1,2,3. */
function applyHash() {
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
  const spoilerMatch = location.hash.match(/spoilers=on/);
  if (spoilerMatch) {
    state.spoilerOn = true;
    els.spoilerToggle.checked = true;
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
  applyHash();
  wireControls();
  showView(state.view);
  refreshAll();
}

boot();
