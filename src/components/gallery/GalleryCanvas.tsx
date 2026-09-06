"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import GalleryNode from "@/components/gallery/GalleryNode";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import GalleryIntro from "@/components/gallery/GalleryIntro";
import {
  SLOTS,
  CONNECTOR_PATHS,
  CONNECTOR_ENDPOINTS,
  PLANE_W,
  PLANE_H,
  NODE_W,
  NODE_H,
  BUFFER_PX,
  HYSTERESIS_PX,
} from "@/lib/gallery/canvasLayout";

type GalleryFrontmatter = {
  image?: string;
  caption: string;
  order?: number;
  year?: number;
  brothers?: string[];
};

export type GalleryEntry = GalleryFrontmatter & { slug: string };

type PanOffset = { x: number; y: number };

// Per-visit shuffle of which image lands in which slot — deliberately
// random (Math.random() is fine here, unlike canvasLayout.ts's slot
// positions), and only ever run client-side (see the useEffect below) so
// it never causes a server/client hydration mismatch.
function shuffledAssignment(items: GalleryEntry[]): Map<number, GalleryEntry> {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const map = new Map<number, GalleryEntry>();
  SLOTS.forEach((slot, i) => {
    if (i < pool.length) map.set(slot.id, pool[i]);
  });
  return map;
}

function setsEqual(a: Set<number>, b: Set<number>) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

// Mounts a slot once it (plus BUFFER_PX) enters the viewport, but only
// unmounts it once it's past a bigger BUFFER_PX + HYSTERESIS_PX margin —
// standard enter/exit hysteresis so a node sitting right at the boundary
// doesn't mount/unmount every frame.
function computeVisible(
  pan: PanOffset,
  prevVisible: Set<number>,
  viewportW: number,
  viewportH: number,
): Set<number> {
  const next = new Set<number>();
  for (const slot of SLOTS) {
    const margin = BUFFER_PX + (prevVisible.has(slot.id) ? HYSTERESIS_PX : 0);
    const screenLeft = slot.x - NODE_W / 2 + pan.x;
    const screenRight = slot.x + NODE_W / 2 + pan.x;
    const screenTop = slot.y - NODE_H / 2 + pan.y;
    const screenBottom = slot.y + NODE_H / 2 + pan.y;
    if (
      screenRight >= -margin &&
      screenLeft <= viewportW + margin &&
      screenBottom >= -margin &&
      screenTop <= viewportH + margin
    ) {
      next.add(slot.id);
    }
  }
  return next;
}

function planeBounds(viewportW: number, viewportH: number) {
  return { minX: -(PLANE_W - viewportW), minY: -(PLANE_H - viewportH), maxX: 0, maxY: 0 };
}

/**
 * Drag-to-pan node-graph canvas. Replaces the old masonry GalleryGrid.
 * Draggable owns the plane's transform directly (no React involved in the
 * pan visual itself, same philosophy as CustomCursor's quickTo) — a ref
 * mirrors its live x/y, and a rAF loop recomputes the visible-slot set,
 * only touching React state when that set actually changes.
 */
export default function GalleryCanvas({ items }: { items: GalleryEntry[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<Draggable | null>(null);
  const panRef = useRef<PanOffset>({ x: 0, y: 0 });
  const assignmentRef = useRef<Map<number, GalleryEntry> | null>(null);

  const [visibleIds, setVisibleIds] = useState<Set<number>>(() => new Set());
  const [assignment, setAssignment] = useState<Map<number, GalleryEntry> | null>(null);
  const [openEntry, setOpenEntry] = useState<GalleryEntry | null>(null);

  useEffect(() => {
    setAssignment(shuffledAssignment(items));
  }, [items]);

  useEffect(() => {
    assignmentRef.current = assignment;
  }, [assignment]);

  // Lets NavBar (which has no direct visibility into this component) know
  // when the lightbox is open, so it can suppress its own hide/reveal
  // behavior — the nav should never pop back up over an enlarged photo.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("gallery-lightbox", { detail: { open: Boolean(openEntry) } }),
    );
    // Covers navigating away while the lightbox is still open (e.g. via
    // browser back/forward) — otherwise NavBar's "lightbox open" flag would
    // stay stuck true on whatever page comes next.
    return () => {
      window.dispatchEvent(new CustomEvent("gallery-lightbox", { detail: { open: false } }));
    };
  }, [openEntry]);

  useEffect(() => {
    gsap.registerPlugin(Draggable, InertiaPlugin);

    const viewport = viewportRef.current;
    const plane = planeRef.current;
    if (!viewport || !plane) return;

    const vw0 = viewport.clientWidth;
    const vh0 = viewport.clientHeight;
    // Center the plane under the viewport on first load, rather than
    // pinning to the top-left corner.
    const bounds0 = planeBounds(vw0, vh0);
    const startX = gsap.utils.clamp(bounds0.minX, bounds0.maxX, -(PLANE_W / 2 - vw0 / 2));
    const startY = gsap.utils.clamp(bounds0.minY, bounds0.maxY, -(PLANE_H / 2 - vh0 / 2));
    gsap.set(plane, { x: startX, y: startY });
    panRef.current = { x: startX, y: startY };

    function syncPan() {
      const instance = draggableRef.current;
      if (!instance) return;
      panRef.current = { x: instance.x, y: instance.y };
    }

    function handleClick(e: PointerEvent) {
      const target = e.target as HTMLElement;
      const nodeEl = target.closest<HTMLElement>("[data-slot-id]");
      if (!nodeEl) return;
      const slotId = Number(nodeEl.dataset.slotId);
      const entry = assignmentRef.current?.get(slotId);
      if (entry) setOpenEntry(entry);
    }

    const [instance] = Draggable.create(plane, {
      type: "x,y",
      inertia: true,
      bounds: bounds0,
      // Off, deliberately: Draggable's default z-index boost while
      // actively dragging was popping the plane (and every node in it)
      // above the fixed title/hint overlays.
      zIndexBoost: false,
      onDrag: syncPan,
      onThrowUpdate: syncPan,
      onDragEnd: syncPan,
      onClick: handleClick,
    });
    draggableRef.current = instance;

    function handleResize() {
      const vw = viewport!.clientWidth;
      const vh = viewport!.clientHeight;
      instance.applyBounds(planeBounds(vw, vh));
    }
    window.addEventListener("resize", handleResize);

    // Two-finger trackpad/mouse-wheel panning, in addition to click-drag —
    // moves the same Draggable-owned transform, then calls .update() so a
    // subsequent drag gesture continues from the new position instead of
    // snapping back to wherever Draggable last recorded internally.
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const vw = viewport!.clientWidth;
      const vh = viewport!.clientHeight;
      const b = planeBounds(vw, vh);
      const nextX = gsap.utils.clamp(b.minX, b.maxX, instance.x - e.deltaX);
      const nextY = gsap.utils.clamp(b.minY, b.maxY, instance.y - e.deltaY);
      gsap.set(plane, { x: nextX, y: nextY });
      instance.update();
      panRef.current = { x: nextX, y: nextY };
    }
    viewport.addEventListener("wheel", handleWheel, { passive: false });

    let raf = requestAnimationFrame(function loop() {
      const vw = viewport!.clientWidth;
      const vh = viewport!.clientHeight;
      setVisibleIds((prev) => {
        const next = computeVisible(panRef.current, prev, vw, vh);
        return setsEqual(prev, next) ? prev : next;
      });
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      viewport.removeEventListener("wheel", handleWheel);
      instance.kill();
    };
  }, []);

  // Pause panning while the lightbox is open — the overlay already
  // intercepts pointer events above the canvas, but this is a cheap extra
  // safety net.
  useEffect(() => {
    const instance = draggableRef.current;
    if (!instance) return;
    if (openEntry) instance.disable();
    else instance.enable();
  }, [openEntry]);

  return (
    <div ref={viewportRef} className="relative h-full w-full overflow-hidden bg-navy">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.25)_1px,transparent_1px)] bg-[length:16px_16px] [mask-composite:intersect] [-webkit-mask-composite:source-in] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent),linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      />
      <div
        ref={planeRef}
        className="absolute left-0 top-0"
        style={{ width: PLANE_W, height: PLANE_H }}
      >
        <svg width={PLANE_W} height={PLANE_H} className="pointer-events-none absolute left-0 top-0">
          {CONNECTOR_PATHS.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          ))}
          {CONNECTOR_ENDPOINTS.map((slot) => (
            <circle key={slot.id} cx={slot.x} cy={slot.y} r={2.5} fill="rgba(255,255,255,0.4)" />
          ))}
        </svg>
        {SLOTS.map((slot) =>
          visibleIds.has(slot.id) ? (
            <GalleryNode key={slot.id} slot={slot} entry={assignment?.get(slot.id)} />
          ) : null,
        )}
      </div>
      <GalleryIntro />
      <p className="pointer-events-none absolute inset-x-0 bottom-4 z-30 text-center font-mono text-xs text-white/50">
        Drag around to explore the Brotherhood
      </p>
      <GalleryLightbox entry={openEntry} onClose={() => setOpenEntry(null)} />
    </div>
  );
}
