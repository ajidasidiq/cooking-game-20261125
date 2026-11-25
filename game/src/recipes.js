// Ingredients, dishes and order generation for Ember Kitchen Rush.
// Every dish is an original recipe invented for this game. An ingredient
// has a prep step (none / chop / grill / fry) and the dish lists the exact
// finished pieces it needs, in any order on the plate.

export const INGREDIENTS = {
  bun:     { name: 'Bun',     prep: 'none',  key: '1', color: '#e8a95c', dark: '#b97e33' },
  patty:   { name: 'Patty',   prep: 'grill', key: '2', color: '#8a5a34', dark: '#5f3a1e' },
  cheese:  { name: 'Cheese',  prep: 'none',  key: '3', color: '#f7c948', dark: '#d9a41f' },
  tomato:  { name: 'Tomato',  prep: 'chop',  key: '4', color: '#e5484d', dark: '#a92c30' },
  lettuce: { name: 'Lettuce', prep: 'chop',  key: '5', color: '#69b455', dark: '#3f7d33' },
  onion:   { name: 'Onion',   prep: 'grill', key: '6', color: '#c9a0dc', dark: '#8e6aa8' },
  potato:  { name: 'Potato',  prep: 'fry',   key: '7', color: '#f2d492', dark: '#c9a44e' },
};

// A finished piece is an ingredient id plus the prep that was done to it.
export function pieceId(ingredient, prepDone) {
  return prepDone === 'none' ? ingredient : `${ingredient}:${prepDone}`;
}

export function pieceLabel(piece) {
  const [id, prep] = piece.split(':');
  const base = INGREDIENTS[id].name;
  if (!prep) return base;
  if (prep === 'chopped') return `Chopped ${base}`;
  if (prep === 'grilled') return `Grilled ${base}`;
  if (prep === 'fried') return `${base} Fries`;
  return base;
}

// What a raw ingredient becomes when its prep finishes.
export function finishedPiece(ingredient) {
  const prep = INGREDIENTS[ingredient].prep;
  if (prep === 'chop') return pieceId(ingredient, 'chopped');
  if (prep === 'grill') return pieceId(ingredient, 'grilled');
  if (prep === 'fry') return pieceId(ingredient, 'fried');
  return pieceId(ingredient, 'none');
}

export const DISHES = [
  {
    id: 'ember-burger',
    name: 'Ember Burger',
    coins: 24,
    pieces: [pieceId('bun', 'none'), pieceId('patty', 'grilled'), pieceId('cheese', 'none'), pieceId('tomato', 'chopped')],
  },
  {
    id: 'garden-melt',
    name: 'Garden Melt',
    coins: 18,
    pieces: [pieceId('bun', 'none'), pieceId('cheese', 'none'), pieceId('tomato', 'chopped'), pieceId('lettuce', 'chopped')],
  },
  {
    id: 'smoky-stack',
    name: 'Smoky Stack',
    coins: 26,
    pieces: [pieceId('bun', 'none'), pieceId('patty', 'grilled'), pieceId('onion', 'grilled'), pieceId('cheese', 'none')],
  },
  {
    id: 'golden-fries',
    name: 'Golden Fries',
    coins: 10,
    pieces: [pieceId('potato', 'fried')],
  },
  {
    id: 'harvest-stack',
    name: 'Harvest Stack',
    coins: 20,
    pieces: [pieceId('bun', 'none'), pieceId('lettuce', 'chopped'), pieceId('tomato', 'chopped'), pieceId('onion', 'grilled')],
  },
];

export function dishById(id) {
  return DISHES.find((d) => d.id === id);
}

// Two multisets match when they hold the same pieces, order ignored.
export function piecesMatch(a, b) {
  if (a.length !== b.length) return false;
  const rest = [...b];
  return a.every((p) => {
    const i = rest.indexOf(p);
    if (i === -1) return false;
    rest.splice(i, 1);
    return true;
  });
}

let orderCounter = 0;

export function makeOrder(elapsedSeconds) {
  orderCounter += 1;
  // Early on the easy dishes show up more; the tricky ones join the rush.
  const pool = elapsedSeconds < 45
    ? ['ember-burger', 'garden-melt', 'golden-fries', 'ember-burger']
    : ['ember-burger', 'garden-melt', 'smoky-stack', 'golden-fries', 'harvest-stack'];
  const dish = dishById(pool[Math.floor(Math.random() * pool.length)]);
  const patience = dish.id === 'golden-fries' ? 45 : 62;
  return {
    id: orderCounter,
    dishId: dish.id,
    name: dish.name,
    coins: dish.coins,
    pieces: [...dish.pieces],
    patience,
    left: patience,
    served: false,
  };
}

export function resetOrderCounter() {
  orderCounter = 0;
}
