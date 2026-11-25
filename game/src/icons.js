// Food icons, all drawn with canvas shapes — no image files. Each icon is
// drawn centred on (x, y) inside a square of side `size`. A "piece" is a
// finished ingredient (chopped, grilled or fried) and looks different
// from the raw ingredient it came from.

import { INGREDIENTS } from './recipes.js';

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

export function drawIngredientIcon(ctx, id, x, y, size) {
  const s = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    roundRect(ctx, -s * 0.9, -s * 0.1, s * 1.8, s * 0.55, s * 0.25, '#d99a4e');
    ctx.fillStyle = '#f0b968';
    ctx.beginPath();
    ctx.arc(0, -s * 0.05, s * 0.9, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    circle(ctx, -s * 0.35, -s * 0.55, s * 0.09, '#fff3d6');
    circle(ctx, s * 0.25, -s * 0.7, s * 0.09, '#fff3d6');
    circle(ctx, s * 0.45, -s * 0.35, s * 0.09, '#fff3d6');
  } else if (id === 'patty') {
    roundRect(ctx, -s, -s * 0.45, s * 2, s * 0.9, s * 0.4, '#7a4a28');
    ctx.fillStyle = '#5f3a1e';
    circle(ctx, -s * 0.4, 0, s * 0.12, '#5f3a1e');
    circle(ctx, s * 0.3, -s * 0.15, s * 0.12, '#5f3a1e');
    circle(ctx, 0, s * 0.18, s * 0.1, '#5f3a1e');
  } else if (id === 'cheese') {
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.moveTo(-s, s * 0.6);
    ctx.lineTo(s, s * 0.6);
    ctx.lineTo(0, -s * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e0a92a';
    circle(ctx, -s * 0.25, s * 0.2, s * 0.14, '#e0a92a');
    circle(ctx, s * 0.2, s * 0.35, s * 0.11, '#e0a92a');
  } else if (id === 'tomato') {
    circle(ctx, 0, s * 0.1, s * 0.8, '#e5484d');
    ctx.fillStyle = '#c93338';
    ctx.beginPath();
    ctx.arc(0, s * 0.1, s * 0.8, Math.PI * 0.15, Math.PI * 0.85);
    ctx.fill();
    ctx.fillStyle = '#4da34a';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.55);
    ctx.lineTo(-s * 0.35, -s * 0.15);
    ctx.lineTo(0, -s * 0.3);
    ctx.lineTo(s * 0.35, -s * 0.15);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#69b455';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      circle(ctx, Math.cos(a) * s * 0.45, Math.sin(a) * s * 0.45 + s * 0.05, s * 0.42, '#69b455');
    }
    circle(ctx, 0, s * 0.05, s * 0.45, '#7cc96a');
    ctx.strokeStyle = '#4a8a3e';
    ctx.lineWidth = size * 0.05;
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, s * 0.3);
    ctx.quadraticCurveTo(0, -s * 0.2, s * 0.4, s * 0.3);
    ctx.stroke();
  } else if (id === 'onion') {
    circle(ctx, 0, 0, s * 0.85, '#e8d5f2');
    ctx.strokeStyle = '#b48ec9';
    ctx.lineWidth = size * 0.07;
    for (const r of [0.62, 0.4, 0.2]) {
      ctx.beginPath();
      ctx.arc(0, 0, s * r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#8e6aa8';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.lineTo(-s * 0.2, -s * 1.05);
    ctx.lineTo(s * 0.2, -s * 1.05);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'potato') {
    ctx.fillStyle = '#d9b06a';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.85, s * 0.6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b98d4a';
    circle(ctx, -s * 0.3, -s * 0.1, s * 0.1, '#b98d4a');
    circle(ctx, s * 0.25, s * 0.15, s * 0.08, '#b98d4a');
    circle(ctx, s * 0.05, -s * 0.25, s * 0.07, '#b98d4a');
  }
  ctx.restore();
}

// A finished piece: chopped veg comes in bits, grilled things get char
// stripes, fried potato becomes a carton of golden fries.
export function drawPieceIcon(ctx, piece, x, y, size) {
  const [id, prep] = piece.split(':');
  const s = size / 2;
  if (prep === 'fried') {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#f2c14e';
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.translate(i * s * 0.32, -s * 0.25);
      ctx.rotate(i * 0.09);
      ctx.fillRect(-s * 0.13, -s * 0.55, s * 0.26, s * 1.1);
      ctx.restore();
    }
    ctx.fillStyle = '#d94f3d';
    ctx.beginPath();
    ctx.moveTo(-s * 0.85, -s * 0.1);
    ctx.lineTo(s * 0.85, -s * 0.1);
    ctx.lineTo(s * 0.65, s * 0.85);
    ctx.lineTo(-s * 0.65, s * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    circle(ctx, 0, s * 0.4, s * 0.18, '#fff');
    ctx.restore();
    return;
  }
  if (prep === 'chopped') {
    // Diced bits: small rotated squares, like something just chopped.
    ctx.save();
    ctx.translate(x, y);
    const base = INGREDIENTS[id].color;
    const dark = INGREDIENTS[id].dark;
    for (let i = 0; i < 3; i++) {
      const ox = (i - 1) * s * 0.55;
      const oy = (i % 2 === 0 ? -s * 0.22 : s * 0.28);
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate((i - 1) * 0.45);
      ctx.fillStyle = base;
      ctx.fillRect(-s * 0.32, -s * 0.32, s * 0.64, s * 0.64);
      ctx.strokeStyle = dark;
      ctx.lineWidth = size * 0.04;
      ctx.strokeRect(-s * 0.32, -s * 0.32, s * 0.64, s * 0.64);
      ctx.restore();
    }
    ctx.restore();
    return;
  }
  drawIngredientIcon(ctx, id, x, y, size);
  if (prep === 'grilled') {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(60,30,10,0.75)';
    ctx.lineWidth = size * 0.07;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * s * 0.5 - s * 0.3, -s * 0.6);
      ctx.lineTo(i * s * 0.5 + s * 0.3, s * 0.6);
      ctx.stroke();
    }
    ctx.restore();
  }
}
