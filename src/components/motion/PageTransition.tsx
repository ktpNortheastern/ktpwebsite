"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ScrambleText from "@/components/motion/ScrambleText";

const ROUTE_LABELS: Record<string, string> = {
  "/": "HOME",
  "/members": "MEMBERS",
  "/gallery": "GALLERY",
  "/faq": "FAQ",
  "/rush": "RUSH",
};

function labelFor(pathname: string) {
  return ROUTE_LABELS[pathname] ?? (pathname.replace(/^\/|\/$/g, "").toUpperCase() || "HOME");
}

// Safety net only — the real reveal trigger is ScrambleText's onComplete
// below. This exists purely so an interrupted/erroring decode (a
// throttled background tab, a thrown error mid-render) can never leave
// the cover stuck on screen.
const SAFETY_MS = 2000;
// Matches the CSS transition-duration below — used to schedule the
// unmount after the fade-out finishes, so it's a backup for `transitionend`
// rather than a duplicate of the fade timing driving anything visible.
const FADE_MS = 300;

/**
 * A cover-and-reveal transition, not a navigation-blocking one: by the
 * time this shows anything, Next has already swapped in the destination
 * page's DOM and its own effects (ScrollSmoother/ScrollTrigger setup in
 * Pillars/WhyRush, NavBar's wordmark) are already running underneath.
 * This only ever sits on top, cosmetically, and never touches scroll or
 * pointer events on the real page — so it can't fight or delay any of
 * that init. Lives in the root layout so it persists across navigations
 * instead of remounting per page.
 */
export default function PageTransition() {
  const pathname = usePathname();
  const [previousPathname, setPreviousPathname] = useState(pathname);
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(true);
  const [decodeKey, setDecodeKey] = useState(0);

  // Adjusting state during render (not inside an effect) when a prop
  // changes is the pattern React itself recommends for this — storing the
  // last-seen pathname in state and comparing on every render means a
  // mismatch is "this render was caused by a navigation," which React
  // resolves with one more render before ever committing to the DOM.
  // Doing this in an effect instead would mean the cover mounts a frame
  // after the destination page already painted.
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setMounted(true);
    setRevealed(false);
    setDecodeKey((k) => k + 1);
  }

  useEffect(() => {
    if (!mounted || revealed) return;
    const safety = window.setTimeout(() => setRevealed(true), SAFETY_MS);
    return () => window.clearTimeout(safety);
  }, [mounted, revealed, decodeKey]);

  useEffect(() => {
    if (!revealed || !mounted) return;
    // Backup for transitionend below (e.g. `prefers-reduced-motion`
    // stripping the transition entirely in some browsers) — never the
    // primary path when the CSS transition actually plays.
    const unmount = window.setTimeout(() => setMounted(false), FADE_MS + 50);
    return () => window.clearTimeout(unmount);
  }, [revealed, mounted]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      onTransitionEnd={() => {
        // Also fires for the reverse transition (opacity snapping back to
        // 100 when a second navigation interrupts an in-progress fade-out
        // — see the pathname effect above) — only unmount on the fade-OUT
        // completing, never on a re-cover.
        if (revealed) setMounted(false);
      }}
      className={`pointer-events-none fixed inset-0 z-[300] flex items-center justify-center bg-navy transition-opacity duration-300 ease-out ${
        revealed ? "opacity-0" : "opacity-100"
      }`}
    >
      <ScrambleText
        key={decodeKey}
        as="span"
        trigger="immediate"
        text={labelFor(pathname)}
        onComplete={() => setRevealed(true)}
        className="font-mono text-3xl font-bold text-white md:text-5xl"
      />
    </div>
  );
}
