"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCursor } from "@/components/motion/CustomCursor";
import ScrambleText from "@/components/motion/ScrambleText";
import type { GalleryNodeEntry } from "@/components/gallery/GalleryNode";

// Matches the CSS transition-duration below — the safety net that unmounts
// after the fade-out finishes, same idiom as PageTransition's FADE_MS.
const FADE_MS = 200;

type GalleryLightboxProps = {
  entry: GalleryNodeEntry | null;
  onClose: () => void;
};

/**
 * Click-to-enlarge overlay. Keeps its own `renderedEntry` copy so it can
 * play a fade-out before actually clearing (the parent's `entry` only goes
 * null once `onClose` fires, which this component delays until the fade
 * finishes) — same closing choreography as PageTransition.tsx.
 */
export default function GalleryLightbox({ entry, onClose }: GalleryLightboxProps) {
  const { setState } = useCursor();
  const [previousEntry, setPreviousEntry] = useState<GalleryNodeEntry | null>(null);
  const [renderedEntry, setRenderedEntry] = useState<GalleryNodeEntry | null>(null);
  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);
  const closeTimeoutRef = useRef<number | undefined>(undefined);

  // Adjust state during render (React's own recommended pattern for "a prop
  // changed" — see PageTransition.tsx for the same idiom) rather than in an
  // effect, so a newly-opened entry is reflected in the same commit instead
  // of a frame later.
  if (entry && entry !== previousEntry) {
    setPreviousEntry(entry);
    setRenderedEntry(entry);
    setVisible(false);
  }

  // Runs exactly once per genuine new open (keyed on renderedEntry's
  // identity alone — NOT visible, and deliberately NOT setState even
  // though it's used below). closingRef/visible both go through this same
  // "renderedEntry truthy, visible false" shape while a close is *also* in
  // progress (handleClose sets visible false while renderedEntry is still
  // set, until the timeout clears it) — keying this on `visible` or on
  // useCursor's setState (a new function identity every unrelated cursor
  // change elsewhere on the page) made it re-fire mid-close, stomping the
  // close timeout and flipping visible back to true. That was the bug
  // where closing silently did nothing.
  useEffect(() => {
    if (!renderedEntry) return;
    closingRef.current = false;
    window.clearTimeout(closeTimeoutRef.current);
    // Whatever node was last hovered may have left the cursor stuck in
    // "caption" state (dot hidden, caption bubble under this overlay's
    // z-index) — reset it so the cursor is visible over the enlarged photo.
    setState("default");
    // setState is a new function identity on every CustomCursorProvider
    // render, but every version calls the same stable underlying setState
    // setters, so it's safe to omit; including it would re-run this reset
    // on unrelated cursor changes elsewhere on the page (see comment above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderedEntry]);

  // Deferred one frame so the element first paints at opacity-0, then
  // transitions to opacity-100 — flipping straight to visible in the same
  // render as the mount above would skip the CSS transition entirely.
  // Guarded on closingRef too: a close also produces "renderedEntry truthy,
  // visible false" (until the timeout clears renderedEntry), and without
  // this guard that transition looked identical to a fresh open, so this
  // would immediately flip visible back to true and cancel the fade-out.
  useEffect(() => {
    if (!renderedEntry || visible || closingRef.current) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [renderedEntry, visible]);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    closeTimeoutRef.current = window.setTimeout(() => {
      setRenderedEntry(null);
      // Without this, reopening the very same photo later would compare
      // equal to `previousEntry` (same object reference) and silently no-op.
      setPreviousEntry(null);
      onClose();
    }, FADE_MS + 50);
  }, [onClose]);

  // Escape closes regardless of focus — unlike ClassFilterDropdown's
  // focused-container onKeyDown, a canvas of draggable nodes has no
  // guaranteed focus target, so this listens at the document level.
  useEffect(() => {
    if (!entry) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [entry, handleClose]);

  // Same click-outside idiom as GalleryGrid/ClassFilterDropdown: a data
  // attribute on the content wrapper plus closest(), not a ref containment
  // check.
  useEffect(() => {
    if (!entry) return;
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-gallery-lightbox-content]")) handleClose();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [entry, handleClose]);

  if (!renderedEntry) return null;

  // Portaled straight into <body>, outside ScrollSmoother's transformed
  // #smooth-content wrapper (same reason CustomCursor's dot/caption live
  // there — see CustomCursor.tsx) — without this, `fixed` here is
  // contained by that transformed ancestor instead of the real viewport,
  // which is what caused the enlarged photo to clip behind other nodes.
  return createPortal(
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center bg-black/50 transition-opacity duration-200 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        data-gallery-lightbox-content
        className="relative flex max-h-[80vh] max-w-[80vw] flex-col items-center"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="absolute -top-9 right-0 font-mono text-sm font-bold text-white/70 transition-colors hover:text-white"
        >
          CLOSE ✕
        </button>
        {renderedEntry.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={renderedEntry.image}
            alt={renderedEntry.caption}
            className="max-h-[80vh] max-w-[80vw] object-contain"
          />
        ) : null}
        <ScrambleText
          key={renderedEntry.slug}
          as="p"
          trigger="immediate"
          text={renderedEntry.caption}
          className="mt-4 font-mono text-sm font-bold text-white"
        />
      </div>
    </div>,
    document.body,
  );
}
