[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/gugugagagugugaga313-boop/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/gugugagagugugaga313-boop/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum

A complete, spoiler-safe trophy guide for Grand Theft Auto VI on PS5. Every one of the 55 trophies is covered, and the built-in checklist tracker lets you tick them off as you play.

## What it covers

- **All 55 trophies**: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze. The official list has no online trophies, so the whole hunt is single-player.
- **A short guide for every trophy**, written from its official description, with the numbers that matter alongside: 250 stunts, 42 Shooting Range medals, 14 drone race spots, 100 vehicles, 52 areas, and the rest.
- **18 missables flagged**, with the rule stated plainly: a trophy counts as missable when its description pins it to one named mission, one character's final mission, a partner-only window, or a single story beat. GTA VI has no mission replay, so keep a manual save at the start of every chapter and one more from just before the finale.
- **A five-phase roadmap**: story first, then stranger strands, then activities and skills, then collectibles and exploration, then money, mayhem and cleanup — finishing with the Platinum and 100% completion.

## The tracker

Open `app/index.html` in a browser — or start it with `node serve.ts --port 8901`. It runs entirely from local files: no network requests, no account, no Rockstar artwork.

- Tick trophies off as you earn them; progress is saved in your browser (localStorage) and the progress bar counts by grade.
- Narrow the list by group — story, activities, or collectibles — by grade, or by typing in the search box; a missables-only view is one click away.
- **Spoiler mode** keeps unearned story trophies hidden — name and guide both — until you earn them or disable the mode.
- Save your progress with **export**, bring it back on another machine with **import**, or send someone an `#earned=` link that pre-ticks your trophies for them.
- Deep links take you straight to a view or a trophy: `#view=roadmap`, `#trophy=17`, `#spoilers=on`.

## Sources

Trophy names, descriptions and grades come from the official list, checked against Exophase (https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and PSNProfiles (https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). All guide text is written fresh from those descriptions — nothing copied from another guide. This is an unofficial fan-made guide, not affiliated with or endorsed by Rockstar Games.

## Hand-in

Running `node main.ts` gathers `app/` and `screenshots/` into the output directory — `MAKEFUN_OUTPUT_DIR`, or `/output` by default — and writes `dossier.json` there using the vendored make.fun summary library.
