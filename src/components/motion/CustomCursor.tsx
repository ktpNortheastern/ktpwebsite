"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import ScrambleText from "@/components/motion/ScrambleText";

type CursorState = "default" | "small" | "caption";

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
  const dotRef = useRef<HTMLDivElement>(null);

  const setState = (next: CursorState, nextCaption = "") => {
    setStateRaw(next);
    setCaption(nextCaption);
  };

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    // Touch-primary devices have no cursor to track — `pointermove` still
    // fires on touch drags, so without this the dot would intermittently
    // jump to touch positions. Bail before attaching anything (not just
    // hiding the dot) so there's no listener or quickTo tween running at
    // all on mobile.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const quickX = gsap.quickTo(dot, "x", { duration: 0.25, ease: "power3" });
    const quickY = gsap.quickTo(dot, "y", { duration: 0.25, ease: "power3" });

    const handleMove = (e: PointerEvent) => {
      quickX(e.clientX);
      quickY(e.clientY);
      setReady(true);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <CursorContext.Provider value={{ setState }}>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
        style={{ opacity: ready ? 1 : 0 }}
      >
        {state === "caption" ? (
          <div className="bg-black px-3 py-1.5 font-mono text-base font-bold whitespace-nowrap text-white">
            <ScrambleText key={caption} text={caption} trigger="immediate" />
          </div>
        ) : (
          <div
            className="rounded-full border border-white mix-blend-difference transition-[width,height] duration-200"
            style={{
              width: state === "small" ? 12 : 32,
              height: state === "small" ? 12 : 32,
            }}
          />
        )}
      </div>
      {children}
    </CursorContext.Provider>
  );
}
