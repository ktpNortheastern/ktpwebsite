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
      className="relative flex h-screen flex-col overflow-hidden bg-slate pt-[68px]"
    >
      {/* Real document-flow space (not an overlay) for NavBar's fixed
          wordmark to sit over at rest — height comes from the
          --hero-headline-h/--hero-headline-min-h custom properties
          (globals.css) that NavBar's overlay also reads, so the two can't
          drift out of sync the way independently-hardcoded values did
          before. Because this is real flow height rather than an
          absolutely-positioned guess, everything below it (photo,
          tagline) is naturally pushed down instead of needing its own
          matching offset math. */}
      <div className="h-[var(--hero-headline-h)] min-h-[var(--hero-headline-min-h)] shrink-0 bg-navy" />

      <div className="relative flex-1 overflow-hidden">
        <Image
          src="/images/homepage.png"
          alt=""
          fill
          priority
          className="object-cover object-top blur-[4px]"
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Anchored to the photo's own box (far from the spacer above)
            rather than sharing space with the headline, so NavBar's
            wordmark — confined to the spacer's height plus a small drift —
            never reaches far enough down to cross over this text. */}
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
