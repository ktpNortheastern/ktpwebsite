// Pure, deterministic layout math for the gallery infinite canvas. No DOM,
// no React, no Math.random() — everything here must produce the same
// output on the server and the client, or hydration breaks. The only thing
// that's allowed to randomize per-visit is which *image* lands in which
// slot (done client-side, elsewhere) — slot positions and adjacency are
// fixed forever.

const CELL_W = 520;
const CELL_H = 500;

// Fixed node box (total footprint reserved per slot, including its title,
// caption, and detail bars — see GalleryNode.tsx for the internal split).
// Smaller than the original size so more nodes are visible on screen at
// once. Jitter below must satisfy 2*JITTER <= CELL - NODE per axis, or
// adjacent jittered slots could let node boxes overlap.
export const NODE_W = 220;
export const NODE_H = 356;

// Pushed close to the safe max ((CELL-NODE)/2) so placement reads as
// organic scatter — sometimes tight clusters, sometimes wide gaps — rather
// than a grid with a light wobble.
const JITTER_X = 140;
const JITTER_Y = 65;

const COLS = 11;
const ROWS = 10;
export const SLOT_COUNT = COLS * ROWS; // 110

export const PLANE_W = COLS * CELL_W;
export const PLANE_H = ROWS * CELL_H;

// ~1.1x a cell's diagonal — catches immediate grid-neighbors only, never
// reaches two cells away.
const ADJACENCY_MAX_DIST = 790;

export const BUFFER_PX = 400;
export const HYSTERESIS_PX = 250;

export type Slot = { id: number; x: number; y: number };

// Integer-only hash (a MurmurHash3-style finalizer mix) — deterministic
// and, critically, bit-identical across every JS engine. Math.sin/Math.cos
// (the old version of this used a sine-hash) and Math.hypot are only
// *implementation-approximated* per the ECMAScript spec, so Node's V8 build
// and the browser's V8 build can return values that differ in the last few
// bits — invisible in isolation, but enough to fail React's hydration
// string-diff on every SVG coordinate that depended on them. Math.imul and
// bitwise ops on 32-bit ints, by contrast, are exactly specified, so this
// renders identically on server and client every time.
function hash(index: number, salt: number): number {
  let h = (Math.imul(index, 374761393) + Math.imul(salt, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296; // [0, 1)
}

function generateSlots(): Slot[] {
  const slots: Slot[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const id = row * COLS + col;
      const baseX = col * CELL_W + CELL_W / 2;
      const baseY = row * CELL_H + CELL_H / 2;
      const jitterX = (hash(id, 1) - 0.5) * 2 * JITTER_X;
      const jitterY = (hash(id, 2) - 0.5) * 2 * JITTER_Y;
      slots.push({ id, x: Math.round(baseX + jitterX), y: Math.round(baseY + jitterY) });
    }
  }
  return slots;
}

function buildAdjacency(slots: Slot[]): [number, number][] {
  const edges: [number, number][] = [];
  const seen = new Set<string>();

  for (const a of slots) {
    const neighbors = slots
      .filter((b) => b.id !== a.id)
      .map((b) => ({ b, dist: Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) }))
      .filter(({ dist }) => dist <= ADJACENCY_MAX_DIST)
      .sort((p, q) => p.dist - q.dist)
      .slice(0, 2);

    for (const { b } of neighbors) {
      const key = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push(a.id < b.id ? [a.id, b.id] : [b.id, a.id]);
    }
  }

  return edges;
}

// A gentle S-curve rather than a straight line: two control points bowed in
// opposite perpendicular directions around the segment's midpoint.
function curvePath(a: Slot, b: Slot): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const bow = len * 0.3;
  const c1x = a.x + dx * 0.33 + nx * bow;
  const c1y = a.y + dy * 0.33 + ny * bow;
  const c2x = a.x + dx * 0.67 - nx * bow;
  const c2y = a.y + dy * 0.67 - ny * bow;
  return `M ${a.x} ${a.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${b.x} ${b.y}`;
}

// Computed once at module load — pure and cheap (110 slots), so there's no
// need for useMemo or recomputation per render.
export const SLOTS: Slot[] = generateSlots();
export const ADJACENCY: [number, number][] = buildAdjacency(SLOTS);
export const CONNECTOR_PATHS: string[] = ADJACENCY.map(([a, b]) =>
  curvePath(SLOTS[a], SLOTS[b]),
);
// Every slot that's an endpoint of at least one connector — drawn as a
// small "port" dot at each connection point.
export const CONNECTOR_ENDPOINTS: Slot[] = Array.from(
  new Set(ADJACENCY.flat()),
).map((id) => SLOTS[id]);
