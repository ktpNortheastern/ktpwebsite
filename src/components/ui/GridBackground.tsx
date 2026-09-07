"use client";

import { useEffect, useRef } from "react";

// Square size + the gap between neighboring squares (TILE - SQUARE) —
// the gap is what makes each square read as its own distinct rounded
// box instead of one continuous rounded mesh.
const TILE = 16;
const SQUARE = 13;
const RADIUS = 3;

// Capped well below solid gray (alpha 1 would be near-black) — this
// sits directly behind whatever section renders it, so it only ever
// needs to read as a faint texture in the empty space around that
// content, not compete with it. The default a caller gets if it doesn't
// pass its own `maxAlpha`.
const DEFAULT_MAX_ALPHA = 0.09;

/**
 * A matrix of light-gray rounded squares behind a section's content —
 * drawn on a canvas rather than the site's usual repeating CSS
 * radial-gradient dot pattern (see Statement.tsx/History.tsx/
 * GalleryCanvas.tsx), because those tile one identical dot forever: this
 * needed each square's own shade to vary a little from its neighbors,
 * which a single repeated background-image can't do. Every square gets
 * a base alpha from its distance from the center of its own vertical
 * "band" (an elliptical falloff, not a circular one — fading
 * independently across the width and height is what actually reaches
 * white at all four edges, not just the two nearest a circle's own
 * radius) times a random per-square jitter, so it's darkest-but-still-
 * light in the middle, fading to nothing (i.e. the page's own white/
 * #fafafa showing through) at the top, bottom, left, and right edges,
 * with no two neighboring squares ever quite matching.
 *
 * "Its own vertical band," not the section's total height — a plain
 * `min-h-screen` section (FaqPage, ProjectsSection) or one that's
 * exactly one viewport tall (ContactSection, RushTimeline) can still
 * run taller than the screen once content grows (a long FAQ list, a
 * narrow mobile viewport stacking cards). Centering the fade on the
 * whole document height would fade it out almost everywhere except one
 * spot buried in the middle of the scroll — nowhere near "the edges of
 * the screen" for a user only ever looking at one viewport-height slice
 * of it at a time. Splitting the fade into repeating viewport-height
 * bands means every screenful gets its own light-at-the-seam,
 * gray-in-the-middle cycle no matter how tall the section ends up
 * being.
 *
 * Renders a `<canvas>` sized to fill its own parent, `-z-10`'d behind
 * that parent's other content. `position: relative` on the parent is
 * only half of what that requires: it positions the canvas correctly
 * (`absolute inset-0` fills the parent instead of the nearest ancestor
 * that's positioned), but `relative` alone does NOT create a new
 * stacking context, so with nothing else establishing one on the
 * parent, `-z-10` resolves against whatever ancestor stacking context
 * IS the nearest one — which can sit above the parent's own background,
 * painting this canvas fully behind it and making it invisible despite
 * rendering correctly onto its own bitmap (confirmed the hard way: it
 * silently depended on RushTimeline's section picking up an incidental
 * `transform` from its own GSAP scroll pin — which only exists on
 * desktop — to get a stacking context "for free"; every other page this
 * mounts on, and Rush's own mobile layout, had no such transform and
 * showed nothing). The caller's parent needs `isolate` (or any other
 * property that forces its own stacking context) alongside `relative`,
 * not `relative` by itself — see RushTimeline.tsx/ContactSection.tsx/
 * ProjectsSection.tsx/faq/page.tsx for the `relative isolate` pairing.
 */
export default function GridBackground({
  maxAlpha = DEFAULT_MAX_ALPHA,
}: {
  // Rush/FAQ read fine at the default; Contact and Projects both sit
  // behind their own already-visible frosted-glass panels (see
  // ContactSection.tsx/ProjectsSection.tsx), so a noticeably lighter
  // grid there reads as texture rather than competing with those panels.
  maxAlpha?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      const rect = parent!.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // devicePixelRatio-scaled backing store, CSS-sized element — the
      // usual trick for crisp canvas output on retina displays instead
      // of a blurry 1x-resolution bitmap stretched up.
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, rect.width, rect.height);

      const cols = Math.ceil(rect.width / TILE) + 1;
      const rows = Math.ceil(rect.height / TILE) + 1;
      const cx = rect.width / 2;
      const halfW = rect.width / 2 || 1;
      // Repeats every viewport height (see the file-level comment) —
      // equal to rect.height, and so a single band, whenever the
      // section is exactly one screen tall.
      const bandHeight = Math.min(rect.height, window.innerHeight) || 1;
      const halfBand = bandHeight / 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * TILE;
          const y = row * TILE;
          const boxCx = x + SQUARE / 2;
          const boxCy = y + SQUARE / 2;

          const bandCy = (Math.floor(boxCy / bandHeight) + 0.5) * bandHeight;

          // Normalized per-axis distance (0 at center, 1 at that axis's
          // own edge) combined into one elliptical radius, then power-
          // curved so the middle stays a broad plateau of visible gray
          // rather than a single sharp peak right at dead-center.
          const dx = (boxCx - cx) / halfW;
          const dy = (boxCy - bandCy) / halfBand;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const falloff = Math.pow(Math.max(0, 1 - dist), 1.6);

          // Random jitter on top of the falloff is the actual "not
          // uniform" variation — without it every square at the same
          // distance from center would be identically shaded, reading
          // as smooth rings rather than a textured, organic matrix.
          const jitter = 0.5 + Math.random() * 0.8;
          const alpha = Math.min(maxAlpha, maxAlpha * falloff * jitter);
          if (alpha <= 0.003) continue;

          ctx!.fillStyle = `rgba(15, 23, 42, ${alpha})`;
          ctx!.beginPath();
          ctx!.roundRect(x, y, SQUARE, SQUARE, RADIUS);
          ctx!.fill();
        }
      }
    }

    draw();

    // A ResizeObserver on the parent itself, not a window "resize"
    // listener — several callers' sections can change height from their
    // own content (a long FAQ list, fonts swapping in, mobile stacking)
    // with no window resize involved at all, and a stale canvas size
    // would leave the pattern cut off or stretched relative to the
    // section's real, current bounds.
    const observer = new ResizeObserver(() => draw());
    observer.observe(parent);
    return () => observer.disconnect();
  }, [maxAlpha]);

  return (
    <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10" />
  );
}
