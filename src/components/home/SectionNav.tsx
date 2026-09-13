"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// One entry per home section AFTER the hero (the hero is the landing
// moment itself — this nav only makes sense once the user has actually
// started scrolling through the sections below it). `dark` is that
// section's own background, read here rather than detected at runtime, so
// the active label's color can just follow it directly.
const SECTIONS = [
  { id: "presidential-welcome", label: "Welcome", dark: true },
  { id: "statement", label: "Mission", dark: true },
  { id: "history", label: "History", dark: true },
  { id: "pillars", label: "Pillars", dark: true },
  { id: "why-rush", label: "Why Rush", dark: true },
  { id: "network", label: "Network", dark: false },
  { id: "faq-preview", label: "FAQ", dark: false },
];

// How close the cursor has to get to the left edge to reveal the nav on
// demand — generous enough to cover the nav's own label width (so moving
// the mouse toward it to click a label doesn't fight the idle-hide logic
// below), not so wide it fires from casually moving around the page.
const EDGE_PX = 150;
// How long the user has to stop scrolling/moving before the nav reveals
// itself on its own.
const IDLE_MS = 3000;

/**
 * A small fixed left-side scrollspy for the home page's post-hero sections —
 * current section highlighted, click a label to jump straight to it. Hidden
 * until the user scrolls past the hero (nothing to navigate to before
 * then), and on mobile (`hidden md:flex`) where there's no room for a side
 * rail and the sections stack in a single natural scroll anyway.
 *
 * Even within that range it doesn't just sit on screen the whole time —
 * it's deliberately quiet by default, and only reveals itself once the user
 * pauses (idle `IDLE_MS`) or moves the cursor near the left edge, then
 * hides again the moment either condition lapses (fresh scroll activity, or
 * the cursor moving away). The intent is a nav that's discoverable but
 * never just parked in the corner competing with the section content.
 */
export default function SectionNav() {
  // Rendered from the root layout (see layout.tsx) rather than from the
  // home page itself — it needs to sit OUTSIDE SnapScrollContainer's
  // `#smooth-content`, since ScrollSmoother applies a transform to that
  // element and any `position: fixed` descendant of a transformed ancestor
  // is fixed relative to THAT ancestor, not the viewport (confirmed the
  // hard way: mounted inside `{children}` this nav scrolled away with the
  // page instead of staying put). Same reason NavBar itself lives outside
  // SnapScrollContainer. Being global rather than home-page-local means it
  // has to gate itself on the route instead of just not being mounted.
  const isHome = usePathname() === "/";
  const [activeId, setActiveId] = useState<string | null>(null);
  // Whether we're anywhere within the tracked sections at all (an absolute
  // gate — on the hero or the footer this stays false no matter how long
  // the user idles or where the cursor is).
  const [inRange, setInRange] = useState(false);
  // Whether the idle timer or the edge-hover has currently earned the nav
  // its reveal.
  const [revealed, setRevealed] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (!isHome) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    const footer = document.querySelector<HTMLElement>("footer");

    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let nearEdge = false;

    // Restarts the 3s countdown to the next reveal, hiding immediately
    // unless the cursor is already parked at the edge (in which case that
    // takes over as the reveal reason instead).
    function registerActivity() {
      clearTimeout(idleTimer);
      if (nearEdge) return;
      setRevealed(false);
      idleTimer = setTimeout(() => setRevealed(true), IDLE_MS);
    }

    // A section "becomes" active once its top has crossed this line, same
    // idiom NavBar's own scroll-direction logic uses (read live rects off
    // `body`'s scroll rather than an IntersectionObserver) — works
    // identically whether ScrollSmoother or native scroll owns the page,
    // and correctly reads a *pinned* section's rect (Pillars/WhyRush) too,
    // since GSAP pins via `position: fixed`, which keeps its rect constant
    // (and therefore "active") for the pin's whole duration.
    function updateSpy() {
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      setActiveId(current);
      // In range exactly when some tracked section is active — i.e. from
      // the moment Presidential Welcome crosses that same line (not the
      // instant it first peeks in at the very bottom edge of the screen,
      // which is already true while still sitting on the hero, since one
      // section down always starts exactly one viewport-height below)
      // through to the footer coming on screen, which clears `current`
      // back to null the same way scrolling back up to the hero does.
      const footerVisible = footer ? footer.getBoundingClientRect().top <= window.innerHeight : false;
      setInRange(current !== null && !footerVisible);
    }

    function handlePointerMove(e: PointerEvent) {
      nearEdge = e.clientX <= EDGE_PX;
      if (nearEdge) {
        clearTimeout(idleTimer);
        setRevealed(true);
      } else {
        registerActivity();
      }
    }

    // `ScrollTrigger`'s own onUpdate (used only for the spy below) fires
    // continuously while ScrollSmoother/normalizeScroll are settling —
    // confirmed live, still ticking dozens of times a second at rest, well
    // after any real input stopped — so it's useless as an "is the user
    // actually doing something" signal: wired to `registerActivity`, it
    // canceled the idle timer forever and the nav never revealed. Real
    // input events (wheel/touch/keys) don't have that problem.
    function handleInputActivity() {
      registerActivity();
    }

    const st = ScrollTrigger.create({ trigger: "body", start: "top top", end: "max", onUpdate: updateSpy });
    // onUpdate only fires on an actual scroll/refresh event, not at
    // creation time — without this the nav starts out with stale (no
    // active section) spy state until the very next scroll.
    updateSpy();
    registerActivity();
    window.addEventListener("resize", updateSpy);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("wheel", handleInputActivity, { passive: true });
    window.addEventListener("touchmove", handleInputActivity, { passive: true });
    window.addEventListener("keydown", handleInputActivity);
    return () => {
      clearTimeout(idleTimer);
      st.kill();
      window.removeEventListener("resize", updateSpy);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("wheel", handleInputActivity);
      window.removeEventListener("touchmove", handleInputActivity);
      window.removeEventListener("keydown", handleInputActivity);
    };
  }, [isHome]);

  const visible = inRange && revealed;

  function handleClick(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    // ScrollSmoother owns scrolling on desktop (where this nav even
    // renders); its own snap ScrollTrigger (see SnapScrollContainer) then
    // settles the rest of the way onto the section's exact snap point.
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(el, true, "top top");
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!isHome) return null;

  const isDark = SECTIONS.find((s) => s.id === activeId)?.dark ?? true;

  return (
    <nav
      aria-label="Section navigation"
      className={`pointer-events-none fixed top-1/2 left-6 z-40 hidden -translate-y-1/2 flex-col items-start gap-3 transition-opacity duration-500 md:flex ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {SECTIONS.map((s) => {
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => handleClick(s.id)}
            aria-current={active ? "true" : undefined}
            className="pointer-events-auto flex items-center gap-2 py-0.5"
          >
            <span
              className={`h-px transition-all duration-300 ${active ? "w-5" : "w-2"} ${
                isDark ? (active ? "bg-white" : "bg-white/35") : active ? "bg-black" : "bg-black/35"
              }`}
            />
            <span
              className={`font-mono text-[11px] tracking-wider uppercase transition-colors duration-300 ${
                isDark
                  ? active
                    ? "text-white"
                    : "text-white/35 hover:text-white/70"
                  : active
                    ? "text-black"
                    : "text-black/35 hover:text-black/70"
              }`}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
