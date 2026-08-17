// Shared mobile/desktop split for the GSAP scroll-jacking systems
// (SnapScrollContainer, Pillars, WhyRush) — matches Tailwind's `md`
// breakpoint (768px) so JS-driven behavior and CSS layout agree on the
// same cutoff. Client-only (relies on matchMedia); callers must only
// invoke this inside effects, never during render, to stay SSR-safe.
export function isMobileViewport(): boolean {
  return window.matchMedia("(max-width: 767px)").matches;
}
