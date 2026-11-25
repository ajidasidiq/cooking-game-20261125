// The cooking itself: orders on the board, chopping, grilling, frying,
// plating, serving, coins, combo and the shift clock. Pure state updates;
// drawing lives in render.js.

import { INGREDIENTS, DISHES, dishById, piecesMatch, makeOrder, finishedPiece, resetOrderCounter } from './recipes.js';
import { STATIONS, pantrySlots } from './kitchen.js';

export const SHIFT_SECONDS = 180;
export const MAX_ORDERS = 4;

export function createGame() {
  resetOrderCounter();
  return {
    phase: 'title', // title | playing | paused | over
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    lost: 0,
    stars: 3,
    combo: 0,
    bestCombo: 0,
    orders: [],
    spawnIn: 2.5,
    rush: false,
    // Chopping board: null | { piece, progress }
    board: null,
    // Grill: two slots, each null | { id, progress, done, burnt }
    grill: [null, null],
    // Fryer: one slot, null | { id, progress, done, burnt }
    fryer: null,
    // Plate on the plating counter: array of finished piece ids.
    plate: [],
    message: '',
    messageUntil: 0,
    endReason: '',
    muted: false,
  };
}

export function startShift(game) {
  const fresh = createGame();
  Object.assign(game, fresh, { phase: 'playing' });
}

export function spawnInterval(elapsed) {
  if (elapsed < 45) return 15;
  if (elapsed < 100) return 12;
  return 9;
}

export function say(game, text, seconds = 2) {
  game.message = text;
  game.messageUntil = game.elapsed + seconds;
}

export function updateGame(game, dt, audio) {
  if (game.phase !== 'playing') return;
  game.elapsed += dt;
  game.timeLeft = Math.max(0, SHIFT_SECONDS - game.elapsed);
  game.rush = game.timeLeft <= 30 && game.timeLeft > 0;

  // New orders arrive on a timer, faster as the shift goes on.
  game.spawnIn -= dt;
  if (game.spawnIn <= 0 && game.orders.length < MAX_ORDERS) {
    game.orders.push(makeOrder(game.elapsed));
    game.spawnIn = spawnInterval(game.elapsed);
    audio.bell();
  }

  // Order patience drains; an empty ticket costs a star.
  for (const order of game.orders) {
    order.left -= dt;
  }
  const expired = game.orders.filter((o) => o.left <= 0);
  for (const o of expired) {
    game.orders.splice(game.orders.indexOf(o), 1);
    game.lost += 1;
    game.stars = Math.max(0, game.stars - 1);
    game.combo = 0;
    audio.fail();
    say(game, `Order #${o.id} walked out — ${o.name} was too slow!`, 2.5);
  }

  // Grill slots cook; past the golden window they burn.
  for (let i = 0; i < game.grill.length; i++) {
    const slot = game.grill[i];
    if (!slot || slot.burnt) continue;
    slot.progress += dt / 9;
    if (!slot.done && slot.progress >= 0.7) {
      slot.done = true;
      audio.ready();
    }
    if (slot.progress >= 1) { slot.burnt = true; slot.done = false; }
  }
  // Fryer cooks faster than the grill.
  if (game.fryer && !game.fryer.burnt) {
    game.fryer.progress += dt / 7;
    if (!game.fryer.done && game.fryer.progress >= 0.7) {
      game.fryer.done = true;
      audio.ready();
    }
    if (game.fryer.progress >= 1) { game.fryer.burnt = true; game.fryer.done = false; }
  }

  if (game.timeLeft <= 0) {
    game.phase = 'over';
    game.endReason = game.stars === 0 ? 'The kitchen lost its stars.' : 'Shift complete!';
    return;
  }
  if (game.stars === 0) {
    game.phase = 'over';
    game.endReason = 'Three customers walked out. The kitchen closed early.';
  }
}

// ---- interactions -------------------------------------------------------

function carryIngredient(chef, id, audio) {
  if (chef.hand) return false;
  chef.hand = { kind: 'ingredient', id };
  audio.pickup();
  return true;
}

function tryServe(game, chef, audio) {
  if (!chef.hand || chef.hand.kind !== 'plate') return false;
  const plate = chef.hand.pieces;
  const match = game.orders.find((o) => piecesMatch(plate, o.pieces));
  if (!match) {
    say(game, 'No order wants this plate yet.', 2);
    audio.fail();
    return false;
  }
  const dish = dishById(match.dishId);
  const tip = Math.round(dish.coins * (match.left / match.patience) * 0.5);
  const comboBonus = game.combo >= 2 ? Math.round(dish.coins * 0.1 * game.combo) : 0;
  const earned = dish.coins + tip + comboBonus;
  game.coins += earned;
  game.served += 1;
  game.combo += 1;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  game.orders.splice(game.orders.indexOf(match), 1);
  chef.hand = null;
  audio.coin();
  say(game, `Served ${dish.name}! +${earned} coins${game.combo > 1 ? ` (combo x${game.combo})` : ''}`, 2.5);
  return true;
}

function useBoard(game, chef, audio, holdingInteract) {
  if (game.board && holdingInteract && game.board.progress < 1) {
    game.board.progress = Math.min(1, game.board.progress + 0.016);
    if (Math.random() < 0.35) audio.chop();
    if (game.board.progress >= 1) {
      audio.ready();
      say(game, `${game.board.piece} chopped and ready!`, 1.5);
    }
    return true;
  }
  if (!game.board && chef.hand && chef.hand.kind === 'ingredient') {
    const ing = INGREDIENTS[chef.hand.id];
    if (ing.prep !== 'chop') { say(game, `The ${ing.name} does not need chopping.`, 1.5); return false; }
    game.board = { piece: chef.hand.id, progress: 0 };
    chef.hand = null;
    audio.drop();
    say(game, 'Hold E to chop!', 1.5);
    return true;
  }
  if (game.board && game.board.progress >= 1 && !chef.hand) {
    chef.hand = { kind: 'piece', piece: finishedPiece(game.board.piece) };
    game.board = null;
    audio.pickup();
    return true;
  }
  if (game.board && game.board.progress < 1) {
    say(game, 'Hold E to keep chopping.', 1.5);
    return false;
  }
  return false;
}

function useGrill(game, chef, audio) {
  // Take a finished or burnt item first.
  for (let i = 0; i < game.grill.length; i++) {
    const slot = game.grill[i];
    if (!slot) continue;
    if (slot.burnt) {
      game.grill[i] = null;
      say(game, 'Burnt! Tossed it in the bin.', 1.5);
      audio.fail();
      return true;
    }
    if (slot.done && !chef.hand) {
      chef.hand = { kind: 'piece', piece: finishedPiece(slot.id) };
      game.grill[i] = null;
      audio.pickup();
      return true;
    }
  }
  // Otherwise place a raw grillable item in a free slot.
  if (chef.hand && chef.hand.kind === 'ingredient') {
    const ing = INGREDIENTS[chef.hand.id];
    if (ing.prep !== 'grill') { say(game, `The ${ing.name} does not go on the grill.`, 1.5); return false; }
    const free = game.grill.findIndex((s) => s === null);
    if (free === -1) { say(game, 'The grill is full!', 1.5); return false; }
    game.grill[free] = { id: chef.hand.id, progress: 0, done: false, burnt: false };
    chef.hand = null;
    audio.sizzle();
    return true;
  }
  const cooking = game.grill.some((s) => s && !s.done);
  if (cooking) say(game, 'Still sizzling — wait for the golden glow.', 1.5);
  return false;
}

function useFryer(game, chef, audio) {
  const slot = game.fryer;
  if (slot && slot.burnt) {
    game.fryer = null;
    say(game, 'Burnt! Tossed it in the bin.', 1.5);
    audio.fail();
    return true;
  }
  if (slot && slot.done && !chef.hand) {
    chef.hand = { kind: 'piece', piece: finishedPiece(slot.id) };
    game.fryer = null;
    audio.pickup();
    return true;
  }
  if (chef.hand && chef.hand.kind === 'ingredient') {
    const ing = INGREDIENTS[chef.hand.id];
    if (ing.prep !== 'fry') { say(game, `The ${ing.name} does not go in the fryer.`, 1.5); return false; }
    if (game.fryer) { say(game, 'The fryer is busy!', 1.5); return false; }
    game.fryer = { id: chef.hand.id, progress: 0, done: false, burnt: false };
    chef.hand = null;
    audio.sizzle();
    return true;
  }
  if (game.fryer) say(game, 'Still frying — wait for the golden glow.', 1.5);
  return false;
}

function usePlate(game, chef, audio) {
  // Pick the plate up when it exactly matches an open order.
  if (!chef.hand && game.plate.length > 0) {
    const match = game.orders.find((o) => piecesMatch(game.plate, o.pieces));
    if (match) {
      chef.hand = { kind: 'plate', pieces: [...game.plate] };
      game.plate = [];
      audio.pickup();
      say(game, `${match.name} ready — run it to the window!`, 2);
      return true;
    }
    say(game, 'This plate does not match any order yet.', 2);
    return false;
  }
  // Add a finished piece to the plate.
  if (chef.hand && chef.hand.kind === 'piece') {
    if (game.plate.length >= 4) { say(game, 'The plate is full!', 1.5); return false; }
    if (game.plate.includes(chef.hand.piece)) { say(game, 'That is already on the plate.', 1.5); return false; }
    game.plate.push(chef.hand.piece);
    chef.hand = null;
    audio.drop();
    return true;
  }
  if (chef.hand && chef.hand.kind === 'ingredient') {
    const ing = INGREDIENTS[chef.hand.id];
    if (ing.prep !== 'none') {
      say(game, 'That still needs prep — chop, grill or fry it first.', 2);
      return false;
    }
    // Ready-to-eat ingredients (bun, cheese) go straight on the plate.
    const piece = finishedPiece(chef.hand.id);
    if (game.plate.length >= 4) { say(game, 'The plate is full!', 1.5); return false; }
    if (game.plate.includes(piece)) { say(game, 'That is already on the plate.', 1.5); return false; }
    game.plate.push(piece);
    chef.hand = null;
    audio.drop();
    return true;
  }
  return false;
}

function useTrash(game, chef, audio) {
  if (!chef.hand) return false;
  chef.hand = null;
  audio.drop();
  say(game, 'Tossed.', 1);
  return true;
}

function usePantry(game, chef, audio, input) {
  if (chef.hand) { say(game, 'Hands full — serve or trash something first.', 1.5); return false; }
  const ids = Object.keys(INGREDIENTS);
  for (const id of ids) {
    if (input.digitPressed(INGREDIENTS[id].key)) return carryIngredient(chef, id, audio);
  }
  return false;
}

export function interact(game, chef, station, input, audio, holdingInteract) {
  if (!station) return false;
  switch (station.kind) {
    case 'pantry': return usePantry(game, chef, audio, input);
    case 'board': return useBoard(game, chef, audio, holdingInteract);
    case 'grill': return useGrill(game, chef, audio);
    case 'fryer': return useFryer(game, chef, audio);
    case 'plate': return usePlate(game, chef, audio);
    case 'trash': return useTrash(game, chef, audio);
    case 'serve': return tryServe(game, chef, audio);
    default: return false;
  }
}

// Clicking a pantry shelf slot grabs that ingredient directly.
export function clickAt(game, chef, x, y, audio) {
  if (game.phase !== 'playing') return false;
  for (const slot of pantrySlots()) {
    if (x >= slot.x && x <= slot.x + slot.w && y >= slot.y && y <= slot.y + slot.h) {
      if (chef.hand) { say(game, 'Hands full — serve or trash something first.', 1.5); return true; }
      return carryIngredient(chef, slot.id, audio);
    }
  }
  // Clicking a station uses it, if the chef is close enough.
  const station = STATIONS[Object.keys(STATIONS).find((k) => {
    const s = STATIONS[k];
    return x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h;
  })];
  if (!station || station.kind === 'decor') return false;
  const cx = station.x + station.w / 2;
  const cy = station.y + station.h / 2;
  const d = Math.hypot(chef.x - cx, chef.y - cy) - Math.max(station.w, station.h) / 2;
  if (d > 130) { say(game, 'Walk closer to use that.', 1.5); return true; }
  return interact(game, chef, station, { digitPressed: () => false }, audio, false);
}

export function dishMatchesPlate(game) {
  return game.orders.some((o) => piecesMatch(game.plate, o.pieces));
}

export { DISHES };
