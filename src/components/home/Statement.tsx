"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger);

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const WORDS = "We are the first professional, co-ed technology fraternity in the country".split(" ");
const DISTANCE_PER_WORD = 90;

function randomWord(length: number): string {
  return Array.from(
    { length },
    () => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
  ).join("");
}

/**
 * A single scroll-scrubbed pass rather than a timed decode followed by a
 * separate highlight pass (the previous version) — that read as two
 * distinct effects back to back. Each word starts as scrambled noise at low
 * opacity; continued scroll both unscrambles it and brightens it, left to
 * right, one word at a time, so decoding and highlighting happen together
 * as the same motion.
 */
export default function Statement() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<HTMLSpanElement[]>([]);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const wordEls = wordRefs.current;
    if (!section || !wordEls.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wordEls.forEach((el, i) => {
        el.textContent = WORDS[i];
        el.style.opacity = "1";
      });
      return;
    }

    wordEls.forEach((el, i) => {
      el.textContent = randomWord(WORDS[i].length);
      el.style.opacity = "0.25";
    });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${wordEls.length * DISTANCE_PER_WORD}`,
      pin: true,
      scrub: 0.3,
      onUpdate: (self) => {
        const activeIndex = Math.floor(self.progress * wordEls.length);
        wordEls.forEach((el, i) => {
          if (i < activeIndex) {
            el.textContent = WORDS[i];
            el.style.opacity = "1";
          } else if (i === activeIndex) {
            // Only the word currently under the scrub keeps flickering —
            // words not yet reached hold their one static placeholder
            // (set once, above) instead of all flickering in a mass at once.
            el.textContent = randomWord(WORDS[i].length);
            el.style.opacity = "0.6";
          }
        });
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-snap-section
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-navy px-6 md:h-screen md:px-[100px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(255,255,255,0.6)_0.5px,transparent_0.5px)] bg-[length:16px_16px] [mask-image:linear-gradient(to_bottom,transparent,black_45%)]"
      />
      <h2 className="max-w-5xl text-center font-mono text-5xl font-bold leading-tight text-white md:text-[100px] md:leading-none">
        {WORDS.reduce<ReactNode[]>((acc, word, i) => {
          acc.push(
            <span
              key={i}
              ref={(el) => {
                if (el) wordRefs.current[i] = el;
              }}
            >
              {word}
            </span>,
          );
          if (i < WORDS.length - 1) acc.push(" ");
          return acc;
        }, [])}
      </h2>
    </section>
  );
}
