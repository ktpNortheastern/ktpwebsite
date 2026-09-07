"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMobileViewport } from "@/lib/isMobileViewport";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

// The hero photo — DELTA INITIATION, matching the first of the 7 numbered
// photos this reel is built around (hero + the 6 satellites below).
const HERO_IMAGE = "/images/uploads/img-03.jpg";

// One entry per satellite photo — tilt (deg) plus its rest-state position as
// a fraction of viewport width/height, relative to screen center (negative
// x = left, negative y = up). Three left / three right (large |xVw|, spread
// across top/mid/bottom) so the hero has clear breathing room on both
// sides — but each one's tilt/x/y is nudged off a clean diagonal (tilt signs
// flip unevenly, x/y jitter independently) so the two sides read as loosely
// scattered rather than two uniform straight lines. Add/remove entries to
// change how many satellites render; nothing else needs updating.
const SATELLITE_CONFIG: { tilt: number; xVw: number; yVh: number; image: string }[] = [
  { tilt: -14, xVw: -37, yVh: -29, image: "/images/uploads/gallery-88.jpg" }, // KTP x Generate
  { tilt: 9, xVw: -41, yVh: 1, image: "/images/uploads/gallery-04.jpg" }, // Rush Event!
  { tilt: -5, xVw: -27, yVh: 33, image: "/images/uploads/gallery-07.jpg" }, // Merch Dropp
  { tilt: 13, xVw: 40, yVh: -21, image: "/images/uploads/gallery-11.jpg" }, // Beta Girls!
  { tilt: -10, xVw: 31, yVh: 9, image: "/images/uploads/gallery-30.jpg" }, // Zach and Maddy and Ife
  { tilt: 6, xVw: 36, yVh: 35, image: "/images/uploads/gallery-77.jpg" }, // Our Letters!
];

// Rest-state scale — the hero starts noticeably bigger than the satellites
// so it visually reads as "the main photo" at rest, not just another
// scattered one.
const HERO_REST_SCALE = 0.62;
const SATELLITE_REST_SCALE = 0.28;

// First half of the resolve phase pushes the size contrast further apart —
// hero grows past its final size, satellites shrink smaller still — before
// the second half brings both back to 1 (their shared true size, see
// computeReelSize) right as the row resolves into a uniform filmstrip.
const HERO_PEAK_SCALE = 1.15;
const SATELLITE_TROUGH_SCALE = 0.12;

// Diverge (0 -> 0.5) from `from` to `peak`, then converge (0.5 -> 1) from
// `peak` to `to` — used for both the hero (peak > rest) and satellites
// (peak < rest) so they visibly move apart before settling to the same
// final size together.
function diamondScale(from: number, peak: number, to: number, t: number) {
  return t < 0.5
    ? gsap.utils.interpolate(from, peak, t / 0.5)
    : gsap.utils.interpolate(peak, to, (t - 0.5) / 0.5);
}

// Same box size for every photo (hero included) — the whole point of the
// resolved reel is a sequence of equal-size photos, not one big hero next
// to a row of small thumbnails. Computed in JS (not a CSS aspect-ratio
// class) so the exact same pixel size can be measured and reused for the
// FLIP-style rest-position math below. Capped on both axes — width so it
// never gets edge-to-edge, height so it clears the fixed nav bar with room
// to spare and always leaves the dotted background visible around it.
function computeReelSize() {
  const maxW = window.innerWidth * 0.85;
  const maxH = window.innerHeight * 0.68;
  // Matches the aspect-[3/2] on the hero/satellite boxes below, which
  // this must stay in sync with since it's what the resolved-reel FLIP
  // math actually measures against. object-cover on those boxes crops
  // (rather than letterboxes) whichever photos don't already come in
  // this ratio, so every photo still reads as a clean landscape frame
  // instead of leaving some at their own native crop.
  const ratio = 3 / 2;
  let width = maxW;
  let height = width / ratio;
  if (height > maxH) {
    height = maxH;
    width = height * ratio;
  }
  return { width, height };
}

export default function History() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const satelliteRefs = useRef<HTMLDivElement[]>([]);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const hero = heroRef.current;
    const satellites = satelliteRefs.current;
    const headline = headlineRef.current;
    if (!section || !track || !hero || !headline || satellites.length !== SATELLITE_CONFIG.length) {
      return;
    }

    const allBoxes = [hero, ...satellites];

    function visibleWidth() {
      const style = getComputedStyle(section!);
      const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      return section!.clientWidth - paddingX;
    }

    // Sizes every photo identically, centers the hero on screen, and
    // scatters the satellites (tilted, smaller, spread left/right/below it)
    // — the section's REST APPEARANCE, independent of whether the
    // scroll-jacked pin below ever engages. Previously this only ran inside
    // the desktop-only setup, so anything that kept that branch from
    // running (or a narrower viewport treated as "mobile") left every photo
    // at its plain untransformed flex position instead — which reads as
    // "photos falling in from the top, hero not centered, no scatter".
    // Returns the measurements the scroll-driven phase needs, so it isn't
    // duplicated/re-measured there.
    function applyRestState() {
      const { width, height } = computeReelSize();
      gsap.set(allBoxes, { width, height, clearProps: "transform" });

      // Still needed for the scroll-driven pan phase below (it reads this
      // same offset as its starting `x`) — but the rest-state positions
      // below no longer depend on it being exactly right, since every box
      // (hero included) now measures its own true position and corrects
      // directly to its target, regardless of wherever the track itself
      // happens to sit.
      const centerOffsetValue = (visibleWidth() - width) / 2;
      gsap.set(track, { x: centerOffsetValue });

      // Target center is the middle of the space actually visible BELOW the
      // fixed nav bar (section's own content box, padding-top already
      // reserves that), not the raw window center — otherwise everything
      // scattered "around center" sits shifted up under/behind the nav.
      const sectionRect = section!.getBoundingClientRect();
      const sectionStyle = getComputedStyle(section!);
      const paddingTop = parseFloat(sectionStyle.paddingTop);
      const paddingBottom = parseFloat(sectionStyle.paddingBottom);
      const contentHeight = section!.clientHeight - paddingTop - paddingBottom;
      const targetCenterX = sectionRect.left + sectionRect.width / 2;
      const targetCenterY = sectionRect.top + paddingTop + contentHeight / 2;

      // FLIP-style rest position: measure a box's true (untransformed)
      // on-screen center directly, then compare against its desired
      // position (viewport-relative fraction from center) to get the exact
      // translate needed to pull it there — works regardless of how the
      // track/flex layout actually placed it, since it's a real measured
      // delta rather than an assumption about track's own offset.
      function deltaTo(el: HTMLDivElement, xVw: number, yVh: number) {
        const rect = el.getBoundingClientRect();
        const trueCenterX = rect.left + rect.width / 2;
        const trueCenterY = rect.top + rect.height / 2;
        const desiredCenterX = targetCenterX + (xVw / 100) * window.innerWidth;
        const desiredCenterY = targetCenterY + (yVh / 100) * window.innerHeight;
        return { dx: desiredCenterX - trueCenterX, dy: desiredCenterY - trueCenterY };
      }

      const heroDelta = deltaTo(hero!, 0, 0);
      const satelliteDeltas = satellites.map((el, i) => {
        const { xVw, yVh } = SATELLITE_CONFIG[i];
        return deltaTo(el, xVw, yVh);
      });

      gsap.set(hero, { x: heroDelta.dx, y: heroDelta.dy, scale: HERO_REST_SCALE, transformOrigin: "50% 50%" });
      satellites.forEach((el, i) => {
        const { tilt } = SATELLITE_CONFIG[i];
        const { dx, dy } = satelliteDeltas[i];
        gsap.set(el, { x: dx, y: dy, rotation: tilt, scale: SATELLITE_REST_SCALE, transformOrigin: "50% 50%" });
      });

      return { width, heroDelta, satelliteDeltas };
    }

    // Below `md`, only the scroll-jacked pin/resolve/pan is skipped (same
    // tradeoff as RushTimeline) — the rest state above still
    // applies, so mobile shows the same centered-hero-with-scattered-
    // satellites composition, just without the scroll-driven reel.
    let cleanupDesktop: (() => void) | undefined;
    let isDesktopActive = false;

    function setupDesktop() {
      const { width, heroDelta, satelliteDeltas } = applyRestState();

      const centerOffset = () => (visibleWidth() - width) / 2;
      // Overshoots well past the "last photo flush against the right edge"
      // distance (scrollWidth - visibleWidth) so the pan ends with the last
      // photo almost entirely scrolled past the LEFT edge — only
      // PEEK_FRACTION of its width still visible, barely peeking out —
      // instead of the reel resolving into every photo neatly lined up.
      // Derived from: final on-screen right edge of the last photo
      // (centerOffset() - panDistance() + track.scrollWidth) set equal to
      // PEEK_FRACTION * width, then solved for panDistance().
      const PEEK_FRACTION = 0.08;
      const panDistance = () => Math.max(centerOffset() + track!.scrollWidth - width * PEEK_FRACTION, 0);
      const PHASE1_DISTANCE = window.innerHeight;
      const totalDistance = () => PHASE1_DISTANCE + panDistance();

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${totalDistance()}`,
        pin: true,
        scrub: 0.3,
        onUpdate: (self) => {
          const scrolledPx = self.progress * totalDistance();
          const resolveProgress = gsap.utils.clamp(0, 1, scrolledPx / PHASE1_DISTANCE);

          gsap.set(hero, {
            x: gsap.utils.interpolate(heroDelta.dx, 0, resolveProgress),
            y: gsap.utils.interpolate(heroDelta.dy, 0, resolveProgress),
            scale: diamondScale(HERO_REST_SCALE, HERO_PEAK_SCALE, 1, resolveProgress),
          });
          satellites.forEach((el, i) => {
            const { tilt } = SATELLITE_CONFIG[i];
            const { dx, dy } = satelliteDeltas[i];
            gsap.set(el, {
              x: gsap.utils.interpolate(dx, 0, resolveProgress),
              y: gsap.utils.interpolate(dy, 0, resolveProgress),
              rotation: gsap.utils.interpolate(tilt, 0, resolveProgress),
              scale: diamondScale(SATELLITE_REST_SCALE, SATELLITE_TROUGH_SCALE, 1, resolveProgress),
            });
          });

          const panProgress = gsap.utils.clamp(
            0,
            1,
            (scrolledPx - PHASE1_DISTANCE) / Math.max(panDistance(), 1),
          );
          gsap.set(track, { x: centerOffset() - panDistance() * panProgress });

          // Subtle only, per design note — 1 to 1.03 across the WHOLE
          // section's progress, not just the pan phase.
          gsap.set(headline, { scale: gsap.utils.interpolate(1, 1.03, self.progress) });
        },
      });

      cleanupDesktop = () => {
        st.kill();
        gsap.set(headline, { clearProps: "transform" });
        applyRestState();
      };
    }

    function sync() {
      const shouldBeDesktop = !isMobileViewport();
      if (shouldBeDesktop === isDesktopActive) return;

      cleanupDesktop?.();
      cleanupDesktop = undefined;
      isDesktopActive = shouldBeDesktop;
      if (shouldBeDesktop) {
        setupDesktop();
      } else {
        applyRestState();
      }
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
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-navy pt-[var(--nav-h)] pb-16 md:h-screen md:justify-center md:pb-0"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(255,255,255,0.6)_0.5px,transparent_0.5px)] bg-[length:16px_16px] [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
      />

      {/* Normal document flow (above the strip) below `md`, where there's no
          pin to justify floating this over the photos — absolutely centered
          over the track only once the desktop pin actually exists. */}
      <div className="relative z-20 mb-8 flex flex-col items-center px-6 text-center md:absolute md:inset-0 md:mb-0 md:flex md:items-center md:justify-center">
        <p className="font-mono text-sm text-white/60">Our History</p>
        <div className="mt-2 h-px w-16 bg-white/20" />
        <h2
          ref={headlineRef}
          className="mt-6 max-w-2xl font-sans text-3xl font-bold text-white md:text-5xl"
        >
          United by a shared passion for technology
        </h2>
      </div>

      {/* No gap between photos — once resolved, the reel reads as one
          continuous strip, not spaced-out cards. Fixed pixel size (not a
          CSS aspect-ratio class alone) as a real fallback: JS overrides
          this via inline style for the true reel size, but the box is
          never dependent on that JS running to have a visible, sane size —
          a plain `md:w-auto` override here left the box with no definite
          width OR height at that breakpoint (aspect-ratio can't resolve
          from two auto dimensions), collapsing it to whatever its child's
          intrinsic content needed instead of a real photo-sized box. */}
      <div
        ref={trackRef}
        className="flex w-max shrink-0 items-center overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible md:px-0"
      >
        {/* z-10 keeps the hero painting above the satellites once it grows
            past them mid-scroll — flex items honor z-index even without an
            explicit `position`, so this alone is enough, no stacking
            context hack needed. */}
        <div ref={heroRef} className="z-10 aspect-[3/2] w-[85vw] max-w-[500px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_IMAGE} alt="" className="h-full w-full object-cover" />
        </div>
        {SATELLITE_CONFIG.map((satellite, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) satelliteRefs.current[i] = el;
            }}
            className="z-0 aspect-[3/2] w-[85vw] max-w-[500px] shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={satellite.image} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
