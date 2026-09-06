"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";

// The gallery's infinite canvas needs its full viewport height — a footer
// below it would just be dead space the user has to scroll past for no
// reason on a page that isn't meant to be scrolled.
const HIDDEN_ON = new Set(["/gallery"]);

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDDEN_ON.has(pathname)) return null;
  // `key={pathname}` forces a fresh mount per route. Footer itself lives
  // in the root layout and — unlike page content — never naturally
  // unmounts across client-side navigations, so without this its "ΚΘΠ"
  // ScrambleText's scroll-triggered decode (a `once: true` ScrollTrigger,
  // plus a randomize-on-mount effect) only ever ran on whichever page
  // happened to be the very first one loaded that session: on later pages
  // it either stayed permanently scrambled (trigger never refired) or
  // permanently un-scrambled (trigger had already fired once, elsewhere).
  return <Footer key={pathname} />;
}
