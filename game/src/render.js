// Everything the player sees: the kitchen, the order board, the chef, the
// HUD and the title / pause / end screens. All art is canvas shapes.

import { STATIONS, pantrySlots, VIEW } from './kitchen.js';
import { INGREDIENTS, dishById, pieceLabel } from './recipes.js';
import { drawIngredientIcon, drawPieceIcon } from './icons.js';
import { drawEffects } from './particles.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function text(ctx, str, x, y, size, color, align = 'center', weight = 'bold') {
  ctx.font = `${weight} ${size}px "Trebuchet MS", sans-serif`;
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function pill(ctx, x, y, w, h, color) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawFloor(ctx) {
  // Tiled wall band at the top, wooden floor below.
  ctx.fillStyle = '#7a4a2e';
  ctx.fillRect(0, 0, VIEW.w, 108);
  ctx.fillStyle = '#8a5636';
  for (let x = 0; x < VIEW.w; x += 64) {
    ctx.fillRect(x, 0, 62, 52);
    ctx.fillRect(x + 32, 54, 62, 52);
  }
  ctx.fillStyle = '#a8764e';
  ctx.fillRect(0, 104, VIEW.w, 6);
  ctx.fillStyle = '#c89a67';
  ctx.fillRect(0, 110, VIEW.w, VIEW.h - 110);
  ctx.fillStyle = '#bd8d5c';
  for (let y = 150; y < VIEW.h; y += 80) ctx.fillRect(0, y, VIEW.w, 3);
  ctx.strokeStyle = 'rgba(120,70,30,0.35)';
  ctx.lineWidth = 2;
  for (let x = 40; x < VIEW.w; x += 130) {
    ctx.beginPath();
    ctx.moveTo(x, 110);
    ctx.lineTo(x, VIEW.h);
    ctx.stroke();
  }
}

function drawPantry(ctx, station) {
  roundRect(ctx, station.x, station.y, station.w, station.h, 12);
  ctx.fillStyle = '#6b4423';
  ctx.fill();
  ctx.strokeStyle = '#4a2c14';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'PANTRY', station.x + station.w / 2, station.y + 24, 16, '#ffd9a0');
  for (const slot of pantrySlots()) {
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 8);
    ctx.fillStyle = '#8a5a30';
    ctx.fill();
    const ing = INGREDIENTS[slot.id];
    drawIngredientIcon(ctx, slot.id, slot.x + slot.w / 2, slot.y + 26, 34);
    text(ctx, `${ing.key} ${ing.name}`, slot.x + slot.w / 2, slot.y + 58, 10, '#ffe8c4');
  }
}

function drawCounter(ctx, station, label, topColor, frontColor) {
  roundRect(ctx, station.x, station.y, station.w, station.h, 10);
  ctx.fillStyle = frontColor;
  ctx.fill();
  roundRect(ctx, station.x + 4, station.y + 4, station.w - 8, 26, 8);
  ctx.fillStyle = topColor;
  ctx.fill();
  text(ctx, label, station.x + station.w / 2, station.y + station.h - 12, 13, '#fff8ec');
}

function drawBoard(ctx, game, station) {
  drawCounter(ctx, station, 'CHOPPING BOARD', '#e8c890', '#7a5230');
  // Wooden board on the counter, kept clear of the label underneath.
  roundRect(ctx, station.x + 24, station.y + 32, station.w - 48, 36, 8);
  ctx.fillStyle = '#d9b078';
  ctx.fill();
  ctx.strokeStyle = '#a87f4e';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (game.board) {
    drawIngredientIcon(ctx, game.board.piece, station.x + station.w / 2, station.y + 50, 28);
    // Chop progress bar.
    const bw = 90;
    const bx = station.x + station.w / 2 - bw / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bx, station.y + 72, bw, 8);
    ctx.fillStyle = game.board.progress >= 1 ? '#7ed957' : '#ffb020';
    ctx.fillRect(bx, station.y + 72, bw * game.board.progress, 8);
  }
}

function drawGrill(ctx, game, station) {
  drawCounter(ctx, station, 'GRILL', '#3d3d3d', '#5a3a22');
  for (let i = 0; i < 2; i++) {
    const gx = station.x + 16 + i * 96;
    const gy = station.y + 32;
    roundRect(ctx, gx, gy, 80, 38, 6);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    for (let k = 1; k < 4; k++) {
      ctx.beginPath();
      ctx.moveTo(gx + k * 20, gy + 3);
      ctx.lineTo(gx + k * 20, gy + 35);
      ctx.stroke();
    }
    const slot = game.grill[i];
    if (slot) {
      if (slot.burnt) {
        drawIngredientIcon(ctx, slot.id, gx + 40, gy + 19, 28);
        ctx.fillStyle = 'rgba(20,20,20,0.7)';
        ctx.beginPath();
        ctx.arc(gx + 40, gy + 19, 16, 0, Math.PI * 2);
        ctx.fill();
        text(ctx, 'BURNT', gx + 40, gy + 23, 10, '#ff6b5e');
      } else {
        drawIngredientIcon(ctx, slot.id, gx + 40, gy + 19, 28);
        if (slot.done) {
          ctx.strokeStyle = '#7ed957';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(gx + 40, gy + 19, 20, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          const bw = 64;
          ctx.fillStyle = 'rgba(0,0,0,0.55)';
          ctx.fillRect(gx + 8, gy + 29, bw, 6);
          ctx.fillStyle = slot.progress > 0.55 ? '#ffb020' : '#ff7b2f';
          ctx.fillRect(gx + 8, gy + 29, bw * slot.progress, 6);
        }
      }
    }
  }
}

function drawFryer(ctx, game, station) {
  drawCounter(ctx, station, 'FRYER', '#2f6db3', '#5a3a22');
  const fx = station.x + 22;
  const fy = station.y + 32;
  roundRect(ctx, fx, fy, station.w - 44, 36, 8);
  ctx.fillStyle = '#f7b731';
  ctx.fill();
  ctx.fillStyle = '#e58e26';
  for (let i = 0; i < 5; i++) {
    const bx = fx + 12 + i * 20;
    circle(ctx, bx, fy + 18 + Math.sin((Date.now() / 300) + i) * 3, 5, '#e58e26');
  }
  const slot = game.fryer;
  if (slot) {
    if (slot.burnt) {
      text(ctx, 'BURNT', station.x + station.w / 2, fy + 22, 12, '#5b1a12');
    } else if (slot.done) {
      drawPieceIcon(ctx, 'potato:fried', station.x + station.w / 2, fy + 18, 36);
    } else {
      drawIngredientIcon(ctx, 'potato', station.x + station.w / 2, fy + 18, 28);
      const bw = 70;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(station.x + station.w / 2 - bw / 2, fy + 29, bw, 6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(station.x + station.w / 2 - bw / 2, fy + 29, bw * slot.progress, 6);
    }
  }
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlateCounter(ctx, game, station, ready) {
  drawCounter(ctx, station, 'PLATING COUNTER', '#dfe6ea', '#5a3a22');
  const px = station.x + station.w / 2;
  const py = station.y + 52;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(px, py, 92, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b9c4cc';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#e8eef2';
  ctx.beginPath();
  ctx.ellipse(px, py, 66, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  game.plate.forEach((piece, i) => {
    const ox = px + (i - (game.plate.length - 1) / 2) * 40;
    drawPieceIcon(ctx, piece, ox, py - 4, 32);
  });
  if (game.plate.length > 0 && ready) {
    ctx.strokeStyle = '#7ed957';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(px, py, 100, 32, 0, 0, Math.PI * 2);
    ctx.stroke();
    pill(ctx, px - 42, py - 44, 84, 20, '#2f9e44');
    text(ctx, 'READY!', px, py - 30, 12, '#fff');
  }
}

function drawServe(ctx, station) {
  drawCounter(ctx, station, 'SERVING WINDOW', '#ffb020', '#7a3a10');
  // Warm light + bell on the counter.
  roundRect(ctx, station.x + 14, station.y + 8, station.w - 28, 22, 8);
  ctx.fillStyle = '#ffe9b0';
  ctx.fill();
  const bx = station.x + station.w / 2;
  const by = station.y + 56;
  ctx.fillStyle = '#f7c948';
  ctx.beginPath();
  ctx.arc(bx, by, 16, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(bx - 18, by, 36, 5);
  circle(ctx, bx, by - 18, 4, '#e0a92a');
  text(ctx, 'RING THE BELL — SERVE HERE', bx, station.y + station.h - 30, 12, '#fff3d6');
}

function drawTrash(ctx, station) {
  drawCounter(ctx, station, 'TRASH', '#8d99ae', '#3d4450');
  roundRect(ctx, station.x + 26, station.y + 34, 52, 40, 6);
  ctx.fillStyle = '#5c6675';
  ctx.fill();
  ctx.fillStyle = '#7d8898';
  ctx.fillRect(station.x + 22, station.y + 30, 60, 8);
  text(ctx, 'BIN', station.x + 52, station.y + 58, 12, '#e8ecf1');
}

function drawSink(ctx, station) {
  drawCounter(ctx, station, 'SINK', '#9fc7e8', '#5a3a22');
  roundRect(ctx, station.x + 30, station.y + 34, station.w - 60, 32, 10);
  ctx.fillStyle = '#5b8fb8';
  ctx.fill();
  ctx.strokeStyle = '#c8c8c8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(station.x + station.w / 2, station.y + 34, 11, Math.PI, 0);
  ctx.stroke();
}

function drawStove(ctx, station) {
  drawCounter(ctx, station, 'STOVE', '#3d3d3d', '#5a3a22');
  for (let i = 0; i < 2; i++) {
    const cx = station.x + 48 + i * 96;
    const cy = station.y + 48;
    circle(ctx, cx, cy, 20, '#1c1c1c');
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a8a8a';
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 18, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawChef(ctx, chef) {
  const bob = chef.moving ? Math.sin(chef.walkPhase) * 2 : 0;
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(chef.x, chef.y + 22, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Feet.
  const step = chef.moving ? Math.sin(chef.walkPhase) * 5 : 0;
  circle(ctx, chef.x - 10, chef.y + 18 + step * 0.3, 6, '#3a2a1a');
  circle(ctx, chef.x + 10, chef.y + 18 - step * 0.3, 6, '#3a2a1a');
  // Body: teal shirt, white apron.
  circle(ctx, chef.x, chef.y + 6 + bob * 0.4, 20, '#2a9d8f');
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(chef.x, chef.y + 10 + bob * 0.4, 13, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head + chef hat.
  circle(ctx, chef.x, chef.y - 16 + bob * 0.4, 15, '#f2c89b');
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(chef.x - 9, chef.y - 30 + bob * 0.4, 8, 0, Math.PI * 2);
  ctx.arc(chef.x + 9, chef.y - 30 + bob * 0.4, 8, 0, Math.PI * 2);
  ctx.arc(chef.x, chef.y - 33 + bob * 0.4, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(chef.x - 14, chef.y - 30 + bob * 0.4, 28, 7);
  // Eyes look where the chef walks.
  const look = chef.dir === 'left' ? -3 : chef.dir === 'right' ? 3 : 0;
  circle(ctx, chef.x - 5 + look, chef.y - 17 + bob * 0.4, 2, '#222');
  circle(ctx, chef.x + 5 + look, chef.y - 17 + bob * 0.4, 2, '#222');
  // What the chef carries, held up high.
  if (chef.hand) {
    const hx = chef.x;
    const hy = chef.y - 58 + bob * 0.4;
    circle(ctx, hx, hy, 24, 'rgba(255,255,255,0.9)');
    ctx.strokeStyle = '#c9a44e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hx, hy, 24, 0, Math.PI * 2);
    ctx.stroke();
    if (chef.hand.kind === 'ingredient') drawIngredientIcon(ctx, chef.hand.id, hx, hy, 36);
    else if (chef.hand.kind === 'piece') drawPieceIcon(ctx, chef.hand.piece, hx, hy, 36);
    else if (chef.hand.kind === 'plate') {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(hx, hy, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      chef.hand.pieces.slice(0, 3).forEach((p, i) => drawPieceIcon(ctx, p, hx + (i - 1) * 13, hy - 6, 16));
    }
  }
}

function drawTicket(ctx, order, x, y, w, h) {
  const urgent = order.left < 15;
  const pulse = urgent ? 0.5 + 0.5 * Math.sin(Date.now() / 150) : 0;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = '#fff8e7';
  ctx.fill();
  ctx.strokeStyle = urgent ? `rgba(229,72,77,${0.5 + pulse * 0.5})` : '#d9c49a';
  ctx.lineWidth = urgent ? 3 : 2;
  ctx.stroke();
  text(ctx, `#${order.id} ${order.name}`, x + 10, y + 20, 14, '#4a2c14', 'left');
  text(ctx, `${order.coins}c`, x + w - 10, y + 20, 14, '#b97e33', 'right');
  order.pieces.forEach((piece, i) => {
    drawPieceIcon(ctx, piece, x + 24 + i * 34, y + 46, 30);
  });
  // Patience bar.
  const bw = w - 20;
  const frac = Math.max(0, order.left / order.patience);
  ctx.fillStyle = '#e8dcc8';
  ctx.fillRect(x + 10, y + h - 16, bw, 8);
  ctx.fillStyle = frac > 0.5 ? '#7ed957' : frac > 0.25 ? '#ffb020' : '#e5484d';
  ctx.fillRect(x + 10, y + h - 16, bw * frac, 8);
  text(ctx, `${Math.ceil(order.left)}s`, x + w - 10, y + h - 20, 11, frac > 0.25 ? '#4a2c14' : '#e5484d', 'right');
}

function drawHud(ctx, game) {
  let x = 16;
  for (const order of game.orders) {
    drawTicket(ctx, order, x, 8, 168, 92);
    x += 178;
  }
  if (game.orders.length === 0) {
    text(ctx, 'No orders yet — the first ticket is coming!', 360, 58, 15, '#ffe8c4');
  }
  // Right panel: timer, coins, combo, stars.
  const px = 740;
  text(ctx, 'SHIFT', px + 10, 30, 13, '#d8b98a', 'left');
  const timerColor = game.timeLeft <= 30 ? '#ff6b5e' : '#fff3d6';
  text(ctx, formatTime(game.timeLeft), px + 10, 62, 34, timerColor, 'left');
  text(ctx, 'COINS', px + 150, 30, 13, '#d8b98a', 'left');
  text(ctx, `${game.coins}`, px + 150, 62, 34, '#ffd94d', 'left');
  text(ctx, 'COMBO', px + 280, 30, 13, '#d8b98a', 'left');
  text(ctx, game.combo > 0 ? `x${game.combo}` : '—', px + 280, 62, 34, game.combo > 1 ? '#ff9f43' : '#fff3d6', 'left');
  text(ctx, 'STARS', px + 400, 30, 13, '#d8b98a', 'left');
  let stars = '';
  for (let i = 0; i < 3; i++) stars += i < game.stars ? '★' : '☆';
  text(ctx, stars, px + 400, 62, 30, '#ffd94d', 'left');
  if (game.muted) text(ctx, 'MUTED (M)', 1240, 96, 12, '#d8b98a', 'right');
}

function drawMessage(ctx, game) {
  if (!game.message || game.elapsed >= game.messageUntil) return;
  ctx.font = 'bold 17px "Trebuchet MS", sans-serif';
  const w = ctx.measureText(game.message).width + 36;
  pill(ctx, VIEW.w / 2 - w / 2, 682, w, 30, 'rgba(30,18,8,0.85)');
  text(ctx, game.message, VIEW.w / 2, 703, 17, '#ffe8c4');
}

function drawRush(ctx, game) {
  if (!game.rush || game.phase !== 'playing') return;
  const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 120);
  ctx.globalAlpha = pulse;
  pill(ctx, VIEW.w / 2 - 130, 108, 260, 22, '#c92a2a');
  ctx.globalAlpha = 1;
  text(ctx, 'RUSH HOUR — ORDERS FLYING IN!', VIEW.w / 2, 124, 13, '#fff');
}

function drawHighlight(ctx, station) {
  if (!station) return;
  ctx.save();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  roundRect(ctx, station.x - 5, station.y - 5, station.w + 10, station.h + 10, 12);
  ctx.stroke();
  ctx.restore();
  if (station.hint) {
    // Bottom-row stations show the hint above them so it never covers
    // the message toast at the bottom of the screen.
    const above = station.y > 400;
    const hy = above ? station.y - 30 : station.y + station.h + 6;
    ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
    const w = ctx.measureText(station.hint).width + 24;
    pill(ctx, station.x + station.w / 2 - w / 2, hy, w, 24, 'rgba(30,18,8,0.85)');
    text(ctx, station.hint, station.x + station.w / 2, hy + 17, 14, '#ffe8c4');
  }
}

function overlay(ctx, alpha = 0.72) {
  ctx.fillStyle = `rgba(20,12,6,${alpha})`;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
}

function panel(ctx, x, y, w, h) {
  roundRect(ctx, x, y, w, h, 18);
  ctx.fillStyle = '#fff8e7';
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawTitle(ctx, game) {
  overlay(ctx, 0.55);
  panel(ctx, 240, 90, 800, 540);
  text(ctx, 'EMBER KITCHEN RUSH', 640, 180, 52, '#c92a2a');
  text(ctx, 'One chef. One rush. Every order counts.', 640, 220, 20, '#7a5230');
  text(ctx, 'Grab ingredients from the pantry, chop them, grill them,', 640, 300, 18, '#4a2c14', 'center', 'normal');
  text(ctx, 'or fry them — then build each dish on the plate and', 640, 328, 18, '#4a2c14', 'center', 'normal');
  text(ctx, 'serve it at the window before the ticket runs out.', 640, 356, 18, '#4a2c14', 'center', 'normal');
  text(ctx, 'WASD / arrows — move      E or click — use a station', 640, 420, 17, '#4a2c14');
  text(ctx, '1–7 — grab from the pantry      P — pause      M — mute', 640, 448, 17, '#4a2c14');
  text(ctx, 'Burnt food goes in the bin. Three walk-outs close the kitchen.', 640, 476, 17, '#8a4a2a');
  const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 250);
  ctx.globalAlpha = pulse;
  pill(ctx, 490, 520, 300, 52, '#c92a2a');
  ctx.globalAlpha = 1;
  text(ctx, 'PRESS ENTER TO COOK', 640, 554, 20, '#fff');
  text(ctx, 'A tiny original game — drawn and tuned by hand, no photos, no clones.', 640, 610, 13, '#a08a70', 'center', 'normal');
}

function drawPaused(ctx) {
  overlay(ctx, 0.6);
  panel(ctx, 440, 260, 400, 200);
  text(ctx, 'PAUSED', 640, 330, 40, '#4a2c14');
  text(ctx, 'Take a breath, chef.', 640, 372, 18, '#7a5230', 'center', 'normal');
  text(ctx, 'Press P to get back to the stove.', 640, 410, 16, '#4a2c14', 'center', 'normal');
}

function drawOver(ctx, game) {
  overlay(ctx, 0.6);
  panel(ctx, 340, 110, 600, 500);
  text(ctx, game.endReason, 640, 170, 26, '#c92a2a');
  const stars = game.coins >= 150 ? 3 : game.coins >= 100 ? 2 : game.coins >= 50 ? 1 : 0;
  let starLine = '';
  for (let i = 0; i < 3; i++) starLine += i < stars ? '★' : '☆';
  text(ctx, starLine, 640, 240, 56, '#f7c948');
  const rows = [
    ['Coins earned', `${game.coins}`],
    ['Dishes served', `${game.served}`],
    ['Orders lost', `${game.lost}`],
    ['Best combo', game.bestCombo > 0 ? `x${game.bestCombo}` : '—'],
  ];
  rows.forEach(([label, value], i) => {
    const y = 300 + i * 40;
    text(ctx, label, 420, y, 20, '#7a5230', 'left', 'normal');
    text(ctx, value, 860, y, 20, '#4a2c14', 'right');
  });
  text(ctx, stars === 3 ? 'Three stars — the crowd goes wild!' : stars === 2 ? 'Two stars — a solid shift!' : stars === 1 ? 'One star — the kitchen survived.' : 'No stars this time — the stove forgives. Try again!', 640, 480, 17, '#8a4a2a', 'center', 'normal');
  pill(ctx, 490, 520, 300, 52, '#c92a2a');
  text(ctx, 'PRESS R TO COOK AGAIN', 640, 554, 18, '#fff');
}

export function render(ctx, game, chef, fx, nearStation) {
  drawFloor(ctx);
  drawPantry(ctx, STATIONS.pantry);
  drawBoard(ctx, game, STATIONS.board);
  drawGrill(ctx, game, STATIONS.grill);
  drawFryer(ctx, game, STATIONS.fryer);
  drawSink(ctx, STATIONS.sink);
  drawStove(ctx, STATIONS.stove);
  const plateReady = game.plate.length > 0 && game.orders.some((o) => {
    const a = [...game.plate].sort().join('|');
    const b = [...o.pieces].sort().join('|');
    return a === b;
  });
  drawPlateCounter(ctx, game, STATIONS.plate, plateReady);
  drawTrash(ctx, STATIONS.trash);
  drawServe(ctx, STATIONS.serve);
  if (game.phase === 'playing' || game.phase === 'paused') drawHighlight(ctx, nearStation);
  drawChef(ctx, chef);
  drawEffects(ctx, fx);
  drawHud(ctx, game);
  drawRush(ctx, game);
  drawMessage(ctx, game);
  if (game.phase === 'title') drawTitle(ctx, game);
  else if (game.phase === 'paused') drawPaused(ctx);
  else if (game.phase === 'over') drawOver(ctx, game);
}

export { pieceLabel, dishById };
