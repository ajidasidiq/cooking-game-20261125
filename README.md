# Ember Kitchen Rush

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/ajidasidiq/cooking-game-20261125/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/ajidasidiq/cooking-game-20261125/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A tiny original cooking game built for the [make.fun best cooking game bounty](https://make.fun/bounty/best-cooking-game-20261125-0137).

One chef, one rush, every order counts. Tickets land on the order board, each
with its own patience timer. Grab ingredients from the pantry, chop them on the
board, grill them on the grill or fry them in the fryer, build the dish on the
plating counter, and run the finished plate to the serving window before the
customer walks out. Serve on time to earn coins and tips; chain serves for a
combo bonus. Burnt food goes in the bin, three walk-outs close the kitchen,
and the last 30 seconds are a full rush hour.

## How to play

- **WASD / arrow keys** — move the chef around the kitchen
- **E or click** — use the station in front of you (place, chop, take, serve)
- **Hold E at the chopping board** — chop faster
- **1–7 or click a pantry shelf** — grab bun, patty, cheese, tomato, lettuce, onion, potato
- **P** — pause, **M** — mute, **R** — cook again after a shift ends

## Recipes

Ember Burger (bun, grilled patty, cheese, chopped tomato), Garden Melt,
Smoky Stack, Golden Fries and Harvest Stack — each with its own price and
patience. A patty is perfect only in the golden window: take it too early and
it is undercooked, leave it too long and it burns.

## Run it

Serve `game/` with any static server and open `index.html` in desktop Chrome —
no build step, no network requests, all art and sound drawn and synthesized in
code. For example: `node serve.ts` then open http://localhost:8080.

## Files

- `game/index.html` + `game/style.css` — page and canvas
- `game/src/main.js` — boot, loop and phase machine
- `game/src/cooking.js` — orders, stations, scoring
- `game/src/kitchen.js` — station layout and collision
- `game/src/chef.js` — movement and carrying
- `game/src/recipes.js` — ingredients, dishes and order generation
- `game/src/render.js` — all drawing: kitchen, HUD, screens
- `game/src/icons.js` — hand-drawn food icons
- `game/src/audio.js` — synthesized sound effects and music
- `game/src/input.js` — keyboard and mouse
- `game/src/particles.js` — steam, sparks and floating scores
- `game/src/shots.js` — staged states for screenshots (`?shot=start|play|serve|end`)

`main.ts` hands the game in (copies `game/` and `screenshots/` to `/output`
and writes `dossier.json`); `vendor/makefun-game.ts` is the kit's dossier
library, unchanged. MIT licensed.
