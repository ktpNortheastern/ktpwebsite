"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { isMobileViewport } from "@/lib/isMobileViewport";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

const REASONS = [
  {
    title: "A Community That Shows Up",
    body: "Kappa Theta Pi brothers strive to foster academic growth and excellence for each other. We provide a supportive network filled with some of the brightest tech minds at the university that members can always rely on for help in classes and extracurricular activities.",
    image: 1,
  },
  {
    title: "A Network That Lasts",
    body: "Our alumni are spread out across the world and work on cutting-edge technologies at companies ranging from Microsoft, Amazon, and Google to startups, consulting firms, and financial technology firms.",
    image: 2,
  },
  {
    title: "Real Professional Growth",
    body: "Through events like interview training, resume building, one-on-one mentorship, and private company recruiting, KTP prepares members for success in any technology-related career.",
    image: 3,
  },
];

export default function WhyRush() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current;
    if (!section || !cards.length) return;

    // Below `md`, the pin + crossfade is skipped entirely — pinning eats
    // most of a phone's vertical space for not much payoff on 3 short text
    // blocks, so mobile just gets header-then-cards in normal stacked
    // flow (see className: `static` instead of `absolute inset-0`).
    // Re-checked on resize so crossing the breakpoint tears down or spins
    // up the pin/crossfade cleanly.
    let cleanupDesktop: (() => void) | undefined;
    let isDesktopActive = false;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function setupDesktop() {
      gsap.set(cards.slice(1), { yPercent: 100 });

      // Anchoring scale to the top edge (rather than dead center) means the
      // shrink pulls the sides and bottom inward while the top stays put —
      // combined with the upward lift below, that reads as the whole navy
      // layer scooping up and off rather than shrinking in place.
      gsap.set(section, { transformOrigin: "50% 0%" });

      const step = 1 / cards.length;
      const cardsDistance = (cards.length - 1) * 400 + 300;

      // Extra scrub distance (skipped under prefers-reduced-motion) tacked
      // onto the existing pin range: once the card crossfade settles, this
      // remainder drives the navy container lifting/shrinking away to
      // reveal Network underneath.
      //
      // Network's natural document position otherwise only arrives once
      // this ENTIRE pin range (cards + reveal) has scrolled past — the pin
      // spacer reserves that whole distance as space Network sits below,
      // so without help there's nothing to see behind the shrinking navy
      // layer but blank space for the full reveal. Pulling Network up by
      // exactly one viewport height (matched to revealDistance below) via
      // negative margin makes it arrive right as the reveal phase begins,
      // so it scrolls into place in the same window the navy layer is
      // shrinking away in — by revealProgress 1 its top lands exactly at
      // the viewport top, handing off with no gap or jump.
      const revealDistance = prefersReducedMotion ? 0 : window.innerHeight;
      const totalDistance = cardsDistance + revealDistance;

      const network = document.querySelector<HTMLElement>("[data-network-section]");
      if (network && revealDistance > 0) {
        gsap.set(network, { marginTop: -revealDistance });
      }

      // Tracks whatever `y` we last applied to `network` below, so each
      // frame can recover its untransformed position and re-derive a fresh
      // correction — rather than trying to predict Network's exact pixel
      // position analytically (fragile: depends on exactly how the browser
      // composes `scale` + `y` on the navy layer above), this reads the
      // navy layer's REAL rendered bottom edge straight off the DOM every
      // frame and snaps Network's top to match it, so the two stay glued
      // together regardless of the transform math driving the navy layer.
      let networkY = 0;
      // `y` is paint-only — once the pin releases, onUpdate stops firing
      // and whatever `y` was last set stays frozen forever, but content
      // after Network (FaqPreview) lays out against Network's real
      // (untransformed) box, not its painted position. Once the reveal
      // fully completes, fold the live `y` into `marginTop` (which DOES
      // affect layout) so FaqPreview lines up with where Network actually
      // ended up on screen, with no leftover gap. Reversed on the way back
      // up so the live per-frame correction can resume.
      let settled = false;

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${totalDistance}`,
        pin: true,
        onUpdate: (self) => {
          const scrolledPx = self.progress * totalDistance;

          // Set (not tween) each card's position directly from the current
          // scroll progress every frame, rather than firing an independent
          // gsap.to() per card. Independent tweens can get skipped past (a
          // fast scroll jumping past a card's whole range) or left stuck
          // mid-swipe if interrupted before completing — since the correct
          // position is a pure function of progress, setting it directly is
          // self-correcting on every update no matter how big a jump
          // happens between frames, and reverses cleanly scrolling back up.
          //
          // Card 0 rests permanently at yPercent 0 — the bottom of the
          // stack. Each later card starts fully below the box (yPercent
          // 100, hidden) and swipes up to yPercent 0 as scroll passes
          // through its own dedicated step range, covering the card
          // beneath it, then stays there once scrolled past.
          const cardsProgress = gsap.utils.clamp(0, 1, scrolledPx / cardsDistance);
          cards.forEach((card, i) => {
            if (i === 0) return;
            const localProgress = gsap.utils.clamp(
              0,
              1,
              (cardsProgress - (i - 1) * step) / step
            );
            gsap.set(card, { yPercent: 100 * (1 - localProgress) });
          });

          if (revealDistance > 0) {
            const revealProgress = gsap.utils.clamp(
              0,
              1,
              (scrolledPx - cardsDistance) / revealDistance
            );
            gsap.set(section, {
              yPercent: -130 * revealProgress,
              scale: 1 - 0.08 * revealProgress,
              borderRadius: 28 * revealProgress,
            });

            if (network) {
              if (revealProgress >= 1) {
                if (!settled) {
                  settled = true;
                  gsap.set(network, { marginTop: -revealDistance + networkY, y: 0 });
                }
              } else {
                if (settled) {
                  settled = false;
                  networkY = 0;
                  gsap.set(network, { marginTop: -revealDistance, y: 0 });
                }
                const sectionBottom = section!.getBoundingClientRect().bottom;
                const naturalNetworkTop = network.getBoundingClientRect().top - networkY;
                networkY = sectionBottom - naturalNetworkTop;
                gsap.set(network, { y: networkY });
              }
            }
          }
        },
      });

      cleanupDesktop = () => {
        st.kill();
        gsap.set(cards, { clearProps: "transform" });
        gsap.set(section, { clearProps: "transform,borderRadius,transformOrigin" });
        if (network) gsap.set(network, { clearProps: "marginTop,transform" });
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
      className="flex min-h-screen flex-col items-start gap-10 bg-navy px-6 py-16 md:h-screen md:flex-row md:items-center md:gap-16 md:px-[100px] md:py-0"
    >
      <div className="flex w-full shrink-0 flex-col gap-8 md:w-[275px]">
        <h2 className="font-mono text-6xl font-bold leading-none text-white">
          Why
          <br />
          Rush?
        </h2>
        <Button href="/members">Meet Our Brothers</Button>
      </div>

      <div className="relative flex w-full flex-col gap-10 md:h-[400px] md:max-w-[770px] md:flex-1 md:gap-0 md:mx-auto md:overflow-hidden">
        {REASONS.map((reason, i) => (
          <div
            key={reason.title}
            ref={(el) => {
              if (el) cardRefs.current[i] = el;
            }}
            className="static flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#162841] p-6 md:absolute md:inset-0"
          >
            <PlaceholderImage n={reason.image} className="h-[140px] w-full shrink-0" />
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-white/50">
                ({String(i + 1).padStart(2, "0")})
              </span>
              <h3 className="font-sans text-2xl text-white">{reason.title}</h3>
            </div>
            <div className="border-t border-white/20" />
            <p className="font-mono text-sm leading-relaxed text-white/60">{reason.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
