"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { isMobileViewport } from "@/lib/isMobileViewport";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function SnapScrollContainer({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    // Below `md`, section snap + ScrollSmoother are skipped entirely — see
    // the mobile responsiveness plan: fixed-h-screen snap math doesn't
    // survive mobile's wrapped/stacked content or address-bar viewport
    // changes, so mobile gets plain native scrolling instead of a
    // degraded version of the desktop system. #smooth-wrapper has no
    // positioning by default (see globals.css); `smoother-active` is only
    // added once ScrollSmoother actually initializes below. Re-checked on
    // resize/orientation change so crossing the breakpoint (e.g. rotating
    // a tablet) tears down or spins up the desktop system as needed,
    // rather than locking in whatever was true at first mount.
    let cleanupDesktop: (() => void) | undefined;
    let isDesktopActive = false;

    function setupDesktop() {
      wrapper!.classList.add("smoother-active");

      const smoother = ScrollSmoother.create({
        wrapper: wrapper!,
        content: content!,
        smooth: 0.8,
        effects: false,
        normalizeScroll: true,
      });

      // Computes fresh every time it's called, rather than once at trigger-
      // creation time — Pillars/WhyRush's own pin geometry (and thus the
      // page's total scroll height) can still be settling shortly after
      // mount (fonts swapping, layout not yet final), so a snapshot taken
      // once easily races that and goes stale. Reading live DOM at the
      // moment the user actually stops scrolling sidesteps the race
      // entirely instead of trying to time a rebuild around it.
      //
      // Also returns each pinned section's full scrub range (as fractions),
      // not just its entry point — Pillars' horizontal scroll and Why Rush's
      // step reveal are both driven by the user continuing to scroll through
      // their pin, and naively snapping to the "nearest section" on every
      // pause would yank them out mid-scrub before that finishes.
      function getSnapInfo() {
        const sections = Array.from(content!.querySelectorAll<HTMLElement>("[data-snap-section]"));
        const maxScroll = ScrollTrigger.maxScroll(window);
        if (maxScroll <= 0) return { points: [0], pinnedRanges: [] as [number, number][] };

        // Pages with no `[data-snap-section]` markers at all (e.g. a plain
        // content page like FAQ) aren't opting into section-snap — falling
        // through to the code below would leave `points` holding only the
        // trailing `1` pushed for the footer, which forces every scroll to
        // settle at the very bottom of the page. `null` here tells the
        // snapTo callback to leave scrolling unsnapped instead.
        if (sections.length === 0) return { points: null, pinnedRanges: [] as [number, number][] };

        const points: number[] = [];
        const pinnedRanges: [number, number][] = [];
        const allTriggers = ScrollTrigger.getAll();

        for (const section of sections) {
          // GSAP's `pin: true` wraps a pinned section in a `.pin-spacer` div
          // and sets the section itself to `position: fixed`, which zeroes
          // out its own `offsetTop` — the spacer holds the section's real
          // document position so read from it when present.
          const spacer = section.parentElement?.classList.contains("pin-spacer")
            ? section.parentElement
            : null;
          const positionedEl = spacer ?? section;
          const start = gsap.utils.clamp(0, 1, positionedEl.offsetTop / maxScroll);
          points.push(start);
          if (spacer) {
            // Deliberately NOT spacer.offsetTop + spacer.offsetHeight: the
            // spacer's height reserves room for both the pin's scrub distance
            // AND the pinned element's own rendered height, so that sum always
            // lands at the START of the NEXT section — overshooting the pin's
            // real release point by about one viewport height. The section's
            // own ScrollTrigger already knows its real release point (`end`,
            // in the same window-scroll pixel space as maxScroll), so read it
            // directly instead of re-deriving it from spacer geometry.
            const ownTrigger = allTriggers.find((t) => t.trigger === section && t.pin);
            const end = ownTrigger
              ? gsap.utils.clamp(0, 1, ownTrigger.end / maxScroll)
              : start;
            pinnedRanges.push([start, end]);
          }
        }

        // Footer renders after the last `[data-snap-section]` (FAQ preview)
        // but isn't one itself, so without an explicit point here the
        // snap range covering it (end: "max" below) has no valid resting
        // spot inside the footer — any pause there finds FAQ's start as
        // the nearest known point and gets pulled back up out of it.
        points.push(1);

        return { points, pinnedRanges };
      }

      // ScrollSmoother has no built-in `snap` option — snapping to each
      // section is done via a plain ScrollTrigger whose `snapTo` points are
      // each section's normalized scroll offset within the smoothed content.
      const snapTrigger = ScrollTrigger.create({
        trigger: content,
        start: "top top",
        end: "max",
        snap: {
          snapTo: (value) => {
            const { points, pinnedRanges } = getSnapInfo();
            if (!points) return value;

            // Inside a pin's own scrub range (not just at its very start) —
            // don't snap, let the pin's scroll-driven animation keep going.
            for (const [start, end] of pinnedRanges) {
              if (value > start && value < end) return value;
            }

            let closest = points[0];
            let min = Infinity;
            for (const point of points) {
              const dist = Math.abs(point - value);
              if (dist < min) {
                min = dist;
                closest = point;
              }
            }
            return closest;
          },
          duration: { min: 0.3, max: 0.6 },
          ease: "power1.inOut",
        },
      });

      // Section offsets/scrollHeight are measured on mount, before self-
      // hosted fonts have necessarily finished swapping in and reflowing the
      // page (especially on a cold, uncached load) — refresh once fonts are
      // actually ready so every trigger's cached geometry (including the
      // pins' pin-spacers that getSnapPoints reads from) reflects final
      // layout, not a stale first-paint one.
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });

      cleanupDesktop = () => {
        snapTrigger.kill();
        smoother.kill();
        wrapper!.classList.remove("smoother-active");
      };
    }

    function sync() {
      const shouldBeDesktop = !isMobileViewport();
      if (shouldBeDesktop === isDesktopActive) return;

      cleanupDesktop?.();
      cleanupDesktop = undefined;
      isDesktopActive = shouldBeDesktop;
      if (shouldBeDesktop) setupDesktop();
    }

    sync();
    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("resize", sync);
      cleanupDesktop?.();
    };
  }, []);

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
