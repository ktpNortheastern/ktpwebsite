"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import ScrambleText from "@/components/motion/ScrambleText";

gsap.registerPlugin(ScrollTrigger);

const links = [
  { label: "Home", href: "/" },
  { label: "Members", href: "/members" },
  { label: "FAQ", href: "/faq" },
  { label: "Gallery", href: "/gallery" },
];

// Shared timeline shape so the headline's FLIP and the nav links' spread
// FLIP — two separate gsap timelines, each normalized to its own total
// duration by ScrollTrigger's scrub over the same scroll distance — land
// on the same scroll position instead of drifting out of sync.
const SCROLL_DISTANCE = "+=420";
const HOLD = 1.6;
const SHRINK = 2;
const TOTAL = HOLD + SHRINK;

export default function NavBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  // Whether the Greek "ΚΘΠ" corner label is mounted/visible. Purely a
  // function of scroll progress (see updateWordmarkCorner below) — no
  // timer, so it can never desync from where the wordmark actually is:
  // scrolling up even briefly recomputes it from the current progress on
  // the very next scroll frame, same as everything else in this file.
  const [showGreek, setShowGreek] = useState(false);
  const showGreekRef = useRef(false);
  // Bumped on every transition INTO the Greek state (never on the way
  // out) and used as ScrambleText's `key` — React only replays a mount
  // effect when the key actually changes, so a plain boolean "has this
  // ever shown" gate only replays the decode once, ever. A counter that
  // increments on every reveal gives every single downward pass a fresh
  // key, so it remounts (and re-decodes) every time, not just the first.
  const [greekRevealCount, setGreekRevealCount] = useState(0);

  const headerRef = useRef<HTMLElement>(null);
  const wordmarkWrapperRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLAnchorElement>(null);
  const wordmarkInnerRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);

  // Only the home page opens on the big white "Kappa Theta Pi" headline —
  // every other page has no hero moment to shrink from, so it renders
  // straight into the compact/scrolled nav state.
  useEffect(() => {
    if (!isHome) return;
    const header = headerRef.current;
    const wordmarkWrapper = wordmarkWrapperRef.current;
    const wordmark = wordmarkRef.current;
    const inner = wordmarkInnerRef.current;
    const target = targetRef.current;
    const navLinks = navLinksRef.current;
    if (!header || !wordmarkWrapper || !wordmark || !inner || !target || !navLinks) return;

    gsap.set(inner, { transformOrigin: "0% 0%" });
    gsap.set(wordmark, { transformOrigin: "0% 0%" });

    // Stretches the headline to the exact edge-to-edge width of its
    // container (matching header's own padding) regardless of viewport
    // or how many characters the phrase has, the same "full-bleed
    // wordmark" trick sienna.framer.media uses for its hero title.
    function fitWidth() {
      gsap.set(inner!, { scaleX: 1 });
      const natural = inner!.getBoundingClientRect().width;
      const container = wordmark!.clientWidth;
      gsap.set(inner!, { scaleX: container / natural });
    }

    // mix-blend-difference is a permanent, always-on class on the wrapper
    // (see JSX below), never touched by JS — only its OPACITY is animated,
    // continuously, from the same scroll progress driving the FLIP itself.
    // That opacity fade is the actual fix for the cream-tint bug: the
    // wordmark is invisible by the time it would be sitting over the
    // header's opaque navy, so there's no blended element left to show a
    // stuck cream tint in the first place. A scramble effect can't do this
    // job — scrambled characters are still rendered, still blended, still
    // cream over navy — so this element only ever fades, never scrambles.
    //
    // FADE_START_PROGRESS is where the fade begins, deliberately expressed
    // as a fraction of the SAME progress (0–1 over SCROLL_DISTANCE) that
    // drives the FLIP's x/y/scale, not a separate photo-rect measurement
    // or a timer. A rect-intersection version of this fade shipped
    // earlier and was correct in isolation (verified via direct
    // scrollTrigger.scroll() stepping) but practically broken: it only
    // ever became visible during a scroll gesture that kept moving, never
    // as a state a user could actually settle on, because the section's
    // snap-back point sits well after where that fade completed. Keying
    // off progress instead ties it to the one signal that's always
    // synchronized with the wordmark's own position, in both directions,
    // on every scroll frame — same as HOLD/SHRINK below.
    const FADE_START_PROGRESS = 0.85; // last 15% of the FLIP's total progress
    // Greek starts appearing slightly BEFORE English's fade fully
    // completes (which still finishes exactly at progress 1, unchanged —
    // that's the line that actually matters for the cream-tint bug).
    // This overlap is only safe on Greek's side: it's never blended, so
    // there's no tint risk in it becoming visible a little early. Without
    // it, the two elements swapped in the same instant — each fade read
    // fine in isolation, but the handoff between them still landed as a
    // hard cut rather than a transition.
    const GREEK_APPEAR_PROGRESS = 0.95;
    // Applied to the fade-out, not left linear — linear made the wordmark
    // stay substantially visible right up to the end and then disappear
    // all at once. Easing the LOSS of opacity (power2.out: fast at first,
    // tapering as it approaches 0) means it's already faint well before
    // progress 1, so what's left to lose right at the end is small —
    // reads as dissolving rather than being cut off.
    const fadeEase = gsap.parseEase("power2.out");

    function showGreekLabel() {
      if (showGreekRef.current) return;
      showGreekRef.current = true;
      setShowGreek(true);
      // Bumps the ScrambleText key so THIS reveal gets its own fresh
      // mount and decodes again, not just the very first one ever.
      setGreekRevealCount((c) => c + 1);
    }

    function hideGreekLabel() {
      if (!showGreekRef.current) return;
      showGreekRef.current = false;
      setShowGreek(false);
    }

    // Runs every scroll frame — cheap (a couple of gsap.set calls and,
    // at most, one boundary-crossing state update), and being purely a
    // function of the current progress means scrolling up mid-transition
    // recomputes correctly on the very next frame instead of racing
    // against anything scheduled earlier.
    function updateWordmarkCorner(progress: number) {
      const fadeT = gsap.utils.clamp(0, 1, (progress - FADE_START_PROGRESS) / (1 - FADE_START_PROGRESS));
      const englishOpacity = 1 - fadeEase(fadeT);
      gsap.set(wordmarkWrapper, { opacity: englishOpacity, pointerEvents: englishOpacity > 0.5 ? "auto" : "none" });

      if (progress >= GREEK_APPEAR_PROGRESS) {
        showGreekLabel();
      } else if (progress < FADE_START_PROGRESS) {
        // Only reverts once comfortably clear of the fade zone (not the
        // instant progress dips below GREEK_APPEAR_PROGRESS) — otherwise
        // a single scrub frame landing right at the boundary while still
        // easing toward the corner would flip Greek on and straight back
        // off again.
        hideGreekLabel();
      }
    }

    // Manual FLIP against an invisible same-text target sitting in the
    // compact nav slot: measuring both rects and scrubbing the delta
    // between them makes the SAME element slide from the big edge-to-edge
    // headline down into the small corner mark, instead of crossfading
    // between two independently-styled elements.
    function buildTimeline() {
      fitWidth();
      const bigRect = wordmark!.getBoundingClientRect();
      const smallRect = target!.getBoundingClientRect();
      const scale = smallRect.height / bigRect.height;
      const deltaX = smallRect.left - bigRect.left;
      const deltaY = smallRect.top - bigRect.top;
      const dropY = 48; // how far the headline drifts before it starts shrinking

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: SCROLL_DISTANCE,
          scrub: 0.3,
          onUpdate: (self) => updateWordmarkCorner(self.progress),
        },
      });

      // A single translate+scale FLIP, held briefly then shrunk into the
      // corner — the Greek corner label swap is handled separately, above.
      tl.set(wordmark, { x: 0, y: 0, scale: 1, color: "#ffffff" }, 0)
        .to(wordmark, { y: dropY, duration: HOLD, ease: "none" }, 0)
        .to(wordmark, { x: deltaX, y: deltaY, scale, duration: SHRINK, ease: "none" }, HOLD);

      return tl;
    }

    // Desktop-only: the nav links spread edge-to-edge like Sienna's at
    // rest, then relayout into their normal clustered/right-aligned group
    // as the headline reaches the corner. Skipped on mobile, where the
    // links are hidden behind the hamburger anyway.
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const items = Array.from(navLinks.children) as HTMLElement[];

      function buildNavSpread() {
        const headerRect = header!.getBoundingClientRect();
        // Reads the same --nav-pad-x custom property the header's own
        // horizontal padding uses, rather than a separate hardcoded 24
        // that used to just coincidentally match it.
        const navPadX = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-pad-x"));

        const naturalRects = items.map((el) => el.getBoundingClientRect());
        // Spread from the header's own inner-left edge, not the invisible
        // compact mark's width — the old version tied startX to the
        // mark's rendered width, which left "Home" starting indented
        // rather than genuinely edge-to-edge, and wouldn't adapt if that
        // width ever changed. This is a pure function of the header's own
        // current width instead, so the spread always fills the real
        // available space.
        const startX = headerRect.left + navPadX;
        // Target the LAST item's own right edge landing at the header's
        // inner edge, not its left edge — otherwise the evenly-spaced
        // left-edge interpolation below plants the final item's left edge
        // navPadX from the header boundary and its own width (e.g. the
        // Rush Now button) pushes its right edge off-screen.
        const lastWidth = naturalRects[naturalRects.length - 1]?.width ?? 0;
        const endX = headerRect.right - navPadX - lastWidth;
        const span = Math.max(endX - startX, 0);
        const n = items.length;

        return naturalRects.map((rect, i) => {
          const spreadLeft = n > 1 ? startX + (span * i) / (n - 1) : startX;
          return spreadLeft - rect.left;
        });
      }

      // A ScrollTrigger with onUpdate setting `x` directly from
      // self.progress every frame, not a gsap.timeline of independent
      // per-item `.to()` tweens — the same fix as WhyRush's crossfade
      // (see git history). Confirmed live: scrubbing this timeline's own
      // clock manually (tl.time(t, true)) produced perfectly linear
      // motion, but real scroll-driven playback wrote the DOM transform
      // exactly once, straight to its end value, well before the scrubbed
      // progress reached the tween's end — independent tweens riding a
      // shared `scrub` ScrollTrigger aren't guaranteed to actually play
      // through their intermediate frames. Deriving the value directly
      // from progress every update is self-correcting regardless.
      function buildNavScrollTrigger() {
        const deltas = buildNavSpread();
        function applyProgress(progress: number) {
          const t = progress * TOTAL;
          const shrinkProgress = gsap.utils.clamp(0, 1, (t - HOLD) / SHRINK);
          items.forEach((el, i) => {
            gsap.set(el, { x: deltas[i] * (1 - shrinkProgress) });
          });
        }
        const st = ScrollTrigger.create({
          trigger: "body",
          start: "top top",
          end: SCROLL_DISTANCE,
          scrub: 0.3,
          onUpdate: (self) => applyProgress(self.progress),
        });
        // onUpdate only fires on an actual scroll/refresh event, not at
        // creation time — without this, links sit untransformed (at their
        // natural clustered position) at rest until the user scrolls once.
        applyProgress(st.progress);
        return st;
      }

      let navTrigger = buildNavScrollTrigger();
      const onNavResize = () => {
        navTrigger.kill();
        gsap.set(items, { clearProps: "transform" });
        navTrigger = buildNavScrollTrigger();
      };
      window.addEventListener("resize", onNavResize);

      return () => {
        window.removeEventListener("resize", onNavResize);
        navTrigger.kill();
      };
    });

    let tl = buildTimeline();
    // onUpdate only fires on an actual scroll/refresh event, not at
    // creation time — matters here mainly for the (rare) case of a
    // restored mid-page scroll position on reload.
    updateWordmarkCorner(tl.scrollTrigger?.progress ?? 0);
    const onResize = () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set(wordmark, { clearProps: "transform,color" });
      gsap.set(wordmarkWrapper, { clearProps: "opacity,pointerEvents" });
      hideGreekLabel();
      tl = buildTimeline();
      updateWordmarkCorner(tl.scrollTrigger?.progress ?? 0);
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready?.then(() => {
      tl.scrollTrigger?.kill();
      tl.kill();
      tl = buildTimeline();
      updateWordmarkCorner(tl.scrollTrigger?.progress ?? 0);
    });

    return () => {
      window.removeEventListener("resize", onResize);
      tl.scrollTrigger?.kill();
      tl.kill();
      mm.revert();
    };
  }, [isHome]);

  return (
    <>
      {/* A separate fixed element from <header>, deliberately — not a
          styling choice, a stacking-context requirement. mix-blend-mode
          only searches for backdrop within the nearest ancestor stacking
          context; a blend on an element that is ITSELF a stacking-context
          root (position:fixed here) searches one level further out (the
          page), which is what lets it reach Hero's real photo. Nesting it
          inside <header> instead confined the search to header's own
          subtree, which has nothing painted where the wordmark visually
          sits — it rendered as plain unblended white. Keeping it as its
          own element also means <header> (nav strip, links, Rush Now)
          never carries the blend and always stays solid navy/white.

          mix-blend-difference is a permanent, static class here — no
          longer toggled by JS. Only its opacity is, continuously, from
          updateWordmarkCorner (via a plain ref, not a CSS class — a CSS
          transition fighting a per-frame gsap.set would fight/lag against
          it) so it fades away before it's fully sitting over the
          header's opaque navy in the corner slot. That fade is what
          fixes the old cream-tint bug — the blended element being hidden
          by then, not a state it has to correctly guess and toggle out
          of. showGreek's pointer-events/aria/tabIndex still reflect
          whether it's currently the interactive element. */}
      {isHome && (
        <div
          ref={wordmarkWrapperRef}
          className="pointer-events-none fixed inset-x-0 top-[var(--nav-h)] z-[60] flex px-[var(--nav-pad-x)] mix-blend-difference"
        >
          <Link
            ref={wordmarkRef}
            href="/"
            tabIndex={showGreek ? -1 : undefined}
            aria-hidden={showGreek}
            className={`block w-full whitespace-nowrap font-sans text-[length:var(--wordmark-fs)] font-bold leading-none text-white ${showGreek ? "pointer-events-none" : "pointer-events-auto"}`}
          >
            <span ref={wordmarkInnerRef} className="inline-block">
              Kappa Theta Pi
            </span>
          </Link>
        </div>
      )}

      <header
        ref={headerRef}
        className="fixed top-0 left-0 z-50 flex h-[var(--nav-h)] w-full items-center justify-between bg-navy px-[var(--nav-pad-x)] py-5"
      >
        <div className="relative">
          {/* Invisible geometry probe — buildTimeline() measures this
              element's rect to compute where the big wordmark shrinks to.
              Text must stay "Kappa Theta Pi" (matching the shrinking
              wordmark itself), not whatever corner label happens to be
              showing, so its box never depends on that. */}
          <div
            ref={targetRef}
            className={`font-sans font-bold text-2xl text-white ${isHome ? "invisible" : ""}`}
            aria-hidden={isHome}
          >
            {!isHome && <Link href="/">Kappa Theta Pi</Link>}
            {isHome && "Kappa Theta Pi"}
          </div>

          {/* Greek corner label — overlaid exactly on the probe above
              (same box via inset-0). Plain white, never blended. A short
              CSS fade-in (duration-300, plain time-based — no tint risk
              here so it doesn't need to be tied to scroll progress like
              the wordmark's own fade does) so it arrives softly rather
              than snapping to full opacity, with the ScrambleText decode
              continuing to play underneath/through that fade-in. The
              decode itself replays on EVERY reveal, not just the first
              ever — ScrambleText's "immediate" trigger only re-runs when
              it remounts, and React only remounts on a key change, so the
              key is greekRevealCount (bumped once per transition into
              Greek, see showGreekLabel above) rather than a fixed
              string. */}
          {isHome && (
            <div
              className={`pointer-events-none absolute inset-0 font-sans font-bold text-2xl text-white transition-opacity duration-300 ease-out ${showGreek ? "opacity-100" : "opacity-0"}`}
            >
              <Link
                href="/"
                tabIndex={showGreek ? undefined : -1}
                aria-hidden={!showGreek}
                className={showGreek ? "pointer-events-auto" : "pointer-events-none"}
              >
                {greekRevealCount > 0 ? (
                  <ScrambleText key={greekRevealCount} text="ΚΘΠ" trigger="immediate" as="span" />
                ) : (
                  "ΚΘΠ"
                )}
              </Link>
            </div>
          )}
        </div>

        <nav ref={navLinksRef} className="hidden items-center gap-10 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-base text-white"
            >
              {link.label}
            </Link>
          ))}
          <Button href="/rush">Rush Now</Button>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-px w-6 bg-white transition-transform duration-200 ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-6 bg-white transition-transform duration-200 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
          />
        </button>

        {open && (
          <nav className="absolute top-full left-0 flex w-full flex-col gap-6 bg-navy px-6 py-8 md:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-sans text-lg text-white"
              >
                {link.label}
              </Link>
            ))}
            <Button href="/rush" className="self-start">
              Rush Now
            </Button>
          </nav>
        )}
      </header>
    </>
  );
}
