"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import DotMatrixText from "@/components/ui/DotMatrixText";

const VISIBLE_MS = 5000;

/**
 * Title card that pops in from the top on load, sits over a dark scrim for
 * a few seconds, then fades away entirely — so the heading doesn't
 * permanently eat into the canvas's viewport like the old static heading
 * bar did. Non-interactive throughout, so panning works immediately even
 * while this is still showing.
 */
export default function GalleryIntro() {
  const [mounted, setMounted] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
    );

    const timeout = setTimeout(() => {
      gsap.to(ref.current, {
        y: -60,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => setMounted(false),
      });
    }, VISIBLE_MS);

    return () => clearTimeout(timeout);
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-x-0 top-[var(--nav-h)] z-30 flex justify-center py-10 md:py-14"
    >
      {/* An oval glow behind the title rather than a full-width bar — sized
          and blurred so it reads as a soft patch of darkness the title
          sits on, not a strip spanning the whole canvas. */}
      <div className="absolute left-1/2 top-1/2 h-[180px] w-[560px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 blur-3xl" />
      <DotMatrixText text="GALLERY" className="relative text-white" size="sm" />
    </div>
  );
}
