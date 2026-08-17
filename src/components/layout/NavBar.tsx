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

const GOLD = "#c9a24a";

export default function NavBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);

  const wordmarkRef = useRef<HTMLAnchorElement>(null);
  const brandMarkRef = useRef<HTMLAnchorElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);

  // Only the home page opens on the big gold "Kappa Theta Pi" wordmark —
  // every other page has no hero moment to shrink from, so it renders
  // straight into the compact/scrolled nav state. Desktop-only (matchMedia
  // below): mobile keeps the compact mark + hamburger from first paint,
  // matching how SnapScrollContainer skips its own desktop-only scroll
  // rig below `md` rather than shipping a degraded version of it.
  useEffect(() => {
    if (!isHome) return;
    const wordmark = wordmarkRef.current;
    const brandMark = brandMarkRef.current;
    const navLinks = navLinksRef.current;
    if (!wordmark || !brandMark || !navLinks) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      gsap.set(wordmark, { transformOrigin: "0% 0%" });

      // Manual FLIP: measure the big wordmark against the small brand
      // mark it's morphing into, then scrub a translate+scale delta
      // between them so the same element visibly slides from the big
      // full-width headline down into the nav corner, rather than
      // jumping between two independently-styled states.
      function buildTimeline() {
        const bigRect = wordmark!.getBoundingClientRect();
        const smallRect = brandMark!.getBoundingClientRect();
        const scale = smallRect.height / bigRect.height;
        const deltaX = smallRect.left - bigRect.left;
        const deltaY = smallRect.top - bigRect.top;

        return gsap.timeline({
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "+=220",
            scrub: 0.3,
          },
        })
          .fromTo(
            wordmark,
            { x: 0, y: 0, scale: 1, color: GOLD },
            { x: deltaX, y: deltaY, scale, color: "#ffffff", duration: 1, ease: "none" },
            0,
          )
          .to(brandMark, { autoAlpha: 1, duration: 0.3, ease: "none" }, 0.75)
          .to(wordmark, { autoAlpha: 0, duration: 0.25, ease: "none" }, 0.75)
          .to(navLinks, { autoAlpha: 1, x: 0, duration: 1, ease: "none" }, 0);
      }

      let tl = buildTimeline();
      const onResize = () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set(wordmark, { clearProps: "transform,color,opacity,visibility" });
        gsap.set(navLinks, { clearProps: "transform,opacity,visibility" });
        gsap.set(brandMark, { clearProps: "opacity,visibility" });
        tl = buildTimeline();
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });

    return () => mm.revert();
  }, [isHome]);

  return (
    <header className="fixed top-0 left-0 z-50 flex h-[68px] w-full items-center justify-between bg-navy px-6 py-5 md:px-[38px]">
      <Link
        ref={brandMarkRef}
        href="/"
        className={`font-serif font-semibold text-2xl text-white ${isHome ? "md:invisible" : ""}`}
      >
        ΚΘΠ
      </Link>

      {isHome && (
        <Link
          ref={wordmarkRef}
          href="/"
          className="pointer-events-auto absolute left-6 top-[74px] hidden whitespace-nowrap font-sans text-[11vw] font-bold italic leading-none text-[#c9a24a] md:block md:left-[38px]"
        >
          Kappa Theta Pi
        </Link>
      )}

      <nav
        ref={navLinksRef}
        className={`hidden items-center gap-10 md:flex ${isHome ? "invisible translate-x-6" : ""}`}
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
