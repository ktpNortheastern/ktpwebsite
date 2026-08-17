"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

const links = [
  { label: "Home", href: "/" },
  { label: "Members", href: "/members" },
  { label: "FAQ", href: "/faq" },
  { label: "Gallery", href: "/gallery" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 flex h-[68px] w-full items-center justify-between bg-navy px-6 py-5 md:px-[38px]">
      <Link href="/" className="font-serif font-semibold text-2xl text-white">
        ΚΘΠ
      </Link>

      <nav className="hidden items-center gap-10 md:flex">
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
