"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCursor } from "@/components/motion/CustomCursor";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLParagraphElement>(null);
  const { setState } = useCursor();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom top",
      onEnter: () => setState("small"),
      onLeaveBack: () => setState("default"),
      onLeave: () => setState("default"),
    });

    return () => trigger.kill();
  }, [setState]);

  // Load-in sequence: the tagline lines settle first, then the scroll
  // hint — this is the "home page text" half of the requested "hero
  // text first, then NavBar" ordering. NavBar's own wordmark/header
  // intro (in NavBar.tsx) runs on a fixed delay tuned to start after
  // this timeline is done, since the two components don't share state.
  useIsomorphicLayoutEffect(() => {
    const tagline = taglineRef.current;
    const hint = scrollHintRef.current;
    if (!tagline || !hint) return;

    const lines = Array.from(tagline.children);
    const tl = gsap.timeline({ delay: 0.15 });
    tl.set(lines, { autoAlpha: 0, y: 16 })
      .set(hint, { autoAlpha: 0 })
      .to(lines, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.15 })
      .to(hint, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, "+=0.1");

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-snap-section
      className="relative flex h-screen flex-col overflow-hidden bg-navy pt-[var(--nav-h)]"
    >
      {/* No spacer here — the photo starts immediately below the header,
          and NavBar's fixed wordmark overlay sits directly on top of it
          (no reserved navy region in between). data-hero-photo: NavBar
          reads this element's live rect to know whether the wordmark is
          still actually over the photo right now, rather than guessing
          from a fixed scroll-timeline fraction. */}
      <div data-hero-photo className="relative flex-1 overflow-hidden">
        <Image
          src="/images/homepage.png"
          alt=""
          fill
          priority
          className="object-cover object-top blur-[4px]"
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Anchored to the photo's own box rather than sharing space with
            the headline, so NavBar's wordmark — confined to its own
            natural height — never reaches far enough down to cross over
            this text. Pulled up from bottom-16/20 to bottom-32/40 per
            design feedback, and leading-none + a smaller gap tighten the
            space between the two lines (most of the old gap was each
            line's own default line-height, not the flex gap). */}
        <div
          ref={taglineRef}
          className="absolute inset-x-0 bottom-32 flex flex-col gap-0.5 px-6 font-mono text-base leading-none font-bold text-white md:bottom-40 md:px-[60px] md:text-[30px]"
        >
          <p>omega chapter @ northeastern university</p>
          <p>the premiere technology fraternity in the nation</p>
        </div>

        <p
          ref={scrollHintRef}
          data-cursor-hover
          className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-sm font-bold text-white opacity-80 transition-[transform,opacity] duration-200 hover:-translate-y-1 hover:opacity-100"
        >
          vv scroll down to learn more vv
        </p>
      </div>
    </section>
  );
}
