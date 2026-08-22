"use client";

import { createPortal } from "react-dom";
import ScrambleText from "@/components/motion/ScrambleText";

/**
 * Fixed bottom label naming the album/event the centered photos belong to.
 * Portal-rendered to `document.body` because ScrollSmoother applies a CSS
 * transform to the page content on desktop, which would otherwise turn a
 * `position: fixed` element here into one fixed to that transformed
 * ancestor instead of the real viewport. Portals don't participate in
 * hydration diffing at their target, so guarding on `document` existing
 * (rather than an effect-driven "mounted" flag) is enough to stay SSR-safe.
 */
export default function AlbumTag({ album }: { album: string | null }) {
  if (typeof document === "undefined" || !album) return null;

  return createPortal(
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-navy/90 px-4 py-2 font-mono text-xs font-bold tracking-wide text-white">
      <ScrambleText key={album} text={album} trigger="immediate" />
    </div>,
    document.body
  );
}
