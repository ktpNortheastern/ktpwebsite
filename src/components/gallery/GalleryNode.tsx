"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useCursor } from "@/components/motion/CustomCursor";
import ScrambleText from "@/components/motion/ScrambleText";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { isCoarsePointer } from "@/lib/isTouchDevice";
import { NODE_W, NODE_H, type Slot } from "@/lib/gallery/canvasLayout";

const TITLE_H = 28;
// Generous enough for several wrapped lines of a real caption — captions
// never truncate/ellipsize, but this is still a fixed reservation (not
// measured per-caption), which is what keeps organically-jittered slots
// guaranteed not to overlap. An extreme outlier caption longer than this
// gets clipped by the node's own overflow-hidden rather than overlapping a
// neighboring node.
const CAPTION_H = 76;
// Room for two short metadata lines (year, brothers) below the caption.
const DETAIL_H = 36;
const IMAGE_H = NODE_H - TITLE_H - CAPTION_H - DETAIL_H;
// Beyond this many names, list "Variety" instead of listing everyone.
const BROTHERS_LIST_MAX = 4;

export type GalleryNodeEntry = {
  slug: string;
  image?: string;
  caption: string;
  year?: number;
  brothers?: string[];
};

type GalleryNodeProps = {
  slot: Slot;
  entry?: GalleryNodeEntry;
};

/**
 * A single node on the canvas: a bordered block with a title bar ("PICTURE
 * NN" + a port dot), an uncropped image (object-contain — there's no
 * stored width/height per image, so rather than force-crop to a fixed box
 * like the old masonry GalleryCard, the image is letterboxed within a
 * fixed-footprint area, which is what keeps slot placement overlap-free),
 * a caption line, and a small year/brothers detail line. Positioned
 * absolutely by its own slot coordinates; clicking is handled by the
 * parent canvas's Draggable.onClick (via the data-slot-id below), not a
 * local onClick, since the whole plane is a single Draggable target.
 */
export default function GalleryNode({ slot, entry }: GalleryNodeProps) {
  const { setState } = useCursor();
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      nodeRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
    );
  }, []);

  const caption = entry?.caption ?? "";
  const label = `PICTURE ${String(slot.id + 1).padStart(2, "0")}`;
  const brothers = entry?.brothers?.filter(Boolean) ?? [];
  const brothersLabel =
    brothers.length > BROTHERS_LIST_MAX ? "Variety" : brothers.join(", ");

  return (
    <div
      ref={nodeRef}
      data-slot-id={slot.id}
      className="absolute flex flex-col overflow-hidden border border-white/20 bg-white/5"
      style={{
        left: slot.x - NODE_W / 2,
        top: slot.y - NODE_H / 2,
        width: NODE_W,
        height: NODE_H,
      }}
      onPointerEnter={() => {
        if (entry && !isCoarsePointer()) setState("caption", caption);
      }}
      onPointerLeave={() => {
        if (entry && !isCoarsePointer()) setState("default");
      }}
    >
      <div className="flex items-center justify-between px-2" style={{ height: TITLE_H }}>
        <span className="font-mono text-xs font-bold tracking-wide text-white">
          {label}
        </span>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
      </div>
      <div
        className="relative flex items-center justify-center py-2"
        style={{ height: IMAGE_H }}
      >
        {entry?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.image}
            alt={entry.caption}
            className="h-full w-full object-contain"
          />
        ) : (
          <PlaceholderImage n={slot.id + 1} className="h-full w-full" />
        )}
      </div>
      <div className="flex items-start overflow-hidden px-2 pt-1.5" style={{ height: CAPTION_H }}>
        {entry && (
          <ScrambleText
            key={entry.slug}
            text={caption}
            trigger="immediate"
            className="font-mono text-sm text-white"
          />
        )}
      </div>
      <div
        className="flex flex-col justify-center gap-0.5 overflow-hidden px-2 pb-2"
        style={{ height: DETAIL_H }}
      >
        {entry?.year && (
          <span className="truncate font-mono text-[10px] uppercase tracking-wide text-white/50">
            Year: {entry.year}
          </span>
        )}
        {brothersLabel && (
          <span className="truncate font-mono text-[10px] uppercase tracking-wide text-white/50">
            Brothers: {brothersLabel}
          </span>
        )}
      </div>
    </div>
  );
}
