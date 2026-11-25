// The chef: movement, collision with counters, what is carried in hand,
// and which station is in reach. Interaction itself lives in cooking.js;
// this file only moves the chef and answers "what can I touch".

import { STATION_LIST, clampToFloor, stationCenter } from './kitchen.js';

export function createChef() {
  return {
    x: 640,
    y: 430,
    r: 24,
    dir: 'down',
    moving: false,
    // hand: null | { kind: 'ingredient', id } | { kind: 'piece', piece }
    //       | { kind: 'plate', pieces: [...] }
    hand: null,
    walkPhase: 0,
  };
}

function circleHitsRect(cx, cy, r, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

export function moveChef(chef, input, dt, solids) {
  let dx = 0;
  let dy = 0;
  if (input.keys.has('left')) dx -= 1;
  if (input.keys.has('right')) dx += 1;
  if (input.keys.has('up')) dy -= 1;
  if (input.keys.has('down')) dy += 1;
  chef.moving = dx !== 0 || dy !== 0;
  if (!chef.moving) return;
  if (Math.abs(dx) > 0 && Math.abs(dy) > 0) { dx *= 0.7071; dy *= 0.7071; }
  if (dx < 0) chef.dir = 'left';
  else if (dx > 0) chef.dir = 'right';
  else if (dy < 0) chef.dir = 'up';
  else if (dy > 0) chef.dir = 'down';
  const speed = 265;
  const nx = chef.x + dx * speed * dt;
  const ny = chef.y + dy * speed * dt;
  const clamped = clampToFloor(nx, ny, chef.r);
  // Move axis by axis so the chef slides along counters instead of sticking.
  const tryX = { ...clamped, y: chef.y };
  const blockedX = solids.some((s) => circleHitsRect(tryX.x, tryX.y, chef.r, s));
  if (!blockedX) chef.x = tryX.x;
  const tryY = { x: chef.x, ...clamped };
  const blockedY = solids.some((s) => circleHitsRect(tryY.x, tryY.y, chef.r, s));
  if (!blockedY) chef.y = tryY.y;
  chef.walkPhase += dt * 11;
}

export function nearestStation(chef) {
  let best = null;
  let bestD = 92;
  for (const s of STATION_LIST) {
    if (s.kind === 'decor') continue;
    const c = stationCenter(s);
    const d = Math.hypot(chef.x - c.x, chef.y - c.y) - Math.max(s.w, s.h) / 2;
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}

export function handLabel(hand) {
  if (!hand) return '';
  if (hand.kind === 'ingredient') return hand.id;
  if (hand.kind === 'piece') return hand.piece;
  if (hand.kind === 'plate') return 'plate';
  return '';
}
