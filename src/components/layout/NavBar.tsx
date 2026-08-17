"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";

gsap.registerPlugin(ScrollTrigger);

const links = [
  { label: "Home", href: "/" },
  { label: "Members", href: "/members" },
  { label: "FAQ", href: "/faq" },
  { label: "Gallery", href: "/gallery" },
];

const NAVY = "#0a1d37";

export default function NavBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLAnchorElement>(null);
  const wordmarkInnerRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);

  // Only the home page opens on the big navy "Kappa Theta Pi" headline —
  // every other page has no hero moment to shrink from, so it renders
  // straight into the compact/scrolled nav state.
  useEffect(() => {
    if (!isHome) return;
    const header = headerRef.current;
    const wordmark = wordmarkRef.current;
    const inner = wordmarkInnerRef.current;
    const target = targetRef.current;
    const navLinks = navLinksRef.current;
    if (!header || !wordmark || !inner || !target || !navLinks) return;

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
      const dropY = 28; // how far the headline drifts before it starts shrinking

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "+=280",
          scrub: 0.3,
        },
      });

      tl.set(wordmark, { x: 0, y: 0, scale: 1, color: NAVY, mixBlendMode: "difference" }, 0)
        // Phase 1: the headline holds its size and just follows the
        // scroll down a little — it does NOT start shrinking immediately.
        .to(wordmark, { y: dropY, duration: 1, ease: "none" }, 0)
        // Phase 2: it shrinks and slides into the corner, losing the
        // difference-blend mask and settling to white over the navy bar.
        .to(
          wordmark,
          { x: deltaX, y: deltaY, scale, color: "#ffffff", duration: 2, ease: "none" },
          1,
        )
        .set(wordmark, { mixBlendMode: "normal" }, 2.6);

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
        const targetRect = target!.getBoundingClientRect();

        const naturalRects = items.map((el) => el.getBoundingClientRect());
        const startX = targetRect.right + 80;
        const endX = headerRect.right - 24;
        const span = Math.max(endX - startX, 0);
        const n = items.length;

        return naturalRects.map((rect, i) => {
          const spreadLeft = n > 1 ? startX + (span * i) / (n - 1) : startX;
          return spreadLeft - rect.left;
        });
      }

      function buildNavTimeline() {
        const deltas = buildNavSpread();
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "+=280",
            scrub: 0.3,
          },
        });
        items.forEach((el, i) => {
          tl.fromTo(el, { x: deltas[i] }, { x: 0, duration: 1, ease: "none" }, 0);
        });
        return tl;
      }

      let navTl = buildNavTimeline();
      const onNavResize = () => {
        navTl.scrollTrigger?.kill();
        navTl.kill();
        gsap.set(items, { clearProps: "transform" });
        navTl = buildNavTimeline();
      };
      window.addEventListener("resize", onNavResize);

      return () => {
        window.removeEventListener("resize", onNavResize);
        navTl.scrollTrigger?.kill();
        navTl.kill();
      };
    });

    let tl = buildTimeline();
    const onResize = () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set(wordmark, { clearProps: "transform,color,opacity,mixBlendMode" });
      tl = buildTimeline();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready?.then(() => {
      tl.scrollTrigger?.kill();
      tl.kill();
      tl = buildTimeline();
    });

    return () => {
      window.removeEventListener("resize", onResize);
      tl.scrollTrigger?.kill();
      tl.kill();
      mm.revert();
    };
  }, [isHome]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 z-50 flex h-[68px] w-full items-center justify-between bg-navy px-6 py-5 md:px-[38px]"
    >
      <div
        ref={targetRef}
        className={`font-sans font-bold text-2xl text-white ${isHome ? "invisible" : ""}`}
        aria-hidden={isHome}
      >
        {!isHome && <Link href="/">Kappa Theta Pi</Link>}
        {isHome && "Kappa Theta Pi"}
      </div>

      {isHome && (
        <Link
          ref={wordmarkRef}
          href="/"
          className="pointer-events-auto absolute left-6 right-6 top-[74px] whitespace-nowrap font-sans text-[9vw] font-bold leading-none md:left-[38px] md:right-[38px]"
        >
          <span ref={wordmarkInnerRef} className="inline-block">
            Kappa Theta Pi
          </span>
        </Link>
      )}

      <nav
        ref={navLinksRef}
        className="hidden items-center gap-10 md:flex"
      >
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
  );
}
