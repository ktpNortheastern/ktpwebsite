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
  //
  // The hint isn't a hover affordance — it's a self-playing idle
  // indicator (like most "scroll to explore" cues), bobbing continuously
  // once it's settled in, and fading away as soon as the user actually
  // starts scrolling (reversing if they scroll back up to the very top).
  useIsomorphicLayoutEffect(() => {
    const tagline = taglineRef.current;
    const hint = scrollHintRef.current;
    const section = sectionRef.current;
    if (!tagline || !hint || !section) return;

    const lines = Array.from(tagline.children);
    let bobTween: gsap.core.Tween | undefined;

    const tl = gsap.timeline({ delay: 0.15 });
    tl.set(lines, { autoAlpha: 0, y: 16 })
      .set(hint, { autoAlpha: 0 })
      .to(lines, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.15 })
      .to(hint, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, "+=0.1")
      .call(() => {
        // Started only once the reveal tween above is done with `y` on
        // this element — running both at once would have them fighting
        // over the same transform property.
        bobTween = gsap.to(hint, { y: -6, duration: 1, ease: "sine.inOut", repeat: -1, yoyo: true });
      });

    // onEnterBack, not onLeaveBack: this trigger starts at "top top" —
    // the very top of the page — so leaving it backward would require
    // scrolling to a negative scroll position, which never happens.
    // onEnterBack (scrolling back up into this 80px zone from below) is
    // the reachable equivalent of "back near the top" here.
    const fadeTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=80",
      onEnter: () => {
        bobTween?.pause();
        gsap.to(hint, { autoAlpha: 0, duration: 0.3, ease: "power1.out" });
      },
      onEnterBack: () => {
        gsap.to(hint, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
        bobTween?.resume();
      },
    });

    return () => {
      tl.kill();
      bobTween?.kill();
      fadeTrigger.kill();
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
          className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-sm font-bold text-white"
        >
          vv scroll down to learn more vv
        </p>
      </div>
    </section>
  );
}
