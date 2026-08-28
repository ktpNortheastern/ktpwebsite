"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCursor } from "@/components/motion/CustomCursor";

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
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
            this text. */}
        <div className="absolute inset-x-0 bottom-16 flex flex-col gap-1 px-6 font-mono text-base font-bold text-white md:bottom-20 md:px-[60px] md:text-[30px]">
          <p>omega chapter @ northeastern university</p>
          <p>the premiere technology fraternity in the nation</p>
        </div>

        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-sm font-bold text-white">
          vv scroll down to learn more vv
        </p>
      </div>
    </section>
  );
}
