// Tiny particle and floating-text effects: steam over the grill, chop bits,
// sizzle sparks and the "+24 coins" popups when a dish is served.

export function createEffects() {
  return { particles: [], floats: [] };
}

export function burst(fx, x, y, color, count, speed = 60, life = 0.6, size = 4) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = speed * (0.4 + Math.random() * 0.8);
    fx.particles.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 30,
      life: life * (0.6 + Math.random() * 0.7),
      maxLife: life,
      size: size * (0.6 + Math.random() * 0.8),
      color,
    });
  }
}

export function steam(fx, x, y) {
  fx.particles.push({
    x: x + (Math.random() - 0.5) * 30, y,
    vx: (Math.random() - 0.5) * 12, vy: -34 - Math.random() * 20,
    life: 0.9, maxLife: 0.9, size: 5 + Math.random() * 4, color: 'rgba(255,255,255,0.55)',
  });
}

export function floatText(fx, x, y, text, color = '#ffd94d') {
  fx.floats.push({ x, y, text, color, life: 1.4, maxLife: 1.4 });
}

export function updateEffects(fx, dt) {
  for (const p of fx.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 40 * dt;
    p.life -= dt;
  }
  fx.particles = fx.particles.filter((p) => p.life > 0);
  for (const f of fx.floats) {
    f.y -= 42 * dt;
    f.life -= dt;
  }
  fx.floats = fx.floats.filter((f) => f.life > 0);
}

export function drawEffects(ctx, fx) {
  for (const p of fx.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const f of fx.floats) {
    ctx.globalAlpha = Math.max(0, f.life / f.maxLife);
    ctx.font = 'bold 24px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = f.color;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 4;
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}
