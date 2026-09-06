"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import RushEventCard, { type RushEvent } from "@/components/rush/RushEventCard";
import { isMobileViewport } from "@/lib/isMobileViewport";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

// Cards were shrunk from the Figma mock's original 190px so the section
// could take on real bottom padding (see the section className below) and
// still fit one screen — RushEventCard's own height classes are sized to
// match this same constant.
const CARD_H = 160;
const BAND_GAP = 32;
const TRACK_H = CARD_H * 2 + BAND_GAP;
const LINE_TOP = CARD_H + BAND_GAP / 2;

// Hardcoded to the first event for now — there's no real "today vs each
// event's date" progress logic yet, so this just shows where that fill
// would sit once we're actually partway through the schedule.
const CURRENT_EVENT_INDEX = 0;

type RushTimelineProps = {
  events: RushEvent[];
  applicationsDue: string;
  applyUrl: string;
};

/**
 * The Figma frame (node 3192:4412) puts the title block and the card
 * track inside the SAME full-viewport frame — the title is absolutely
 * positioned over the top of it, not pushed above in normal flow — so the
 * title stays on screen the whole time and the cards travel underneath
 * it. Structured here the same way Pillars.tsx is on the home page: one
 * full-height `<section>` is both the pin trigger AND holds the title, so
 * the pin's "top top" engages the instant the section (title included)
 * reaches the top of the viewport, with no header-block dead zone before
 * the horizontal traverse starts, and the pinned state fills the screen
 * (no empty space below the cards). Only the card track itself
 * translates horizontally — the title never moves.
 */
export default function RushTimeline({ events, applicationsDue, applyUrl }: RushTimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const eventImageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressLineRef = useRef<HTMLDivElement>(null);

  // Each card fades/slides up the moment IT actually becomes visible on
  // screen, rather than all of them at once the moment the section scrolls
  // into view — the latter meant cards 2+ were already fully revealed
  // before the horizontal scrub ever brought them on screen. A plain
  // IntersectionObserver (not a ScrollTrigger) works for both the desktop
  // pin/scrub (cards move via transform, which IntersectionObserver still
  // tracks against the real viewport) and mobile's native horizontal swipe
  // (its default root correctly accounts for clipping by that scrollable
  // ancestor) with one shared implementation.
  useIsomorphicLayoutEffect(() => {
    const cards = cardRefs.current;
    if (!cards.length) return;

    gsap.set(cards, { autoAlpha: 0, y: 40 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          gsap.to(entry.target, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [events]);

  // Sizes the blue progress fill to the CURRENT_EVENT_INDEX card's real
  // image-box position — measured off the actual DOM rather than a
  // hardcoded pixel guess, the same rect-diffing approach History.tsx uses,
  // so it stays correct regardless of card width/gap changes. Runs
  // independent of the desktop pin/mobile-swipe split above: both share the
  // same untransformed track layout, so one measurement covers both.
  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    const progressLine = progressLineRef.current;
    const targetImage = eventImageRefs.current[CURRENT_EVENT_INDEX];
    if (!track || !progressLine || !targetImage) return;

    function measure() {
      const trackRect = track!.getBoundingClientRect();
      const imageRect = targetImage!.getBoundingClientRect();
      gsap.set(progressLine, { width: imageRect.right - trackRect.left });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [events]);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Below `md`, the pinned scroll-jack is skipped — the track is a plain
    // `overflow-x-auto` strip instead (see className) so touch users swipe
    // it directly, same tradeoff as Pillars.tsx.
    let cleanupDesktop: (() => void) | undefined;
    let isDesktopActive = false;

    function setupDesktop() {
      const visibleWidth = () => {
        const style = getComputedStyle(section!);
        const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        return section!.clientWidth - paddingX;
      };

      if (track!.scrollWidth - visibleWidth() <= 0) return;

      const tween = gsap.to(track, {
        x: () => -(track!.scrollWidth - visibleWidth()),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${track!.scrollWidth - visibleWidth()}`,
          scrub: true,
          pin: true,
          // GSAP silently disables its automatic pin-spacing whenever the
          // pinned element's parent is `display: flex` — RushPage renders
          // this section as a flex child of the page body. Without this,
          // ScrollTrigger still computes a correct start/end internally
          // but never reserves that extra scroll distance in the page, so
          // the pin releases almost immediately instead of holding
          // through the full horizontal traverse.
          pinSpacing: true,
        },
      });

      cleanupDesktop = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { clearProps: "transform" });
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
    <section
      ref={sectionRef}
      data-snap-section
      className="flex min-h-screen flex-col overflow-hidden bg-[#fafafa] px-6 pt-20 pb-10 md:h-screen md:px-[80px] md:pt-[110px] md:pb-16"
    >
      <div className="flex w-full flex-col items-start gap-2">
        <p className="font-sans text-2xl font-bold text-black md:text-[30px]">
          (&nbsp;&nbsp;&nbsp;&nbsp;FALL 2026 RUSH SCHEDULE&nbsp;&nbsp;&nbsp;&nbsp;)
        </p>
        <p className="font-sans text-base font-medium text-black">{applicationsDue}</p>
        {/* Same flip-up hover as the nav's Rush Now button, just without its
            arrow — arrow={false} covers that instead of a bespoke plain link. */}
        <Button
          href={applyUrl}
          variant="dark"
          arrow={false}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 w-fit"
        >
          Apply Now
        </Button>
      </div>

      {/* flex-1 + justify-center so the track centers in whatever space is
          actually left below the header (which keeps its own fixed
          position above), instead of sitting flush under a fixed gap and
          leaving all the leftover space stranded below it. */}
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <div
          ref={trackRef}
          className="relative flex w-max items-start gap-16 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory md:overflow-visible md:pb-0 md:snap-none"
          style={{ height: TRACK_H }}
        >
          {/* Gray for the whole schedule, with a blue fill on top showing
              progress up to the current event (see the measurement effect
              above) — starts at width 0 so there's no flash of a full-width
              fill before that effect measures and sets the real value. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 h-[2px] bg-black/15"
            style={{ top: LINE_TOP }}
          />
          <div
            ref={progressLineRef}
            aria-hidden
            className="pointer-events-none absolute left-0 h-[2px] bg-[#2e5b99]"
            style={{ top: LINE_TOP, width: 0 }}
          />
          {events.map((event, i) => (
            <div
              key={event.slug}
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              className="w-[678px] shrink-0 snap-center"
              style={{ marginTop: i % 2 === 0 ? 0 : CARD_H + BAND_GAP }}
            >
              <RushEventCard
                event={event}
                index={i}
                imageRef={(el) => {
                  eventImageRefs.current[i] = el;
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
