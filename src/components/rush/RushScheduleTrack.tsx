"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RushEventCard, { type RushEvent } from "@/components/rush/RushEventCard";
import { scramble } from "@/components/motion/ScrambleText";
import { isMobileViewport } from "@/lib/isMobileViewport";

gsap.registerPlugin(ScrollTrigger);

// Distance from the column's own right edge to the line/dots — cards
// (and the fixed-height desktop card box) are margined the same amount
// (mr-16, below) so they never run under it.
const LINE_INSET = 32;

const LINE_GRAY = "#d1d5db"; // gray-300 — the "not reached yet" color.
const LINE_NAVY = "#0a1d37"; // navy — same as the card titles/text.

// Desktop-only: how much scroll distance the whole pinned reveal takes —
// mirrors WhyRush's own per-card step distance (400px + a 300px base),
// scaled to Rush's own event count instead of hardcoding 5. The
// crossfading card box's actual height lives only in the JSX below
// (md:h-[420px]) and is measured live off the DOM in setupDesktop()
// rather than duplicated as a second number here.
const STEP_PX = 350;
const BASE_PX = 300;

type Point = { x: number; y: number };

function buildStraightPath(points: Point[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

type RushScheduleTrackProps = {
  events: RushEvent[];
  // The whole two-column section — pinned as one block on desktop (see
  // the setupDesktop() effect below) so the header beside this stays in
  // view for free without needing its own separate pin.
  sectionRef: RefObject<HTMLDivElement | null>;
};

export default function RushScheduleTrack({ events, sectionRef }: RushScheduleTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardBoxRef = useRef<HTMLDivElement>(null);
  const pathBgRef = useRef<SVGPathElement>(null);
  const pathFgRef = useRef<SVGPathElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // Two overlapping paths sharing the same "d" rather than one path whose
  // color is tweened directly — a `stroke` color tween would recolor the
  // WHOLE line at once, not sweep down it. pathBg is gray, drawn once,
  // always fully visible ("the line is already there"). pathFg is navy,
  // drawn on top of it with the exact same shape, and reveals via
  // stroke-dashoffset as the user scrolls — visually identical to the
  // gray line "becoming" navy from the top down. Dots get the same
  // gray→navy treatment directly on their own `fill`, no second circle
  // needed since a flat fill swap doesn't have the sweep problem a
  // stroke recolor would.
  //
  // A plain useEffect, not useIsomorphicLayoutEffect — sectionRef
  // belongs to RushTimeline, the PARENT of this component, and refs
  // attach (then layout effects fire) bottom-up: children before
  // parents. A layout effect here would run before RushTimeline's own
  // <section ref={sectionRef}> has attached its ref, seeing
  // sectionRef.current as null and silently bailing out of this whole
  // effect via the guard below every time. Passive effects don't have
  // this problem — the entire tree's layout phase, ancestor ref
  // attachment included, always finishes before any passive effect
  // fires (same reasoning the old RushHeader pin relied on for reading
  // a SIBLING's ref; this is the parent-ref version of that same race).
  useEffect(() => {
    const wrapper = trackRef.current;
    const cardBox = cardBoxRef.current;
    const section = sectionRef.current;
    const pathBg = pathBgRef.current;
    const pathFg = pathFgRef.current;
    if (!wrapper || !cardBox || !section || !pathBg || !pathFg) return;

    let cleanup: (() => void) | undefined;
    let mode: "mobile" | "desktop" | null = null;

    function setDotColor(dot: SVGCircleElement, reached: boolean, animate: boolean) {
      const attr = { fill: reached ? LINE_NAVY : LINE_GRAY };
      if (animate) gsap.to(dot, { attr, duration: 0.3 });
      else gsap.set(dot, { attr });
    }

    // Below `md`, cards stack in normal document flow (see the row
    // className below) and scroll past like any other tall section —
    // this measures each row's own real position, same approach a plain
    // vertical timeline has always used here.
    function setupMobile() {
      const revealed = events.map(() => false);
      let maxProgress = 0;
      let length = 0;

      function computeAnchors(): Point[] {
        const wrapperRect = wrapper!.getBoundingClientRect();
        const x = wrapperRect.width - LINE_INSET;
        return rowRefs.current.map((row) => {
          if (!row) return { x, y: 0 };
          const rect = row.getBoundingClientRect();
          return { x, y: rect.top + rect.height / 2 - wrapperRect.top };
        });
      }

      function redraw() {
        const anchors = computeAnchors();
        const d = buildStraightPath(anchors);
        pathBg!.setAttribute("d", d);
        pathFg!.setAttribute("d", d);
        dotRefs.current.forEach((dot, i) => {
          if (!dot || !anchors[i]) return;
          dot.setAttribute("cx", String(anchors[i].x));
          dot.setAttribute("cy", String(anchors[i].y));
        });
        length = pathFg!.getTotalLength();
        gsap.set(pathFg, { strokeDasharray: length, strokeDashoffset: length * (1 - maxProgress) });
      }

      gsap.set(
        dotRefs.current.filter((d): d is SVGCircleElement => Boolean(d)),
        { attr: { fill: LINE_GRAY } },
      );
      redraw();

      const st = ScrollTrigger.create({
        trigger: wrapper,
        // "top top" (not e.g. "top 80%"), which would already be
        // satisfied at mount since the wrapper starts well within view
        // before any scrolling — see the git history on this file for
        // the exact symptom that caused (the line partially drawn in on
        // load with no scroll input at all).
        start: "top top",
        end: "bottom 60%",
        onUpdate: (self) => {
          if (self.progress <= maxProgress) return; // never un-draw on scroll-up
          maxProgress = self.progress;
          gsap.set(pathFg, { strokeDashoffset: length * (1 - maxProgress) });

          dotRefs.current.forEach((dot, i) => {
            if (!dot || revealed[i]) return;
            const threshold = events.length > 1 ? i / (events.length - 1) : 0;
            if (maxProgress < threshold) return;
            revealed[i] = true;
            setDotColor(dot, true, true);
          });
        },
      });

      window.addEventListener("resize", redraw);
      document.fonts.ready.then(redraw);
      cleanup = () => {
        window.removeEventListener("resize", redraw);
        st.kill();
      };
    }

    // At `md`+, cards overlap in one fixed-height box (md:h-[420px] in
    // the JSX below) and crossfade — the section itself pins (not just
    // this component),
    // so the header column beside it holds still for free too. Since
    // every card now occupies the exact same box, there's no per-card
    // DOM position left to anchor dots to (unlike mobile, above) — they
    // sit at fixed, evenly-spaced points down the box's own height
    // instead, indexed purely by event order.
    function setupDesktop() {
      let anchors: Point[] = [];
      let length = 0;

      function redraw() {
        const wrapperRect = wrapper!.getBoundingClientRect();
        const boxRect = cardBox!.getBoundingClientRect();
        const x = wrapperRect.width - LINE_INSET;
        const top = boxRect.top - wrapperRect.top;
        anchors = events.map((_, i) => ({
          x,
          y: top + (events.length > 1 ? (i / (events.length - 1)) * boxRect.height : boxRect.height / 2),
        }));
        const d = buildStraightPath(anchors);
        pathBg!.setAttribute("d", d);
        pathFg!.setAttribute("d", d);
        dotRefs.current.forEach((dot, i) => {
          if (!dot || !anchors[i]) return;
          dot.setAttribute("cx", String(anchors[i].x));
          dot.setAttribute("cy", String(anchors[i].y));
        });
        length = pathFg!.getTotalLength();
      }

      redraw();
      gsap.set(pathFg, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(
        dotRefs.current.filter((d): d is SVGCircleElement => Boolean(d)),
        { attr: { fill: LINE_GRAY } },
      );

      // Card 0 rests permanently in place; every later card starts
      // pushed below the box and swipes up to cover whichever one came
      // before it as scroll passes through its own dedicated step —
      // identical mechanics to WhyRush's own card crossfade. Pushed to
      // 103%, not a flush 100% — at exactly 100% a hidden card's own top
      // border sits precisely on the box's overflow-hidden clip edge,
      // and (likely sub-pixel rounding on the transform) let a hairline
      // of it bleed through above the visible card. The extra 3% clears
      // it with room to spare while still reaching exactly 0% (fully
      // in place) at the end of its own reveal — see the matching
      // `103 * (1 - localProgress)` in onUpdate below.
      gsap.set(
        rowRefs.current.slice(1).filter((r): r is HTMLDivElement => Boolean(r)),
        { yPercent: 103 },
      );

      const step = 1 / events.length;
      const totalDistance = (events.length - 1) * STEP_PX + BASE_PX;
      const scrambled = events.map(() => false);

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${totalDistance}`,
        pin: true,
        onUpdate: (self) => {
          const progress = self.progress;

          rowRefs.current.forEach((row, i) => {
            if (i === 0 || !row) return;
            const localProgress = gsap.utils.clamp(0, 1, (progress - (i - 1) * step) / step);
            gsap.set(row, { yPercent: 103 * (1 - localProgress) });
            if (localProgress > 0 && !scrambled[i]) {
              scrambled[i] = true;
              const el = titleRefs.current[i];
              if (el) scramble(el, events[i].title);
            }
          });

          gsap.set(pathFg, { strokeDashoffset: length * (1 - progress) });
          dotRefs.current.forEach((dot, i) => {
            if (!dot) return;
            const threshold = events.length > 1 ? i / (events.length - 1) : 0;
            setDotColor(dot, progress >= threshold, false);
          });
        },
      });

      window.addEventListener("resize", redraw);
      document.fonts.ready.then(() => {
        redraw();
        ScrollTrigger.refresh();
      });
      cleanup = () => {
        window.removeEventListener("resize", redraw);
        st.kill();
        gsap.set(
          rowRefs.current.filter((r): r is HTMLDivElement => Boolean(r)),
          { clearProps: "transform" },
        );
      };
    }

    function sync() {
      const nextMode = isMobileViewport() ? "mobile" : "desktop";
      if (nextMode === mode) return;
      cleanup?.();
      cleanup = undefined;
      mode = nextMode;
      if (nextMode === "desktop") setupDesktop();
      else setupMobile();
    }

    sync();
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      cleanup?.();
    };
  }, [events, sectionRef]);

  return (
    <div ref={trackRef} className="relative w-full flex-1">
      {/* overflow-visible: SVGs clip to their own box by default, same as
          `overflow: hidden` on a div — without this, a dot anchored right
          at the wrapper's own edge has its far half clipped off instead
          of sitting fully visible there. */}
      <svg
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        aria-hidden
      >
        <path ref={pathBgRef} stroke={LINE_GRAY} strokeWidth={2} fill="none" />
        <path ref={pathFgRef} stroke={LINE_NAVY} strokeWidth={2} fill="none" />
        {events.map((event, i) => (
          <circle
            key={event.slug}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            r={6}
            fill={LINE_GRAY}
          />
        ))}
      </svg>

      {/* mr-16 reserves the margin LINE_INSET draws the line and dots
          into. md:h-[420px] only matters at `md`+, where every row below
          is absolutely stacked inside it — below
          that it's just a plain flex column and rows keep their normal
          document height. */}
      <div
        ref={cardBoxRef}
        className="relative z-10 mr-16 flex flex-col gap-6 md:h-[420px] md:overflow-hidden"
      >
        {events.map((event, i) => (
          <div
            key={event.slug}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            className="static md:absolute md:inset-0"
          >
            <RushEventCard
              event={event}
              index={i}
              titleRef={(el) => {
                titleRefs.current[i] = el;
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
