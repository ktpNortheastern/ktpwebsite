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
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const cards = cardRefs.current;
    if (!section || !header || !cards.length) return;

    // Below `md`, the pin + crossfade is skipped entirely — pinning eats
    // most of a phone's vertical space for not much payoff on 3 short text
    // blocks, so mobile just gets header-then-cards in normal stacked
    // flow (see className: `static` instead of `absolute inset-0`).
    // Re-checked on resize so crossing the breakpoint tears down or spins
    // up the pin/crossfade cleanly.
    let cleanupDesktop: (() => void) | undefined;
    let isDesktopActive = false;

    function setupDesktop() {
      gsap.set(cards.slice(1), { opacity: 0, y: 40 });

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${(cards.length - 1) * 400 + 300}`,
        pin: true,
        onUpdate: (self) => {
          const step = 1 / cards.length;
          const activeIndex = Math.min(
            cards.length - 1,
            Math.floor(self.progress / step)
          );
          // Set (not tween) each card's state directly from the current
          // scroll progress every frame, rather than firing an independent
          // gsap.to() per card. Independent tweens can get skipped past
          // (a fast scroll jumping activeIndex by more than one step) or
          // left stuck mid-fade if interrupted before completing — since
          // the correct visual state is a pure function of progress, setting
          // it directly is self-correcting on every single update no matter
          // how big a jump happens between frames. The CSS `transition`
          // classes on each card (see JSX) supply the smoothing instead.
          cards.forEach((card, i) => {
            gsap.set(card, {
              opacity: i === activeIndex ? 1 : 0,
              y: i === activeIndex ? 0 : 40,
            });
          });

          // in the final stretch of the pin, shrink/slide the header up
          // as the section hands off to Network below.
          const exitProgress = gsap.utils.clamp(0, 1, (self.progress - 0.85) / 0.15);
          gsap.set(header, {
            yPercent: -exitProgress * 20,
            scale: 1 - exitProgress * 0.15,
          });
        },
      });

      cleanupDesktop = () => {
        st.kill();
        gsap.set(cards, { clearProps: "opacity,transform" });
        gsap.set(header, { clearProps: "transform" });
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
      <div
        ref={headerRef}
        className="flex w-full shrink-0 flex-col gap-8 transition-transform duration-200 ease-out md:w-[275px]"
      >
        <h2 className="font-mono text-6xl font-bold leading-none text-white">
          Why
          <br />
          Rush?
        </h2>
        <Button href="/members">Meet Our Brothers</Button>
      </div>

      <div className="relative flex w-full flex-col gap-10 md:h-[400px] md:max-w-[770px] md:flex-1 md:gap-0 md:mx-auto">
        {REASONS.map((reason, i) => (
          <div
            key={reason.title}
            ref={(el) => {
              if (el) cardRefs.current[i] = el;
            }}
            className="static flex flex-col gap-4 transition-[opacity,transform] duration-300 ease-out md:absolute md:inset-0"
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
