# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/gugugagagugugaga313-boop/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/gugugagagugugaga313-boop/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze), built for the [make.fun GTA 6 trophy guide competition](https://make.fun/c/gta6-trophy-guide-01).

## What it does

- **Complete checklist** — every trophy with its official name, description and grade as PlayStation publishes them, plus a guide written for this entry that cites its sources.
- **Tracker** — tick trophies off, progress saves in the browser (localStorage), export it to a file and import it back, or share it with a link.
- **Filters** — by kind (story, missable, collectibles, activities, online) and by grade, plus text search.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap to the platinum** — five stages in play order, with per-stage progress.
- **Missable flags** — 18 trophies flagged, built from the official descriptions alone: one named mission, one character's final mission, a partner-only window, or a single story beat.

## Honest sourcing

The game released 19 November 2026, so no complete playthrough source exists yet for step-by-step detail. Every guide is written from the official trophy description alone, and where a description names no place or step, the guide says so instead of inventing one. List sources: the [official trophy list on Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and the [PSNProfiles trophy list](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi).

## Run it

Serve `app/` with any static server and open `index.html` in desktop Chrome. It works with the network off — it loads only its own files and makes no network request.

```sh
node serve.ts        # then open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## License

MIT. An unofficial fan-made guide; no Rockstar Games logo, artwork or game screenshot is used.
