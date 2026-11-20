/* Leonida Platinum — checklist tracker for the GTA VI trophy guide.
   One plain script, no modules, no network at run time: it loads the two
   local data files, keeps earned trophies in localStorage, and paints the
   checklist, the detail card, the roadmap and the missables view. */

const STORE_KEY = 'leonida-platinum-v1';
const GROUP_NAMES = { story: 'Story', activities: 'Activities', collectibles: 'Collectibles', online: 'Online' };

const state = {
  list: [],
  note: '',
  missableNote: '',
  phases: [],
  roadIntro: '',
  earned: new Set(),
  tab: 'list',
  picked: 17,
  group: 'all',
  tier: 'all',
  query: '',
  missOnly: false,
  spoilers: false,
};

const $ = (id) => document.getElementById(id);

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    return new Set(Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...state.earned].sort((a, b) => a - b)));
}

function idsFromHash() {
  const m = location.hash.match(/earned=([\d,]+)/);
  if (!m) return new Set();
  return new Set(m[1].split(',').map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
}

function applyHash() {
  const view = location.hash.match(/view=(list|roadmap|missables)/);
  if (view) state.tab = view[1];
  const trophy = location.hash.match(/trophy=(\d+)/);
  if (trophy) {
    const n = Number(trophy[1]);
    if (state.list.some((t) => t.no === n)) state.picked = n;
  }
  const shared = idsFromHash();
  if (shared.size > 0) {
    state.earned = shared;
    persist();
  }
  if (/spoilers=on/.test(location.hash)) {
    state.spoilers = true;
    $('hideSpoilers').checked = true;
  }
}

function byNo(n) {
  return state.list.find((t) => t.no === n);
}

function hiddenBySpoilers(t) {
  return state.spoilers && t.group === 'story' && !state.earned.has(t.no);
}

function matches(t) {
  if (state.group !== 'all' && t.group !== state.group) return false;
  if (state.tier !== 'all' && t.tier !== state.tier) return false;
  if (state.missOnly && !t.missable) return false;
  if (state.query) {
    const hay = (t.title + ' ' + t.blurb + ' ' + t.advice).toLowerCase();
    if (!hay.includes(state.query)) return false;
  }
  return true;
}

function paintMeter() {
  const total = state.list.length;
  const got = state.earned.size;
  $('meterFill').style.width = total ? Math.round((got / total) * 100) + '%' : '0%';
  $('meterText').textContent = `${got} of ${total} earned`;
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((tier) => {
    const all = state.list.filter((t) => t.tier === tier).length;
    const done = state.list.filter((t) => t.tier === tier && state.earned.has(t.no)).length;
    return `${tier} ${done}/${all}`;
  });
  $('tally').textContent = parts.join(' · ');
}

function rowHtml(t) {
  const earned = state.earned.has(t.no);
  const secret = hiddenBySpoilers(t);
  const name = secret ? 'Hidden story trophy' : t.title;
  const blurb = secret ? 'Earn it (or switch spoiler mode off) to see this trophy.' : t.blurb;
  return `<li><button type="button" class="trow${earned ? ' is-earned' : ''}${state.picked === t.no ? ' is-picked' : ''}" data-no="${t.no}">
    <input type="checkbox" ${earned ? 'checked' : ''} aria-label="Mark ${name} earned" data-check="${t.no}">
    <span><span class="tname">${name}</span><span class="tblurb">${blurb}</span>${t.missable ? '<span class="flag">Missable — one chance</span>' : ''}</span>
    <span class="badge ${t.tier}">${t.tier}</span>
  </button></li>`;
}

function paintRoster() {
  const visible = state.list.filter(matches);
  $('roster').innerHTML = visible.map(rowHtml).join('');
  $('emptyNote').hidden = visible.length > 0;
  const kind = state.group === 'all' ? 'all groups' : GROUP_NAMES[state.group];
  $('filterNote').textContent = state.group === 'online'
    ? 'Online: the official list names no online trophy, so this filter is empty by design.'
    : `Showing ${visible.length} of ${state.list.length} trophies — ${kind}, grade ${state.tier}${state.spoilers ? ', spoilers hidden' : ''}.`;
}

function paintDetail() {
  const t = byNo(state.picked) || state.list[0];
  if (!t) return;
  const secret = hiddenBySpoilers(t);
  const earned = state.earned.has(t.no);
  $('detail').innerHTML = `
    <div class="row"><span class="badge ${t.tier}">${t.tier}</span><span>${GROUP_NAMES[t.group]}</span>${t.missable ? '<span class="flag">Missable — one chance</span>' : ''}</div>
    <h2>${secret ? 'Hidden story trophy' : t.title}</h2>
    <p><em>${secret ? 'Earn it (or switch spoiler mode off) to see this trophy.' : t.blurb}</em></p>
    ${secret ? '' : `<p class="advice">${t.advice}</p>`}
    <label><input type="checkbox" id="detailCheck" ${earned ? 'checked' : ''}> Earned</label>
    ${secret ? '' : `<p class="sources">Sources: <a href="${t.refs[0]}">Exophase</a> · <a href="${t.refs[1]}">PSNProfiles</a></p>`}`;
  $('detailCheck').addEventListener('change', (e) => {
    if (e.target.checked) state.earned.add(t.no);
    else state.earned.delete(t.no);
    persist();
    refresh();
  });
}

function paintPhases() {
  $('roadTitle').textContent = 'Roadmap — five phases to the platinum';
  $('roadIntro').textContent = state.roadIntro;
  $('phases').innerHTML = state.phases.map((p) => {
    const chips = p.ids.map((n) => {
      const t = byNo(n);
      if (!t) return '';
      return `<button type="button" class="chip${state.earned.has(n) ? ' is-earned' : ''}" data-jump="${n}">${t.title}</button>`;
    }).join('');
    const done = p.ids.filter((n) => state.earned.has(n)).length;
    return `<section class="phase"><h3>Phase ${p.phase} — ${p.name} <span>(${done}/${p.ids.length})</span></h3><p>${p.blurb}</p><div class="chips">${chips}</div></section>`;
  }).join('');
}

function paintMissables() {
  $('missRule').textContent = state.missableNote;
  const missed = state.list.filter((t) => t.missable);
  $('missList').innerHTML = missed.map(rowHtml).join('');
}

function refresh() {
  paintMeter();
  paintRoster();
  paintDetail();
  paintPhases();
  paintMissables();
}

function switchTab(name) {
  state.tab = name;
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === name));
  $('listView').hidden = name !== 'list';
  $('roadmapView').hidden = name !== 'roadmap';
  $('missView').hidden = name !== 'missables';
  // The search box, group pills and progress tools only act on the
  // checklist, so keep them out of the way on the other two tabs.
  $('filtersBar').hidden = name !== 'list';
  $('toolsBar').hidden = name !== 'list';
  location.hash = `#view=${name}`;
}

function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function wire() {
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.querySelectorAll('#groupPills .pill').forEach((b) => b.addEventListener('click', () => {
    state.group = b.dataset.group;
    document.querySelectorAll('#groupPills .pill').forEach((x) => x.classList.toggle('is-on', x === b));
    paintRoster();
  }));
  $('tierSel').addEventListener('change', (e) => { state.tier = e.target.value; paintRoster(); });
  $('q').addEventListener('input', (e) => { state.query = e.target.value.trim().toLowerCase(); paintRoster(); });
  $('missOnly').addEventListener('change', (e) => { state.missOnly = e.target.checked; paintRoster(); });
  $('hideSpoilers').addEventListener('change', (e) => { state.spoilers = e.target.checked; refresh(); });
  $('roster').addEventListener('click', (e) => {
    const check = e.target.closest('[data-check]');
    if (check) {
      const n = Number(check.dataset.check);
      if (check.checked) state.earned.add(n);
      else state.earned.delete(n);
      persist();
      refresh();
      return;
    }
    const row = e.target.closest('[data-no]');
    if (row) {
      state.picked = Number(row.dataset.no);
      refresh();
      $('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
  $('missList').addEventListener('click', (e) => {
    const row = e.target.closest('[data-no]');
    if (!row) return;
    state.picked = Number(row.dataset.no);
    switchTab('list');
    refresh();
    $('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-jump]');
    if (!chip) return;
    state.picked = Number(chip.dataset.jump);
    switchTab('list');
    refresh();
  });
  $('exportBtn').addEventListener('click', () => {
    download('leonida-platinum-progress.json', JSON.stringify({ earned: [...state.earned].sort((a, b) => a - b) }, null, 2));
  });
  $('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const ids = Array.isArray(data.earned) ? data.earned : data;
      const next = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
      if (next.size === 0 && ids.length > 0) throw new Error('empty');
      state.earned = next;
      persist();
      refresh();
    } catch {
      alert('That file is not a Leonida Platinum progress export.');
    }
    e.target.value = '';
  });
  $('shareBtn').addEventListener('click', async () => {
    // Build from the current URL, not location.origin: the guide is often
    // opened straight from local files, where origin is the string "null".
    const url = `${location.href.split('#')[0]}#earned=${[...state.earned].sort((a, b) => a - b).join(',')}`;
    try {
      await navigator.clipboard.writeText(url);
      $('shareBtn').textContent = 'Link copied';
      setTimeout(() => { $('shareBtn').textContent = 'Copy share link'; }, 1500);
    } catch {
      prompt('Copy this link:', url);
    }
  });
  $('resetBtn').addEventListener('click', () => {
    if (!confirm('Clear all earned trophies?')) return;
    state.earned = new Set();
    persist();
    refresh();
  });
}

async function boot() {
  const [trophyData, roadData] = await Promise.all([
    fetch('data/trophies.json').then((r) => r.json()),
    fetch('data/roadmap.json').then((r) => r.json()),
  ]);
  state.list = trophyData.entries;
  state.note = trophyData.note;
  state.missableNote = trophyData.missableNote;
  state.phases = roadData.phases;
  state.roadIntro = roadData.intro;
  state.earned = loadEarned();
  applyHash();
  wire();
  switchTab(state.tab);
  refresh();
}

boot();
