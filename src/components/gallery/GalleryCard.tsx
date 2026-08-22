"use client";

import type { CSSProperties } from "react";
import { useCursor } from "@/components/motion/CustomCursor";
import ScrambleText from "@/components/motion/ScrambleText";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { isCoarsePointer } from "@/lib/isTouchDevice";

type GalleryCardProps = {
  index: number;
  image?: string;
  caption: string;
  album?: string;
  className?: string;
  style?: CSSProperties;
  revealed: boolean;
  onToggleReveal: () => void;
};

/**
 * A single floating photo. On a fine pointer (mouse/trackpad), hovering
 * swaps the shared custom cursor to a scramble-decoded caption bubble.
 * Touch devices have no hover, so tapping reveals the same caption as an
 * in-card overlay instead — dismissed by GalleryGrid's tap-elsewhere listener.
 */
export default function GalleryCard({
  index,
  image,
  caption,
  album,
  className = "",
  style,
  revealed,
  onToggleReveal,
}: GalleryCardProps) {
  const { setState } = useCursor();

  return (
    <figure
      data-gallery-card
      data-album={album}
      className={`relative overflow-hidden bg-[#c0c0c0] ${className}`}
      style={style}
      onPointerEnter={() => {
        if (!isCoarsePointer()) setState("caption", caption);
      }}
      onPointerLeave={() => {
        if (!isCoarsePointer()) setState("default");
      }}
      onClick={() => {
        if (isCoarsePointer()) onToggleReveal();
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={caption} className="size-full object-cover" />
      ) : (
        <PlaceholderImage n={index + 1} className="size-full" />
      )}
      <figcaption className="sr-only">{caption}</figcaption>

      {revealed && (
        <div className="absolute inset-0 flex items-end bg-navy/70 p-3">
          <ScrambleText
            key={caption}
            text={caption}
            trigger="immediate"
            className="font-mono text-xs font-bold text-white"
          />
        </div>
      )}
    </figure>
  );
}
