import Link from "next/link";
import type { ReactNode } from "react";

// Shared by FaqRow and FaqAccordionRow so answer copy (loaded from content/faq/*.md)
// can mark up inline links with plain markdown syntax — `[label](href)` — instead of
// each caller hand-rolling its own splitting/parsing of the same answer strings.
const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

// Same light-blue-and-bold treatment as the dropdown hover/selected state and
// the rush pill chips, so inline links read as "linked" consistently site-wide.
const LINK_CLASSNAME = "font-bold text-[#2e5b99] underline";

export function renderRichText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  LINK_PATTERN.lastIndex = 0;
  while ((match = LINK_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const [, label, href] = match;
    const isExternal = !href.startsWith("/");
    nodes.push(
      isExternal ? (
        <a
          key={key++}
          href={href}
          className={LINK_CLASSNAME}
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
        >
          {label}
        </a>
      ) : (
        <Link key={key++} href={href} className={LINK_CLASSNAME}>
          {label}
        </Link>
      ),
    );
    lastIndex = LINK_PATTERN.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return nodes;
}
