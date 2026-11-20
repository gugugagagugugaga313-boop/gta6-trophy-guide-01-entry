[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/gugugagagugugaga313-boop/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/gugugagagugugaga313-boop/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum

A complete, spoiler-safe trophy guide for Grand Theft Auto VI on PS5 — all 55
trophies, with a checklist tracker you can tick off as you play.

## What it covers

- **55 trophies**: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze. No online trophies
  exist in the official list, so everything here is single-player.
- **Every trophy gets a short guide** written from its official description,
  plus the counts that matter (250 stunts, 42 Shooting Range medals, 14 drone
  race spots, 100 vehicles, 52 areas, and the rest).
- **18 missables flagged**, with the rule spelled out: a trophy is missable
  when its description ties it to one named mission, one character's final
  mission, a partner-only window, or a single story beat. GTA VI has no
  mission replay, so the guide tells you to keep a manual save at the start
  of every chapter and one from just before the finale.
- **A five-phase roadmap**: story first, then stranger strands, then
  activities and skills, then collectibles and exploration, then money,
  mayhem and cleanup. The Platinum and 100% completion close the run.

## The tracker

Open `app/index.html` in a browser (or run `node serve.ts --port 8901`).
Everything runs from local files — no network requests, no account, no
Rockstar artwork.

- Tick trophies off; progress saves in your browser (localStorage) and the
  progress bar counts by grade.
- Filter by group (story / activities / collectibles), grade, or text search;
  show missables only.
- **Spoiler mode** hides the name and guide of every unearned story trophy
  until you earn it or switch the mode off.
- **Export** your progress to a file, **import** it back on another machine,
  or share it with an `#earned=` link that pre-ticks the trophies in the URL.
- Deep links: `#view=roadmap`, `#trophy=17`, `#spoilers=on`.

## Sources

Trophy names, descriptions and grades are the official list, checked against
Exophase (https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
and PSNProfiles (https://psnprofiles.com/trophies/43531-grand-theft-auto-vi).
All guide text is original writing built from those descriptions. This is a
fan-made guide, not affiliated with Rockstar Games.

## Hand-in

`node main.ts` copies `app/` and `screenshots/` into the output directory
(`MAKEFUN_OUTPUT_DIR`, default `/output`) and writes `dossier.json` there
with the vendored make.fun summary library.
