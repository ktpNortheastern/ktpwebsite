"use client";

import { useEffect, useState } from "react";
import GalleryCard from "@/components/gallery/GalleryCard";

type GalleryFrontmatter = {
  image?: string;
  caption: string;
  album?: string;
  order?: number;
};

export type GalleryEntry = GalleryFrontmatter & { slug: string };

// Deterministic pseudo-random stagger per index (never Math.random() — that
// would render differently on the server vs. the client and break
// hydration). Gives the scattered "floating" feel instead of a rigid grid.
function staggerPx(index: number) {
  const fraction = Math.abs(Math.sin(index * 12.9898) * 43758.5453) % 1;
  return Math.round(fraction * 160);
}

// Splits items round-robin across N flex columns, each with its own
// intrinsic (auto) height. CSS `columns-*` looks like the obvious tool for
// this, but Chromium collapses a `columns` container to a single column
// whenever its height is `auto` (which it must be here — the page keeps
// growing as photos are added, so there's no fixed height to give it).
// Rendering one such block per breakpoint and toggling with `hidden`/`flex`
// keeps this pure CSS: no JS measurement, no resize listener, and no
// hydration mismatch (every breakpoint's markup is present in the same SSR
// output, exactly like Tailwind's usual responsive-variant pattern).
function MasonryColumns({
  items,
  columnCount,
  columnGapClassName,
  wrapperClassName,
  revealedSlug,
  onToggleReveal,
}: {
  items: GalleryEntry[];
  columnCount: number;
  columnGapClassName: string;
  wrapperClassName: string;
  revealedSlug: string;
  onToggleReveal: (slug: string) => void;
}) {
  const columns: { item: GalleryEntry; index: number }[][] = Array.from(
    { length: columnCount },
    () => []
  );
  items.forEach((item, index) => columns[index % columnCount].push({ item, index }));

  return (
    <div className={wrapperClassName}>
      {columns.map((column, ci) => (
        <div key={ci} className={`flex flex-1 flex-col ${columnGapClassName}`}>
          {column.map(({ item, index }) => (
            <GalleryCard
              key={item.slug}
              index={index}
              image={item.image}
              caption={item.caption}
              album={item.album}
              style={{ marginTop: staggerPx(index) }}
              revealed={revealedSlug === item.slug}
              onToggleReveal={() => onToggleReveal(item.slug)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function GalleryGrid({ items }: { items: GalleryEntry[] }) {
  const [revealedSlug, setRevealedSlug] = useState("");

  const toggleReveal = (slug: string) =>
    setRevealedSlug((current) => (current === slug ? "" : slug));

  // Mobile tap-to-reveal: tapping outside every card dismisses whichever
  // caption is currently revealed. Tapping a card handles its own
  // reveal/switch via GalleryCard's onToggleReveal above.
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-gallery-card]")) setRevealedSlug("");
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <>
      <MasonryColumns
        items={items}
        columnCount={2}
        columnGapClassName="gap-16"
        wrapperClassName="flex gap-16 px-6 pt-12 pb-32 md:hidden"
        revealedSlug={revealedSlug}
        onToggleReveal={toggleReveal}
      />
      <MasonryColumns
        items={items}
        columnCount={2}
        columnGapClassName="gap-20"
        wrapperClassName="hidden gap-20 px-[38px] pt-12 pb-32 md:flex lg:hidden"
        revealedSlug={revealedSlug}
        onToggleReveal={toggleReveal}
      />
      <MasonryColumns
        items={items}
        columnCount={3}
        columnGapClassName="gap-24"
        wrapperClassName="hidden gap-24 px-[38px] pt-12 pb-32 lg:flex"
        revealedSlug={revealedSlug}
        onToggleReveal={toggleReveal}
      />
    </>
  );
}
