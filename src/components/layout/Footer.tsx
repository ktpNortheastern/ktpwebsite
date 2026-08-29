import type { ReactNode } from "react";
import ScrambleText from "@/components/motion/ScrambleText";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Brothers", href: "/members" },
  { label: "FAQ", href: "/faq" },
  { label: "Gallery", href: "/gallery" },
  { label: "Rush Process", href: "/rush" },
];

// TODO(design feedback): all four hrefs below are still "#" — real profile
// URLs to come from the user, swap in when provided.
const socials = [
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "LinkedIn", href: "#", Icon: LinkedInIcon },
  { label: "Email", href: "#", Icon: MailIcon },
  { label: "GitHub", href: "#", Icon: GitHubIcon },
];

const products = [
  { label: "Omega Chapter Website", href: "#" },
  { label: "Omega Chapter App", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-black px-6 py-16 text-white md:px-[130px]">
      <div className="flex flex-wrap justify-between gap-12">
        <div>
          <p className="font-serif text-5xl font-semibold">
            <ScrambleText as="span" text="ΚΘΠ" />
          </p>
          <p className="mt-2 font-mono text-sm text-white/60">
            For the love of technology.
          </p>
        </div>
        <div className="flex flex-wrap gap-16">
          <FooterColumn title="Navigation" items={navigation} />
          <FooterSocials items={socials} />
          <FooterColumn title="Products" items={products} />
        </div>
      </div>
      <div className="mt-16 flex flex-wrap justify-between font-mono text-xs text-white/50">
        <p>© 2026 Kappa Theta Pi Omega Chapter. All rights reserved.</p>
        <p>Sponsored by Jane Street.</p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="font-sans font-medium">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label}>
            <a href={item.href} className="font-sans text-sm text-white/70">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterSocials({
  items,
}: {
  items: { label: string; href: string; Icon: () => ReactNode }[];
}) {
  return (
    <div>
      <p className="font-sans font-medium">Socials</p>
      <div className="mt-3 flex items-center gap-4">
        {items.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="text-white/70 transition-colors duration-200 hover:text-white"
          >
            <Icon />
          </a>
        ))}
      </div>
    </div>
  );
}

// Standard stroke-based social glyphs (Feather Icons' open-source set) —
// no Figma spec exists for these yet, so this is a reasonable default
// rather than an exported asset.
function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}
