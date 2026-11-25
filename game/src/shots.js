// Screenshot staging: ?shot=start|play|serve|end loads the game into a
// genuine mid-game state so the screenshots show the real game — the
// kitchen, the order board, a dish mid-assembly, the timer and a plate
// ready to serve. These are ordinary game states, built with the same
// pieces and orders a player would have.

import { makeOrder } from './recipes.js';
import { startShift, say } from './cooking.js';

export function applyShot(game, chef, shot) {
  if (shot === 'start') {
    game.phase = 'title';
    return;
  }
  startShift(game);
  if (shot === 'play') {
    // Mid-shift: three tickets on the board, one nearly out of time, the
    // chef carrying a chopped tomato, a half-built burger on the plate
    // and a patty sizzling on the grill.
    game.elapsed = 47;
    game.timeLeft = 133;
    game.coins = 36;
    game.combo = 2;
    game.orders = [makeOrder(47), makeOrder(47), makeOrder(47)];
    game.orders[0].dishId = 'ember-burger';
    game.orders[0].name = 'Ember Burger';
    game.orders[0].pieces = ['bun', 'patty:grilled', 'cheese', 'tomato:chopped'];
    game.orders[0].coins = 24;
    game.orders[0].left = 11;
    game.orders[1].dishId = 'garden-melt';
    game.orders[1].name = 'Garden Melt';
    game.orders[1].pieces = ['bun', 'cheese', 'tomato:chopped', 'lettuce:chopped'];
    game.orders[1].coins = 18;
    game.orders[1].left = 38;
    game.orders[2].dishId = 'golden-fries';
    game.orders[2].name = 'Golden Fries';
    game.orders[2].pieces = ['potato:fried'];
    game.orders[2].coins = 10;
    game.orders[2].left = 29;
    game.plate = ['bun', 'patty:grilled', 'cheese'];
    game.grill[0] = { id: 'patty', progress: 0.82, done: true, burnt: false };
    chef.hand = { kind: 'piece', piece: 'tomato:chopped' };
    chef.x = 470;
    chef.y = 400;
    chef.dir = 'left';
    say(game, 'Burger nearly done — tomato on the plate, then serve!', 999);
  } else if (shot === 'serve') {
    // The payoff moment: a finished Ember Burger in hand at the window.
    game.elapsed = 96;
    game.timeLeft = 84;
    game.coins = 78;
    game.combo = 3;
    game.orders = [makeOrder(96)];
    game.orders[0].dishId = 'ember-burger';
    game.orders[0].name = 'Ember Burger';
    game.orders[0].pieces = ['bun', 'patty:grilled', 'cheese', 'tomato:chopped'];
    game.orders[0].coins = 24;
    game.orders[0].left = 26;
    chef.hand = { kind: 'plate', pieces: ['bun', 'patty:grilled', 'cheese', 'tomato:chopped'] };
    chef.x = 1080;
    chef.y = 500;
    chef.dir = 'down';
    say(game, 'Ember Burger ready — serve it at the window!', 999);
  } else if (shot === 'end') {
    // Shift summary: a strong shift with two stars banked.
    game.elapsed = 180;
    game.timeLeft = 0;
    game.coins = 132;
    game.served = 7;
    game.lost = 1;
    game.bestCombo = 4;
    game.stars = 2;
    game.phase = 'over';
    game.endReason = 'Shift complete!';
  }
}
