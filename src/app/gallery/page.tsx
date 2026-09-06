import type { Metadata } from "next";
import { getCollection } from "@/lib/content";
import GalleryCanvas, { type GalleryEntry } from "@/components/gallery/GalleryCanvas";

export const metadata: Metadata = {
  title: "Gallery | KTP Northeastern",
};

export default function GalleryPage() {
  const items = getCollection<Omit<GalleryEntry, "slug">>("gallery");

  return (
    // No top padding for the nav — the canvas's own dotted background
    // spans the full viewport, right up under the nav bar. Reserving a
    // solid-navy strip here instead left a static navy block sitting where
    // the nav used to be whenever NavBar auto-hides on this page (see
    // GalleryIntro, which offsets its own title below the nav instead).
    <section className="relative h-screen overflow-hidden bg-navy">
      <GalleryCanvas items={items} />
    </section>
  );
}
