// Leonida Platinum — GTA VI trophy guide, make.fun gta6-trophy-guide-01.
// Node 22, standard library only. This program hands the guide in: it copies
// the guide (app/) and its screenshots (screenshots/) from beside this file
// into the output directory and writes dossier.json there with the vendored
// make.fun library, which is the summary the judge reads. The guide itself is
// plain static files — no build step, no network at run time.
//
// Local run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The grader sets /output itself; MAKEFUN_OUTPUT_DIR stands in for it here.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's own caps for this bounty: app/ at most 993 entries and 48 MiB,
// 4 screenshots at most 256 KiB each, dossier text at most 160 KiB.
const DOSSIER_OPTIONS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};
const SCREENSHOT_CAP = 262144;

function fail(message) {
  throw new Error(`Leonida Platinum hand-in failed: ${message}`);
}

function screenshotNames() {
  const dir = join(repoRoot, 'screenshots');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => !name.startsWith('.'));
}

function checkGuidePresent() {
  if (!existsSync(join(repoRoot, 'app', 'index.html'))) fail('app/index.html is missing.');
  if (!existsSync(join(repoRoot, 'app', 'data', 'trophies.json'))) fail('app/data/trophies.json is missing.');
  const shots = screenshotNames();
  if (shots.length < 3 || shots.length > 4) fail(`expected 3 or 4 screenshots, found ${shots.length}.`);
  for (const shot of shots) {
    const size = statSync(join(repoRoot, 'screenshots', shot)).size;
    if (size > SCREENSHOT_CAP) fail(`screenshot ${shot} is ${size} bytes, over the 256 KiB cap.`);
  }
}

checkGuidePresent();

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, DOSSIER_OPTIONS));
console.log('Leonida Platinum handed in: app/, screenshots/ and dossier.json are in ' + outDir);
