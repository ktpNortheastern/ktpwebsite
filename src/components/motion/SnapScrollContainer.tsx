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
      normalizeScroll: true,
    });

    // ScrollSmoother has no built-in `snap` option — snapping to each
    // section is done via a plain ScrollTrigger whose `snapTo` points are
    // each section's normalized scroll offset within the smoothed content.
    let snapTrigger: ScrollTrigger | undefined;

    function buildSnap() {
      snapTrigger?.kill();
      const sections = Array.from(content!.querySelectorAll<HTMLElement>("[data-snap-section]"));
      if (!sections.length) return;

      const maxScroll = content!.scrollHeight - window.innerHeight;
      const snapPoints = sections.map((section) =>
        maxScroll > 0 ? gsap.utils.clamp(0, 1, section.offsetTop / maxScroll) : 0
      );

      snapTrigger = ScrollTrigger.create({
        trigger: content,
        start: "top top",
        end: "bottom bottom",
        snap: {
          snapTo: snapPoints,
          duration: { min: 0.3, max: 0.6 },
          ease: "power1.inOut",
        },
      });
    }

    buildSnap();

    // Section offsets/scrollHeight are measured synchronously on mount,
    // before self-hosted fonts have necessarily finished swapping in and
    // reflowing the page (especially on a cold, uncached load) — rebuild
    // once fonts are actually ready so snap points and ScrollTrigger's
    // cached geometry reflect final layout, not a stale first-paint one.
    document.fonts.ready.then(() => {
      buildSnap();
      ScrollTrigger.refresh();
    });

    return () => {
      snapTrigger?.kill();
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
