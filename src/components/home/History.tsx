"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

// PLACEHOLDER: Figma copy for this card was literally "something something larp" — swap for real chapter history copy.
const OMEGA_CHAPTER_COPY =
  "Founded by a small group of students who saw the need for a technology-focused, co-ed professional fraternity at Northeastern, the Omega Chapter has grown from a handful of brothers into one of the largest and most active chapters in the KTP national organization. Every class since has built on that foundation — expanding our reach across majors, industries, and campus life.";

// Same card treatment as WhyRush's numbered reason cards (rounded-2xl navy
// panel, image on top, "(0N)" index beside the title, divider, body) rather
// than this section's old bespoke "( History )" pill card.
const CARDS = [
  {
    title: "Who We Are",
    body: "Our members are passionate about technology and are dedicated to making a positive impact on the world. We are a community of like-minded individuals who share a love for technology and a desire to learn, grow, excel, and succeed together. Our community is made up of individuals from all across campus. The strength of KTP lies in our shared enthusiasm for technology and the way our diverse experiences blend into a unified whole.",
    image: 2,
  },
  {
    title: "The Omega Chapter",
    body: OMEGA_CHAPTER_COPY,
    image: 3,
  },
];

export default function History() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current;
    if (!section || !cards.length) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.15 },
        );
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-snap-section
      className="relative isolate flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden bg-navy px-6 py-16 md:h-screen md:px-[100px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(255,255,255,0.6)_0.5px,transparent_0.5px)] bg-[length:16px_16px] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
      />
      {/* items-stretch from md so both cards share the height of the taller
          one (the copy lengths differ) — items-center stays on mobile where
          they stack in a column instead of sitting side by side. */}
      <div className="flex w-full max-w-[1160px] flex-col items-center justify-center gap-8 md:flex-row md:items-stretch">
        {CARDS.map((card, i) => (
          <div
            key={card.title}
            ref={(el) => {
              if (el) cardRefs.current[i] = el;
            }}
            className="flex w-full flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#162841] p-6 md:max-w-[520px]"
          >
            <PlaceholderImage n={card.image} className="h-[140px] w-full shrink-0" />
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-white/50">
                ({String(i + 1).padStart(2, "0")})
              </span>
              <h3 className="font-sans text-2xl text-white">{card.title}</h3>
            </div>
            <div className="border-t border-white/20" />
            <p className="font-mono text-sm leading-relaxed text-white/60">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
