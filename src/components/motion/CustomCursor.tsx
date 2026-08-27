"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import ScrambleText from "@/components/motion/ScrambleText";

type CursorState = "default" | "small" | "caption";

// Anything a mouse user can click/focus — hovering one of these shrinks the
// dot, mirroring the affordance rekorderstudios.com uses for its cursor.
const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, summary, [role='button'], [role='link'], [data-cursor-hover]";

// Dot shrinks on hover to signal interactivity, matching rekorderstudios.com's
// cursor affordance.
const DEFAULT_SIZE = 12;
const HOVER_SIZE = 6;

const CursorContext = createContext<{
  setState: (state: CursorState, caption?: string) => void;
} | null>(null);

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error("useCursor must be used within CustomCursorProvider");
  return ctx;
}

export function CustomCursorProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<CursorState>("default");
  const [caption, setCaption] = useState("");
  const [ready, setReady] = useState(false);
  const [isInteractiveHover, setIsInteractiveHover] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  const setState = (next: CursorState, nextCaption = "") => {
    setStateRaw(next);
    setCaption(nextCaption);
  };

  useEffect(() => {
    const dot = dotRef.current;
    const captionEl = captionRef.current;
    if (!dot || !captionEl) return;

    // Touch-primary devices have no cursor to track — `pointermove` still
    // fires on touch drags, so without this the dot would intermittently
    // jump to touch positions. Bail before attaching anything (not just
    // hiding the dot) so there's no listener or quickTo tween running at
    // all on mobile.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Both the dot and the caption bubble are moved together — only one is
    // ever visible (toggled via opacity below), but keeping both in sync
    // avoids a jump-to-cursor when swapping between them.
    const targets = [dot, captionEl];
    const quickX = gsap.quickTo(targets, "x", { duration: 0.25, ease: "power3" });
    const quickY = gsap.quickTo(targets, "y", { duration: 0.25, ease: "power3" });

    const handleMove = (e: PointerEvent) => {
      quickX(e.clientX);
      quickY(e.clientY);
      setReady(true);
      // React bails out of the re-render when the value is unchanged, so
      // this is safe to call on every move rather than only on enter/leave.
      const target = e.target as HTMLElement | null;
      setIsInteractiveHover(!!target?.closest(INTERACTIVE_SELECTOR));
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  const isSmall = state === "small" || isInteractiveHover;

  return (
    <CursorContext.Provider value={{ setState }}>
      {/* `mix-blend-mode` only blends against content painted in the same
          stacking context — nesting this inside a separately-transformed
          wrapper div would isolate it from the page behind it and it'd just
          render its raw color everywhere. So the dot carries its own
          position/transform directly instead of living inside one. White +
          difference inverts against whatever's underneath, reading as a
          black dot on light sections and a white dot on dark ones (Hero,
          Footer) without needing to know which section it's over. */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference transition-[width,height,opacity] duration-200"
        style={{
          opacity: ready && state !== "caption" ? 1 : 0,
          width: isSmall ? HOVER_SIZE : DEFAULT_SIZE,
          height: isSmall ? HOVER_SIZE : DEFAULT_SIZE,
        }}
      />
      <div
        ref={captionRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-black px-3 py-1.5 font-mono text-base font-bold text-white transition-opacity duration-200"
        style={{ opacity: ready && state === "caption" ? 1 : 0 }}
      >
        <ScrambleText key={caption} text={caption} trigger="immediate" />
      </div>
      {children}
    </CursorContext.Provider>
  );
}
