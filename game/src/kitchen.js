// Kitchen layout: where every station sits, what it is for, and the solid
// counters the chef cannot walk through. All coordinates are in the
// 1280x720 canvas space.

export const VIEW = { w: 1280, h: 720 };

export const STATIONS = {
  pantry: {
    id: 'pantry', label: 'Pantry', kind: 'pantry',
    x: 16, y: 120, w: 168, h: 300,
    hint: '1-7 or click: grab an ingredient',
  },
  board: {
    id: 'board', label: 'Chopping Board', kind: 'board',
    x: 216, y: 120, w: 168, h: 92,
    hint: 'E: place / hold E: chop / E: take',
  },
  grill: {
    id: 'grill', label: 'Grill', kind: 'grill',
    x: 416, y: 120, w: 208, h: 92,
    hint: 'E: place patty or onion, E: take when golden',
  },
  fryer: {
    id: 'fryer', label: 'Fryer', kind: 'fryer',
    x: 656, y: 120, w: 144, h: 92,
    hint: 'E: drop potato in, E: scoop fries out',
  },
  sink: {
    id: 'sink', label: 'Sink', kind: 'decor',
    x: 832, y: 120, w: 208, h: 92,
    hint: '',
  },
  stove: {
    id: 'stove', label: 'Stove', kind: 'decor',
    x: 1072, y: 120, w: 192, h: 92,
    hint: '',
  },
  plate: {
    id: 'plate', label: 'Plating Counter', kind: 'plate',
    x: 216, y: 560, w: 304, h: 104,
    hint: 'E: add to plate / E: pick up a finished dish',
  },
  trash: {
    id: 'trash', label: 'Trash', kind: 'trash',
    x: 16, y: 560, w: 104, h: 104,
    hint: 'E: throw away what you carry',
  },
  serve: {
    id: 'serve', label: 'Serving Window', kind: 'serve',
    x: 896, y: 560, w: 368, h: 104,
    hint: 'E: serve the finished plate',
  },
};

export const STATION_LIST = Object.values(STATIONS);

// Solid rectangles the chef collides with (the counters themselves).
export function solidRects() {
  return STATION_LIST.map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h }));
}

export function stationCenter(s) {
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
}

// The pantry shelf slots, laid out in two rows inside the pantry rect.
export function pantrySlots() {
  const ids = ['bun', 'patty', 'cheese', 'tomato', 'lettuce', 'onion', 'potato'];
  const s = STATIONS.pantry;
  return ids.map((id, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const w = 48;
    const gap = 6;
    const totalW = 3 * w + 2 * gap;
    const x = s.x + (s.w - totalW) / 2 + col * (w + gap);
    const y = s.y + 44 + row * 76;
    return { id, x, y, w, h: 64 };
  });
}

export function clampToFloor(x, y, r) {
  return {
    x: Math.max(20 + r, Math.min(VIEW.w - 20 - r, x)),
    y: Math.max(232 + r, Math.min(VIEW.h - 16 - r, y)),
  };
}
