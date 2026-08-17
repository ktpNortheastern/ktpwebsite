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
      className="relative flex h-screen flex-col justify-center overflow-hidden bg-slate pt-[68px]"
    >
      {/* Real layout space (not an overlay) for the nav's big headline to
          sit over at rest — sized to match NavBar's wordmark alignment.
          Scrolls away normally with the rest of Hero, genuinely revealing
          the photo underneath rather than faking it with an opacity fade. */}
      <div className="absolute inset-x-0 top-[68px] h-[46vh] min-h-[320px] bg-navy md:h-[52vh] md:min-h-[400px]" />

      <div className="absolute inset-x-0 top-[calc(68px+46vh)] bottom-0 overflow-hidden md:top-[calc(68px+52vh)]">
        <Image
          src="/images/delta_initiation.png"
          alt=""
          fill
          priority
          className="object-cover blur-[4px]"
        />
      </div>
      <div className="absolute inset-x-0 top-[calc(68px+46vh)] bottom-0 bg-black/40 md:top-[calc(68px+52vh)]" />

      <div className="relative z-10 px-6 md:px-[60px]">
        <div className="flex items-center gap-4 md:gap-6">
          <svg
            viewBox="0 0 74 74"
            className="h-8 w-8 shrink-0 fill-white md:h-[52px] md:w-[52px]"
            aria-hidden
          >
            <circle cx="37" cy="7" r="5" />
            <circle cx="57" cy="17" r="5" />
            <circle cx="67" cy="37" r="5" />
            <circle cx="57" cy="57" r="5" />
            <circle cx="37" cy="67" r="5" />
            <circle cx="17" cy="57" r="5" />
            <circle cx="7" cy="37" r="5" />
            <circle cx="17" cy="17" r="5" />
          </svg>
          <h1 className="font-sans text-4xl font-bold leading-none text-white md:text-[100px]">
            we are
          </h1>
        </div>
        <h1 className="font-sans text-4xl font-bold italic leading-none text-white md:text-[100px]">
          Kappa Theta Pi
        </h1>

        <div className="mt-8 flex flex-col gap-1 font-mono text-base font-bold text-white md:mt-16 md:text-[30px]">
          <p>omega chapter @ northeastern university</p>
          <p>the premiere technology fraternity in the nation</p>
        </div>
      </div>

      <p className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-sm font-bold text-white">
        vv scroll down to learn more vv
      </p>
    </section>
  );
}
