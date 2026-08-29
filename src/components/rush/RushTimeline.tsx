"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RushEventCard, { type RushEvent } from "@/components/rush/RushEventCard";
import { isMobileViewport } from "@/lib/isMobileViewport";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

// Matches the Figma mock's own numbers: 190px-tall cards, a single spine
// line running through the 32px gap between the "up" and "down" bands.
const CARD_H = 190;
const BAND_GAP = 32;
const TRACK_H = CARD_H * 2 + BAND_GAP;
const LINE_TOP = CARD_H + BAND_GAP / 2;

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
      className="flex min-h-screen flex-col justify-center gap-10 overflow-hidden bg-[#fafafa] px-6 pt-24 pb-10 md:h-screen md:px-[80px] md:pt-0 md:pb-0"
    >
      <div className="flex w-full flex-col items-start gap-2">
        <p className="font-sans text-2xl font-bold text-black md:text-[30px]">
          (&nbsp;&nbsp;&nbsp;&nbsp;FALL 2026 RUSH SCHEDULE&nbsp;&nbsp;&nbsp;&nbsp;)
        </p>
        <p className="font-sans text-base font-medium text-black">{applicationsDue}</p>
        {/* No arrow — matches the Figma "Apply Now" button exactly (plain
            navy block), unlike the arrow-suffixed Button used for nav CTAs. */}
        <Link
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex w-fit bg-navy px-5 py-2.5 font-mono text-base text-white"
        >
          Apply Now
        </Link>
      </div>

      <div
        ref={trackRef}
        className="relative flex w-max items-start gap-16 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory md:overflow-visible md:pb-0 md:snap-none"
        style={{ height: TRACK_H }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-[2px] bg-black/25"
          style={{ top: LINE_TOP }}
        />
        {events.map((event, i) => (
          <div
            key={event.slug}
            className="w-[678px] shrink-0 snap-center"
            style={{ marginTop: i % 2 === 0 ? 0 : CARD_H + BAND_GAP }}
          >
            <RushEventCard event={event} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
