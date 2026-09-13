"use client";

import { useCallback, useRef, useState, type RefObject } from "react";
import { gsap } from "gsap";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

// Intrinsic size of /public/images/homepage.png — needed to replicate the
// exact object-fit:cover/object-top math the real <Image> uses, so each
// tile's grid position (and, for the moving ones, its background slice)
// lines up pixel-for-pixel with the photo underneath.
const IMG_W = 1440;
const IMG_H = 961;

type Direction = "up" | "down" | "left" | "right";
type TileStatus = "entering" | "active" | "leaving";

interface ContentBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

// Rectangles of the ORIGINAL photo (fractions of its width/height) known to
// be clear of faces — the plain wall on the left, and the torsos/legs below
// the row of heads on the right. yMin 0.3 on the wall keeps clear of the
// home page's big "Kappa Theta Pi" wordmark, which NavBar renders full-bleed
// over the top of this same photo.
const SAFE_ZONES: ContentBox[] = [
  { xMin: 0.03, xMax: 0.3, yMin: 0.3, yMax: 0.95 },
  { xMin: 0.38, xMax: 0.95, yMin: 0.5, yMax: 0.92 },
];

// How many cells are lit at once, and how many of those are movers.
const HIGHLIGHT_COUNT = 22;
const ANIMATE_COUNT = 7;
// Roughly how often ONE tile gets swapped for a different safe cell — a slow
// continuous drip of turnover (each tile's own average lifetime ends up
// several times this) rather than the whole set changing at once, which is
// what makes it read as organic flow instead of a periodic reset.
const ROTATE_MS = 3200;
const ENTER_MS = 900;
const LEAVE_MS = 700;

function pickCellSize(containerWidth: number) {
  if (containerWidth < 640) return 34;
  if (containerWidth < 1024) return 46;
  return 60;
}

const MOVE_DURATION = 1.1;
const SETTLE_HOLD = 0.7;
const IDLE = 5;
const CYCLE = MOVE_DURATION * 2 + SETTLE_HOLD + IDLE;

interface Tile {
  key: string;
  col: number;
  row: number;
  left: number;
  top: number;
  animate?: Direction;
  durationScale: number;
  idleScale: number;
  status: TileStatus;
  // Only set for animated tiles — a static tile just sits over the real
  // <Image> underneath, so it needs no background slice of its own.
  bg?: { image: string; size: string; position: string };
}

interface Geometry {
  size: number;
  cols: number;
  rows: number;
  renderedW: number;
  renderedH: number;
  offsetX: number;
  offsetY: number;
  bgUrl: string | undefined;
  safeSet: Set<string>;
  safeList: [number, number][];
}

function computeGeometry(w: number, h: number, bgUrl: string | undefined): Geometry {
  const scale = Math.max(w / IMG_W, h / IMG_H);
  const renderedW = IMG_W * scale;
  const renderedH = IMG_H * scale;
  const offsetX = (renderedW - w) / 2; // object-cover centers horizontally
  const offsetY = 0; // object-top: cropped from the bottom only

  const size = pickCellSize(w);
  const cols = Math.max(1, Math.floor(w / size));
  const rows = Math.max(1, Math.floor(h / size));

  // Every grid cell whose full content-box falls inside a safe zone.
  const safeSet = new Set<string>();
  const safeList: [number, number][] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x0 = (col * size + offsetX) / renderedW;
      const x1 = ((col + 1) * size + offsetX) / renderedW;
      const y0 = (row * size + offsetY) / renderedH;
      const y1 = ((row + 1) * size + offsetY) / renderedH;
      const safe = SAFE_ZONES.some((z) => x0 >= z.xMin && x1 <= z.xMax && y0 >= z.yMin && y1 <= z.yMax);
      if (safe) {
        safeSet.add(`${col},${row}`);
        safeList.push([col, row]);
      }
    }
  }

  return { size, cols, rows, renderedW, renderedH, offsetX, offsetY, bgUrl, safeSet, safeList };
}

function safeDirection(col: number, row: number, safeSet: Set<string>): Direction | undefined {
  const dirs: Direction[] = [];
  if (safeSet.has(`${col - 1},${row}`)) dirs.push("left");
  if (safeSet.has(`${col + 1},${row}`)) dirs.push("right");
  if (safeSet.has(`${col},${row - 1}`)) dirs.push("up");
  if (safeSet.has(`${col},${row + 1}`)) dirs.push("down");
  if (!dirs.length) return undefined;
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function makeTile(col: number, row: number, geom: Geometry, animate: Direction | undefined, status: TileStatus): Tile {
  const left = col * geom.size;
  const top = row * geom.size;
  return {
    key: `${col}-${row}`,
    col,
    row,
    left,
    top,
    animate,
    // A little organic variance per tile so the set doesn't move in obvious
    // lockstep.
    durationScale: 0.85 + Math.random() * 0.3,
    idleScale: 0.7 + Math.random() * 0.6,
    status,
    bg:
      animate && geom.bgUrl
        ? {
            image: `url(${geom.bgUrl})`,
            size: `${geom.renderedW}px ${geom.renderedH}px`,
            position: `${-(geom.offsetX + left)}px ${-(geom.offsetY + top)}px`,
          }
        : undefined,
  };
}

export default function HeroPhotoGrid({
  containerRef,
  imgRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  imgRef: RefObject<HTMLImageElement | null>;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [cellSize, setCellSize] = useState(60);
  const geomRef = useRef<Geometry | null>(null);

  const handleLeaveComplete = useCallback((key: string) => {
    setTiles((prev) => prev.filter((t) => t.key !== key));
  }, []);

  useIsomorphicLayoutEffect(() => {
    let ro: ResizeObserver | undefined;
    let rafId: number | undefined;
    let rotateId: ReturnType<typeof setInterval> | undefined;
    let imgEl: HTMLImageElement | null = null;

    // A full relayout — recomputes the whole grid and picks a fresh set.
    // Used for mount and for real viewport changes, where an instant swap
    // is expected (the whole photo just reflowed anyway).
    function layout() {
      const containerEl = containerRef.current;
      if (!containerEl) return;
      const w = containerEl.clientWidth;
      const h = containerEl.clientHeight;
      if (!w || !h) return;

      // The same background url the visible photo already loaded (its
      // resolved, optimized src) — reusing it means the browser serves the
      // moving tiles' background slices straight from cache instead of
      // fetching the original file a second time.
      const bgUrl = imgRef.current?.currentSrc || imgRef.current?.src;
      const geom = computeGeometry(w, h, bgUrl);
      geomRef.current = geom;

      const pool = [...geom.safeList];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const chosen = pool.slice(0, Math.min(HIGHLIGHT_COUNT, pool.length));

      let animating = 0;
      const next = chosen.map(([col, row]) => {
        const animate = animating < ANIMATE_COUNT ? safeDirection(col, row, geom.safeSet) : undefined;
        if (animate) animating++;
        return makeTile(col, row, geom, animate, "active");
      });

      setCellSize(geom.size);
      setTiles(next);
    }

    // Swaps exactly one currently-active tile for a different safe cell —
    // the retired tile fades out (its own unmount, via Tile's leaving
    // effect) and the recruit fades in, independently of every other tile,
    // which is what keeps this from ever reading as a reset.
    function rotateOne() {
      const geom = geomRef.current;
      if (!geom || geom.safeList.length === 0) return;

      setTiles((prev) => {
        const active = prev.filter((t) => t.status !== "leaving");
        if (!active.length) return prev;

        const victim = active[Math.floor(Math.random() * active.length)];
        const used = new Set(active.map((t) => `${t.col},${t.row}`));
        const candidates = geom.safeList.filter(([c, r]) => !used.has(`${c},${r}`));
        if (!candidates.length) return prev;

        const [col, row] = candidates[Math.floor(Math.random() * candidates.length)];
        // Keep the mover count steady: a retired mover is replaced by a
        // mover (new direction, re-picked for its new spot), a retired
        // static tile by another static tile.
        const animate = victim.animate ? safeDirection(col, row, geom.safeSet) : undefined;
        const recruit = makeTile(col, row, geom, animate, "entering");

        return [...prev.map((t) => (t.key === victim.key ? { ...t, status: "leaving" as const } : t)), recruit];
      });
    }

    // The container ref (owned by Hero.tsx, not this component) can still
    // be null on the very first layout-effect tick right after mount —
    // retried via rAF rather than bailing outright, so the grid still
    // appears on the initial paint instead of only after some later resize.
    function init() {
      const container = containerRef.current;
      if (!container) {
        rafId = requestAnimationFrame(init);
        return;
      }

      layout();
      ro = new ResizeObserver(layout);
      ro.observe(container);

      // The base photo is `priority`-loaded but may still resolve its real
      // `currentSrc` after this first layout pass — re-run once it does so
      // animated tiles pick up their background slice instead of staying
      // static.
      imgEl = imgRef.current;
      imgEl?.addEventListener("load", layout);

      rotateId = setInterval(rotateOne, ROTATE_MS);
    }
    init();

    return () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      if (rotateId !== undefined) clearInterval(rotateId);
      ro?.disconnect();
      imgEl?.removeEventListener("load", layout);
    };
  }, [containerRef, imgRef]);

  // Hover trail: the container (not this pointer-events-none overlay)
  // tracks the cursor, and whichever lit cell it's currently over gets a
  // quick brighten that then eases back down — never touched again until
  // the pointer leaves and re-enters. Cells light up and fade independently
  // as the cursor passes over them, one after another, which is what reads
  // as a staggered trail rather than one cell just following the cursor.
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return;

    let lastKey: string | null = null;

    function handleMove(e: PointerEvent) {
      if (!container || !overlay) return;
      const rect = container.getBoundingClientRect();
      const col = Math.floor((e.clientX - rect.left) / cellSize);
      const row = Math.floor((e.clientY - rect.top) / cellSize);
      const key = `${col}-${row}`;
      if (key === lastKey) return;
      lastKey = key;

      const glow = overlay.querySelector<HTMLDivElement>(`[data-glow="${key}"]`);
      if (!glow) return;
      gsap.killTweensOf(glow);
      gsap
        .timeline()
        .to(glow, { opacity: 1, duration: 0.12, ease: "power1.out" })
        .to(glow, { opacity: 0, duration: 1.1, ease: "power2.out" });
    }

    function handleLeave() {
      lastKey = null;
    }

    container.addEventListener("pointermove", handleMove);
    container.addEventListener("pointerleave", handleLeave);
    return () => {
      container.removeEventListener("pointermove", handleMove);
      container.removeEventListener("pointerleave", handleLeave);
    };
  }, [containerRef, cellSize]);

  return (
    <div ref={overlayRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Grid lines: one repeating background instead of a div per cell —
          thin, light-gray hairlines spaced into a small, evenly-sized
          square grid across the full photo. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(209,213,219,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(209,213,219,0.25) 1px, transparent 1px)",
          backgroundSize: `${cellSize}px ${cellSize}px`,
        }}
      />

      {tiles.map((tile) => (
        <GridTile key={tile.key} tile={tile} cellSize={cellSize} onLeaveComplete={handleLeaveComplete} />
      ))}
    </div>
  );
}

// Each tile owns its own enter/leave fade and its own slide-out-and-back
// loop. Keeping that lifecycle scoped to the tile itself (rather than one
// effect over the whole tile list) is what lets `rotateOne` swap a single
// tile without disturbing any of its siblings' animations mid-flight.
function GridTile({
  tile,
  cellSize,
  onLeaveComplete,
}: {
  tile: Tile;
  cellSize: number;
  onLeaveComplete: (key: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const holeRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (tile.status === "entering") {
      gsap.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: ENTER_MS / 1000, ease: "power2.out" });
    } else if (tile.status === "leaving") {
      gsap.to(root, {
        autoAlpha: 0,
        duration: LEAVE_MS / 1000,
        ease: "power2.out",
        onComplete: () => onLeaveComplete(tile.key),
      });
    }
  }, [tile.status, tile.key, onLeaveComplete]);

  // The slide-out/hold/slide-back loop — created once per mount and torn
  // down only when THIS tile unmounts, independent of whatever else is
  // entering or leaving elsewhere in the grid.
  useIsomorphicLayoutEffect(() => {
    const mover = moverRef.current;
    const hole = holeRef.current;
    if (!mover || !tile.animate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dir = tile.animate;
    const dx = dir === "left" ? -cellSize : dir === "right" ? cellSize : 0;
    const dy = dir === "up" ? -cellSize : dir === "down" ? cellSize : 0;
    const duration = MOVE_DURATION * tile.durationScale;

    const tl = gsap.timeline({
      repeat: -1,
      // A random start phase rather than an index-based stagger — with
      // tiles now entering/leaving independently there's no stable index
      // to stagger off, and this reads just as natural.
      delay: Math.random() * CYCLE,
      repeatDelay: IDLE * tile.idleScale,
    });
    if (hole) tl.set(hole, { autoAlpha: 1 }, 0);
    tl.to(mover, { x: dx, y: dy, duration, ease: "power2.inOut" }, 0).to(mover, {
      x: 0,
      y: 0,
      duration,
      ease: "power2.inOut",
      delay: SETTLE_HOLD,
    });
    if (hole) tl.set(hole, { autoAlpha: 0 });

    return () => {
      tl.kill();
      gsap.set(mover, { x: 0, y: 0 });
      if (hole) gsap.set(hole, { autoAlpha: 0 });
    };
    // cellSize only ever changes at a breakpoint crossing, at which point a
    // full layout() replaces every tile anyway (fresh mount, fresh effect).
  }, [tile.animate, tile.durationScale, tile.idleScale, cellSize]);

  return (
    <div ref={rootRef} style={{ opacity: tile.status === "entering" ? 0 : 1 }}>
      {tile.animate && (
        // The source cell: invisible at rest (the real photo shows through
        // untouched), revealed as a soft, lighter cell — via the timeline
        // above — for exactly as long as its photo fragment is away being
        // carried by the moving tile below.
        <div
          ref={holeRef}
          className="absolute border border-white/25 bg-white/25 opacity-0"
          style={{ left: tile.left, top: tile.top, width: cellSize, height: cellSize }}
        />
      )}
      {/* The mover div is what GSAP translates for animated tiles — its own
          background (when set) is the photo slice, so that fragment
          travels along with it instead of a highlight sliding over a photo
          that stays put. Exactly `cellSize` square, snapped to the same
          col/row grid the lines are drawn on. */}
      <div
        ref={moverRef}
        className="absolute"
        style={{
          left: tile.left,
          top: tile.top,
          width: cellSize,
          height: cellSize,
          backgroundImage: tile.bg?.image,
          backgroundSize: tile.bg?.size,
          backgroundPosition: tile.bg?.position,
        }}
      >
        {/* Resting tint. */}
        <div className="absolute inset-0 bg-white/10" />
        {/* Hover-trail glow: 0 at rest, GSAP fades it in/out per the
            pointer-tracking effect in the parent. */}
        <div data-glow={tile.key} className="absolute inset-0 bg-white/60 opacity-0" />
      </div>
    </div>
  );
}
