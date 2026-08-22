// Coarse-pointer check for touch devices — mirrors the same media query
// CustomCursor uses to bail out of pointer-tracking. Client-only (relies on
// matchMedia); callers must only invoke this inside effects/handlers, never
// during render, to stay SSR-safe.
export function isCoarsePointer(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}
