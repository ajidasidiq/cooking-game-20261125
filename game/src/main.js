// Boot and main loop for Ember Kitchen Rush. Owns the animation frame, the
// phase machine (title -> playing -> paused / over), input routing and the
// ?shot= staging hook used for screenshots.

import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createGame, startShift, updateGame, interact, clickAt, say } from './cooking.js';
import { createChef, moveChef, nearestStation } from './chef.js';
import { solidRects } from './kitchen.js';
import { createEffects, updateEffects, burst, steam } from './particles.js';
import { render } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const input = createInput(canvas);
const audio = createAudio();
const game = createGame();
const chef = createChef();
const fx = createEffects();
const solids = solidRects();

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) applyShot(game, chef, shot);

let lastTime = performance.now();
let steamClock = 0;
let chopClock = 0;

function nearest() {
  return game.phase === 'playing' ? nearestStation(chef) : null;
}

function handleKeys() {
  if (input.keys.has('mute')) {
    input.keys.delete('mute');
    game.muted = audio.toggleMute();
  }
  if (game.phase === 'title') {
    if (input.keys.has('confirm') || input.consumeAnyKey()) {
      input.keys.delete('confirm');
      audio.unlock();
      audio.start();
      startShift(game);
    }
    return;
  }
  if (game.phase === 'over') {
    if (input.keys.has('restart')) {
      input.keys.delete('restart');
      audio.start();
      startShift(game);
      Object.assign(chef, createChef());
    }
    return;
  }
  if (input.keys.has('pause')) {
    input.keys.delete('pause');
    game.phase = game.phase === 'paused' ? 'playing' : 'paused';
    return;
  }
  if (game.phase !== 'playing') return;
  // Hold-to-chop: while E is held at the board with something on it.
  const near = nearest();
  if (input.keys.has('interact') && near && near.kind === 'board' && game.board && game.board.progress < 1) {
    interact(game, chef, near, input, audio, true);
    chopClock += 1;
    if (chopClock % 6 === 0) burst(fx, near.x + near.w / 2, near.y + 54, '#d9b078', 3, 40, 0.4, 3);
    return;
  }
  if (input.interactPressed) {
    input.consumeInteract();
    if (near) interact(game, chef, near, input, audio, false);
  }
}

function handleClicks() {
  while (input.clicks.length > 0) {
    const click = input.clicks.shift();
    if (game.phase === 'title') {
      audio.unlock();
      audio.start();
      startShift(game);
      continue;
    }
    if (game.phase === 'over') continue;
    if (game.phase === 'playing') clickAt(game, chef, click.x, click.y, audio);
  }
}

function spawnAmbient(dt) {
  steamClock += dt;
  if (steamClock > 0.12) {
    steamClock = 0;
    for (let i = 0; i < game.grill.length; i++) {
      const slot = game.grill[i];
      if (slot && !slot.burnt) steam(fx, 432 + i * 96 + 40, 150);
    }
    if (game.fryer && !game.fryer.burnt) steam(fx, 728, 150);
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  handleKeys();
  handleClicks();
  if (game.phase === 'playing') {
    moveChef(chef, input, dt, solids);
    updateGame(game, dt, audio);
    spawnAmbient(dt);
  }
  updateEffects(fx, dt);
  render(ctx, game, chef, fx, nearest());
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
