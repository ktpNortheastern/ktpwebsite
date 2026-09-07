"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";

gsap.registerPlugin(ScrollTrigger);

// Letters only — the original symbol-heavy set (brackets, slashes, `#`, `^`)
// read as visual noise rather than a "decoding" effect.
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const SWEEP_MS = 300;
const SETTLE_MS = 110;
const FLICKER_INTERVAL_MS = 20;

type ScrambleTextProps = {
  text: string;
  className?: string;
  as?: "p" | "h1" | "h2" | "h3" | "span";
  // "scroll" (default) decodes on scroll-into-view, once. "immediate" decodes
  // as soon as the element mounts — for hover/tap-triggered captions, pass a
  // `key` that changes with the text so React remounts and re-triggers it.
  trigger?: "scroll" | "immediate";
  // Fires once, when the decode reaches its final frame and settles on
  // `text` — not on unmount/interruption (see the cancel() path in
  // scramble() below, which stops the rAF loop before this ever runs).
  // Lets a caller key real work off "the animation actually finished"
  // instead of guessing a matching duration.
  onComplete?: () => void;
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
  onComplete,
}: ScrambleTextProps) {
  const ref = useRef<HTMLElement>(null);
  // Read through a ref rather than putting onComplete in the effect's own
  // deps below — callers (e.g. PageTransition) pass an inline callback
  // that's a new function every render, and this effect must only re-run
  // (restarting the decode) when text/trigger actually change, not on
  // every render of the caller.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  // Runs before paint, so a scroll-triggered instance never shows its real
  // text even for a single frame while it's still below the "top 80%" line
  // waiting for the decode below to start — it reads as already-scrambled
  // noise the whole time it's approaching, not readable text that glitches
  // once it arrives.
  useLayoutEffect(() => {
    if (trigger !== "scroll") return;
    const el = ref.current;
    if (!el) return;
    el.textContent = randomize(text);
  }, [text, trigger]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fireComplete = () => onCompleteRef.current?.();

    if (trigger === "immediate") {
      const cancel = scramble(el, text, fireComplete);
      return cancel;
    }

    let cancel: (() => void) | undefined;

    const scrollTrigger = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      once: true,
      onEnter: () => {
        cancel = scramble(el, text, fireComplete);
      },
    });

    // This trigger's start position is computed from wherever the page's
    // layout happens to be the moment it's created — same race every
    // other GSAP-pinned component in this codebase guards against (see
    // SnapScrollContainer.tsx/RushHeader.tsx) by refreshing once fonts
    // settle, which this was missing. It matters more here than most:
    // this instance sits in the footer, rendered once by RootLayout, so
    // it mounts before the actual page's own pinned sections (Hero,
    // History, WhyRush, etc. on home) have reserved their own pin-spacing
    // scroll distance — a page as long and scroll-jacked as home can
    // still be growing well after this trigger's initial geometry is
    // cached, permanently pointing "80% down the viewport" at a stale
    // pixel position the real page never actually reaches, leaving the
    // text stuck mid-scramble forever instead of ever firing onEnter.
    document.fonts.ready.then(() => ScrollTrigger.refresh());

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

function randomize(text: string): string {
  return text
    .split("")
    .map((char) =>
      char === " " || char === "\n"
        ? char
        : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
    )
    .join("");
}

// Exported so components with their own hand-rolled GSAP timelines (NavBar's
// wordmark, Hero's tagline/scroll hint) can chain this same decode onto the
// end of an existing intro tween instead of duplicating the effect.
export function scramble(el: HTMLElement, finalText: string, onComplete?: () => void) {
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
      onComplete?.();
    }
  }

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
