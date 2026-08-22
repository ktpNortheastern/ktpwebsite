import type { Metadata } from "next";
import { getCollection } from "@/lib/content";
import GalleryGrid, { type GalleryEntry } from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery | KTP Northeastern",
};

export default function GalleryPage() {
  const items = getCollection<Omit<GalleryEntry, "slug">>("gallery");

  return (
    <section className="relative min-h-screen overflow-hidden bg-navy pt-[68px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:16px_16px] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      />
      <GalleryGrid items={items} />
    </section>
  );
}
