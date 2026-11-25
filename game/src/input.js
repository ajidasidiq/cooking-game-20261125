// Keyboard and mouse input. Keys are tracked as a live set; the game polls
// it each frame. Clicks are queued as {x, y} points in canvas space.

export function createInput(canvas) {
  const keys = new Set();
  const clicks = [];
  let interactPressed = false;
  let anyKeyPressed = false;

  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    KeyE: 'interact', Space: 'interact',
    KeyP: 'pause', KeyM: 'mute', Enter: 'confirm', KeyR: 'restart',
  };

  function onKeyDown(e) {
    if (e.repeat) return;
    if (e.code.startsWith('Digit')) {
      if (!e.repeat) anyKeyPressed = true;
      keys.add(e.code.slice(5));
      return;
    }
    const action = KEYMAP[e.code];
    if (!action) return;
    if (['up', 'down', 'left', 'right', 'interact', 'confirm'].includes(action)) e.preventDefault();
    if (action === 'interact' && !e.repeat) interactPressed = true;
    if (!e.repeat) anyKeyPressed = true;
    keys.add(action);
  }

  function onKeyUp(e) {
    if (e.code.startsWith('Digit')) { keys.delete(e.code.slice(5)); return; }
    const action = KEYMAP[e.code];
    if (action) keys.delete(action);
  }

  function onMouse(e) {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    clicks.push({ x, y });
    anyKeyPressed = true;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousedown', onMouse);

  return {
    keys,
    clicks,
    get interactPressed() { return interactPressed; },
    consumeInteract() { interactPressed = false; },
    consumeAnyKey() { const v = anyKeyPressed; anyKeyPressed = false; return v; },
    // Number keys 1-7 map straight to pantry ingredients.
    digitPressed(digit) {
      return keys.has(digit);
    },
  };
}
