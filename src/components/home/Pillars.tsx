"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { isMobileViewport } from "@/lib/isMobileViewport";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  {
    title: "Academic Support",
    body:
      "Kappa Theta Pi brothers strive to foster academic growth and excellence for each other. We provide a supportive network filled with some of the brightest tech minds at the university that members can always rely on for help in classes and extracurricular activities.",
  },
  {
    title: "Alumni Connections",
    body:
      "Our alumni are spread out across the world and work on cutting-edge technologies. They work at a plethora of companies — from tech companies like Microsoft, Amazon, Facebook, Apple, and Google, to startups, consulting firms, financial technology firms, and more!",
  },
  {
    title: "Professional Development",
    body:
      "Through events like interview training, resume building, one-on-one mentorship, private company recruiting, and more, KTP aims to prepare members for success in any technology-related career. We take pride in developing the tech leaders of the future.",
  },
  {
    title: "Technical Advancement",
    body:
      "We provide members numerous opportunities to enhance their current technical skills, as well as learn new ones. Whether it be participation in one of our various project teams or attending a technical workshop, we make it easy for our members to expand their expertise.",
  },
  {
    title: "Social Growth",
    body:
      "The people you meet in Kappa Theta Pi will go on to be some of your closest friends throughout college and beyond. We host a variety of exclusive social events throughout the semester through which our members can bond, some of which include formal, retreat, and apple picking.",
  },
];

export default function Pillars() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Below `md`, the pinned scroll-jack is skipped entirely — the track
    // is a plain `overflow-x-auto` element instead (see className) and the
    // browser's native touch scrolling + CSS scroll-snap handles it. Touch
    // users swiping the cards directly is a much better fit than having
    // vertical scroll hijacked to drive horizontal motion. Re-checked on
    // resize so crossing the breakpoint tears down or spins up the pin.
    let cleanupDesktop: (() => void) | undefined;
    let isDesktopActive = false;

    function setupDesktop() {
      // section.clientWidth includes its own horizontal padding (px-[100px]
      // each side), but the track only becomes visible inside that padded
      // inset — subtracting clientWidth alone left the translate distance
      // short by exactly the padding amount, clipping the last card. Read
      // padding live (not hardcoded) so a future className change can't
      // silently desync this again.
      const visibleWidth = () => {
        const style = getComputedStyle(section!);
        const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        return section!.clientWidth - paddingX;
      };

      // Computed once per setupDesktop() call, not as a function re-run by
      // GSAP on every scrubbed scroll frame — that was forcing a
      // getComputedStyle + layout read on every single frame while this
      // section was pinned, a real source of scroll jank. A resize still
      // gets a fresh measurement: sync() below tears down and calls
      // setupDesktop() again from scratch on that event.
      const distance = track!.scrollWidth - visibleWidth();
      if (distance <= 0) return;

      const tween = gsap.to(track, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${distance}`,
          scrub: true,
          pin: true,
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
      className="flex min-h-screen flex-col justify-center overflow-hidden bg-navy px-6 py-16 md:h-screen md:px-[100px]"
    >
      <h2 className="font-mono text-4xl text-white">Pillars</h2>
      <div
        ref={trackRef}
        className="-mx-6 mt-16 flex gap-16 overflow-x-auto px-6 pb-4 [scrollbar-width:none] snap-x snap-mandatory md:mx-0 md:overflow-visible md:px-0 md:pb-0 md:snap-none"
      >
        {PILLARS.map((pillar, i) => (
          <div
            key={pillar.title}
            className="w-[386px] shrink-0 snap-center border-y border-white/20 py-8"
          >
            <PlaceholderImage n={i + 4} className="h-[210px] w-full" />
            <p className="mt-6 font-mono text-sm text-white/60">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 font-sans font-medium text-white">{pillar.title}</h3>
            <p className="mt-3 font-mono text-sm leading-relaxed text-white/60">
              {pillar.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
