"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function SnapScrollContainer({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const smoother = ScrollSmoother.create({
      wrapper: wrapperRef.current!,
      content,
      smooth: 0.8,
      effects: false,
      normalizeScroll: false,
    });

    // Computes fresh every time it's called, rather than once at trigger-
    // creation time — Pillars/WhyRush's own pin geometry (and thus the
    // page's total scroll height) can still be settling shortly after
    // mount (fonts swapping, layout not yet final), so a snapshot taken
    // once easily races that and goes stale. Reading live DOM at the
    // moment the user actually stops scrolling sidesteps the race
    // entirely instead of trying to time a rebuild around it.
    function getSnapPoints(): number[] {
      const sections = Array.from(content!.querySelectorAll<HTMLElement>("[data-snap-section]"));
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (maxScroll <= 0) return [0];

      return sections.map((section) => {
        // GSAP's `pin: true` wraps a pinned section in a `.pin-spacer` div
        // and sets the section itself to `position: fixed`, which zeroes
        // out its own `offsetTop` — the spacer holds the section's real
        // document position, so read from it when present.
        const positionedEl =
          section.parentElement?.classList.contains("pin-spacer")
            ? section.parentElement
            : section;
        return gsap.utils.clamp(0, 1, positionedEl.offsetTop / maxScroll);
      });
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
          const points = getSnapPoints();
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

    return () => {
      snapTrigger.kill();
      smoother.kill();
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
