"use client";

import { useEffect, useRef, useState } from "react";
import AlbumTag from "@/components/gallery/AlbumTag";
import GalleryCard from "@/components/gallery/GalleryCard";

type GalleryFrontmatter = {
  image?: string;
  caption: string;
  album?: string;
  order?: number;
};

export type GalleryEntry = GalleryFrontmatter & { slug: string };

// Cycled by index so card sizes vary (matches the Figma's portrait/landscape
// mix) without needing per-entry layout data — purely deterministic, so
// server and client render identical markup and adding a new content entry
// never requires touching this file.
const ASPECT_VARIANTS = [
  "aspect-[215/250]",
  "aspect-[378/250]",
  "aspect-square",
  "aspect-[215/250]",
];

// Deterministic pseudo-random stagger per index (never Math.random() — that
// would render differently on the server vs. the client and break
// hydration). Gives the scattered "floating" feel instead of a rigid grid.
function staggerPx(index: number) {
  const fraction = Math.abs(Math.sin(index * 12.9898) * 43758.5453) % 1;
  return Math.round(fraction * 40);
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
  wrapperClassName,
  revealedSlug,
  onToggleReveal,
}: {
  items: GalleryEntry[];
  columnCount: number;
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
        <div key={ci} className="flex flex-1 flex-col gap-6">
          {column.map(({ item, index }) => (
            <GalleryCard
              key={item.slug}
              index={index}
              image={item.image}
              caption={item.caption}
              album={item.album}
              className={ASPECT_VARIANTS[index % ASPECT_VARIANTS.length]}
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
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

  // Tracks which album's photos are centered in the viewport, independent of
  // GSAP/ScrollSmoother — IntersectionObserver reads real bounding boxes, so
  // it stays correct whether the page scrolls natively or via the
  // transform-based smoother. The hidden breakpoint variants above never
  // intersect (no layout box), so only the visible one is ever counted.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-gallery-card]"));
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          setActiveAlbum((visible.target as HTMLElement).dataset.album ?? null);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [items]);

  return (
    <>
      <div ref={gridRef}>
        <MasonryColumns
          items={items}
          columnCount={2}
          wrapperClassName="flex gap-6 px-6 pt-12 pb-32 md:hidden"
          revealedSlug={revealedSlug}
          onToggleReveal={toggleReveal}
        />
        <MasonryColumns
          items={items}
          columnCount={3}
          wrapperClassName="hidden gap-6 px-[38px] pt-12 pb-32 md:flex lg:hidden"
          revealedSlug={revealedSlug}
          onToggleReveal={toggleReveal}
        />
        <MasonryColumns
          items={items}
          columnCount={4}
          wrapperClassName="hidden gap-6 px-[38px] pt-12 pb-32 lg:flex"
          revealedSlug={revealedSlug}
          onToggleReveal={toggleReveal}
        />
      </div>
      <AlbumTag album={activeAlbum} />
    </>
  );
}
