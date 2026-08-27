"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";

gsap.registerPlugin(ScrollTrigger);

// Letters only — the original symbol-heavy set (brackets, slashes, `#`, `^`)
// read as visual noise rather than a "decoding" effect.
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const SWEEP_MS = 900;
const SETTLE_MS = 320;
const FLICKER_INTERVAL_MS = 45;

type ScrambleTextProps = {
  text: string;
  className?: string;
  as?: "p" | "h1" | "h2" | "h3";
  // "scroll" (default) decodes on scroll-into-view, once. "immediate" decodes
  // as soon as the element mounts — for hover/tap-triggered captions, pass a
  // `key` that changes with the text so React remounts and re-triggers it.
  trigger?: "scroll" | "immediate";
};

/**
 * Each character flips independently and settles on its own staggered
 * timer (left-to-right overall), rather than a hard sweep line redrawing
 * the whole string every animation frame — reads as a "decode", not a glitch.
 * Shared between the home page statement section and Gallery caption hovers.
 */
export default function ScrambleText({
  text,
  className = "",
  as: Tag = "p",
  trigger = "scroll",
}: ScrambleTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (trigger === "immediate") {
      const cancel = scramble(el, text);
      return cancel;
    }

    let cancel: (() => void) | undefined;

    const scrollTrigger = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      once: true,
      onEnter: () => {
        cancel = scramble(el, text);
      },
    });

    return () => {
      scrollTrigger.kill();
      cancel?.();
    };
  }, [text, trigger]);

  return (
    // @ts-expect-error dynamic tag ref typing
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}

function scramble(el: HTMLElement, finalText: string) {
  const chars = finalText.split("");
  const total = chars.length;
  const startTimes = chars.map((_, i) => (i / total) * (SWEEP_MS - SETTLE_MS));
  const totalDuration = SWEEP_MS;

  const start = performance.now();
  let lastTick = 0;
  let raf = 0;

  function render(elapsed: number) {
    el!.textContent = chars
      .map((char, i) => {
        if (char === " " || char === "\n") return char;
        const t = elapsed - startTimes[i];
        if (t >= SETTLE_MS) return char;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      })
      .join("");
  }

  function frame(now: number) {
    const elapsed = now - start;

    if (now - lastTick >= FLICKER_INTERVAL_MS) {
      lastTick = now;
      render(elapsed);
    }

    if (elapsed < totalDuration) {
      raf = requestAnimationFrame(frame);
    } else {
      el.textContent = finalText;
    }
  }

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
