"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";

type CursorState = "default" | "small";

const CursorContext = createContext<{
  setState: (state: CursorState) => void;
} | null>(null);

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error("useCursor must be used within CustomCursorProvider");
  return ctx;
}

export function CustomCursorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CursorState>("default");
  const [ready, setReady] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

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
        className="pointer-events-none fixed top-0 left-0 z-[100] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white mix-blend-difference transition-[width,height,opacity] duration-200"
        style={{
          width: state === "small" ? 12 : 32,
          height: state === "small" ? 12 : 32,
          opacity: ready ? 1 : 0,
        }}
      />
      {children}
    </CursorContext.Provider>
  );
}
