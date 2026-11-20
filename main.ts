// Leonida Platinum — hand-in script for the GTA VI trophy guide.
// Run: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// It copies the guide (app/) and its screenshots (screenshots/) from beside
// this file into the output directory, then writes dossier.json there using
// the vendored make.fun summary library. The guide itself is plain static
// files — no build step, no network at run time.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const OUT = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The bounty caps: app/ at most 993 files and 48 MiB, at most 4 screenshots
// at 256 KiB each, dossier text at most 160 KiB.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};
const SHOT_MAX = 262144;

function abort(msg) {
  throw new Error('Leonida Platinum hand-in failed: ' + msg);
}

function shotFiles() {
  const dir = join(HERE, 'screenshots');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => !name.startsWith('.'));
}

function mustExist(path, label) {
  if (!existsSync(path)) abort(label + ' is missing.');
}

function checkInputs() {
  mustExist(join(HERE, 'app', 'index.html'), 'app/index.html');
  mustExist(join(HERE, 'app', 'data', 'trophies.json'), 'app/data/trophies.json');
  const shots = shotFiles();
  if (shots.length < 3 || shots.length > 4) {
    abort(`expected 3 or 4 screenshots, found ${shots.length}.`);
  }
  for (const shot of shots) {
    const size = statSync(join(HERE, 'screenshots', shot)).size;
    if (size > SHOT_MAX) abort(`screenshot ${shot} is ${size} bytes, over the 256 KiB cap.`);
  }
  // The manifest in shots.json must name exactly the screenshots on disk,
  // so a renamed or forgotten file cannot slip through.
  try {
    const manifest = JSON.parse(readFileSync(join(HERE, 'shots.json'), 'utf8'));
    const listed = (manifest.shots || []).map((s) => s.file).sort();
    const onDisk = shots.slice().sort();
    if (JSON.stringify(listed) !== JSON.stringify(onDisk)) {
      abort(`shots.json lists [${listed.join(', ')}] but screenshots/ holds [${onDisk.join(', ')}].`);
    }
  } catch (err) {
    if (err.message.startsWith('Leonida Platinum hand-in failed')) throw err;
    abort('shots.json is not readable JSON.');
  }
}

function handIn() {
  checkInputs();
  mkdirSync(OUT, { recursive: true });
  cpSync(join(HERE, 'app'), join(OUT, 'app'), { recursive: true });
  mkdirSync(join(OUT, 'screenshots'), { recursive: true });
  cpSync(join(HERE, 'screenshots'), join(OUT, 'screenshots'), { recursive: true });
  writeFileSync(join(OUT, 'dossier.json'), buildDossier(OUT, CAPS));
  console.log('Leonida Platinum handed in: app/, screenshots/ and dossier.json are in ' + OUT);
}

handIn();
