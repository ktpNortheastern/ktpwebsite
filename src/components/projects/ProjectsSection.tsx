"use client";

import { useState, type ReactNode } from "react";
import GridBackground from "@/components/ui/GridBackground";

type ProjectTab = {
  slug: string;
  index: string;
  label: string;
  year: string;
  title: string;
  subtitle: string;
  // Optional since a project without one yet (see FeaturedImage) falls
  // back to a plain gray square rather than sharing another project's
  // screenshot as a stand-in.
  image?: string;
};

const PROJECT_TABS: ProjectTab[] = [
  {
    slug: "ktp-life-app",
    index: "01",
    label: "KTP LIFE APP",
    year: "2025",
    title: "KTP LIFE APP",
    subtitle:
      "An omega chapter-built app for managing and connecting KTP, now expanding nationally across 20+ KTP chapters.",
    image: "/images/projects/featured-ktp-life-app.png",
  },
  {
    slug: "website-redesign",
    index: "02",
    label: "KTP WEBSITE REDESIGN",
    year: "2026",
    title: "KTP WEBSITE REDESIGN",
    subtitle: "A full redesign of KTP's omega chapter website and digital experience.",
    image: "/images/projects/featured-website-redesign.png",
  },
  {
    slug: "philanthropy",
    index: "03",
    label: "PHILANTHROPY",
    year: "2026",
    title: "PHILANTHROPY",
    subtitle: "More info coming soon.",
    // Philanthropy Work! — cropped to the same ~1.65:1 ratio as
    // featured-website-redesign.png (the original gallery-24.jpg is a
    // portrait photo; object-contain on this box would otherwise
    // letterbox it very differently from the other two tabs).
    image: "/images/uploads/gallery-24-wide.jpg",
  },
];

const MERCH_ITEMS = [
  {
    title: "Fall 26 Collection",
    description: "A mixed media collection inspired by surveillance.",
  },
  {
    title: "Summer 26 Collection",
    description: "A playful merch collection to honor the girlies of KTP.",
  },
  {
    title: "Fall 25 Collection",
    description: "A retro-tech inspired merch collection.",
  },
] as const;

export default function ProjectsSection() {
  return (
    <section className="relative isolate flex min-h-screen flex-col gap-8 bg-[#fafafa] pt-20 pb-16 md:pt-[117px]">
      {/* Much lighter than the default — this page's own frosted panels
          (the featured box, tab rows, merch cards) already carry the
          visual weight, so the grid only needs to read as a faint
          texture behind them, not the more noticeable pattern Rush/FAQ
          use over their comparatively bare backgrounds. */}
      <GridBackground maxAlpha={0.035} />
      <div className="flex flex-col gap-1 px-6 text-black md:px-[130px]">
        <p className="font-sans text-2xl font-bold whitespace-pre md:text-[30px]">
          (&nbsp;&nbsp;&nbsp;&nbsp;OUR PROJECTS&nbsp;&nbsp;&nbsp;&nbsp;)
        </p>
        <p className="font-sans text-base font-medium">
          Select from the tab on the right to view our current and upcoming projects.
        </p>
      </div>

      <ProjectShowcase />

      <div className="flex flex-col gap-8 px-6 md:px-[130px]">
        <h3 className="font-sans text-xl font-bold text-black md:text-2xl">Previous Merch</h3>
        {/* md:gap-0 cancels the mobile gap-10 (stacked-column spacing) at
            the row breakpoint — gap-10 stacked on top of justify-between
            was adding extra minimum spacing rather than letting the cards
            distribute purely evenly. */}
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-between md:gap-0">
          <MerchCard title={MERCH_ITEMS[0].title} description={MERCH_ITEMS[0].description} tilt="left">
            {/* object-top so the crop comes off the bottom, not the top —
                object-cover alone was clipping the top of the hoodie. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/projects/merch-fall-26.png"
              alt="Fall 26 collection hoodie"
              className="h-full w-full object-cover object-top"
            />
          </MerchCard>
          <MerchCard title={MERCH_ITEMS[1].title} description={MERCH_ITEMS[1].description} tilt="right">
            {/* Both insets moved fully positive (previously negative offsets
                pushed them past the container's right edge, clipping) —
                sized down slightly so they stay comfortably inside the
                overflow-hidden bounds regardless of exact aspect ratio. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/projects/merch-summer-26-top.png"
              alt="Summer 26 collection tee, front"
              className="absolute top-[6%] left-[4%] w-[75%] max-w-none -rotate-6 object-contain drop-shadow-md"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/projects/merch-summer-26-bottom.png"
              alt="Summer 26 collection tee, back"
              className="absolute right-[4%] bottom-[6%] w-[52%] max-w-none rotate-3 object-contain drop-shadow-md"
            />
          </MerchCard>
          <MerchCard title={MERCH_ITEMS[2].title} description={MERCH_ITEMS[2].description} tilt="left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/projects/merch-fall-25.png"
              alt="Fall 25 collection tee"
              className="h-full w-full object-cover"
            />
          </MerchCard>
        </div>
      </div>
    </section>
  );
}

function ProjectShowcase() {
  const [activeSlug, setActiveSlug] = useState(PROJECT_TABS[0].slug);
  const active = PROJECT_TABS.find((p) => p.slug === activeSlug) ?? PROJECT_TABS[0];

  return (
    // Shorter than Figma's 593px on purpose — sized so the whole page
    // (header + this box) doesn't quite fill one viewport, leaving the
    // "Previous Merch" heading peeking in at the bottom as a cue that
    // there's more below, rather than the fold landing exactly on the box's
    // edge.
    <div className="flex w-full flex-col items-start gap-10 px-6 md:flex-row md:justify-between md:px-[130px]">
      {/* The border stays crisp on the container itself; the frosted
          fill (bg-white/60 + a light backdrop-blur-sm, not the rush
          cards' -md, since this box's photo already carries plenty of
          its own visual weight) lives on its own absolutely-positioned
          layer behind the real content, masked to feather toward the
          edges (an ellipse, not the box's hard rectangle) so it reads
          as a soft glass panel inside a defined frame rather than a
          flat rectangle cutting off — solid enough through the middle
          (60%) that the caption text stays fully readable. */}
      <div className="relative flex w-full flex-col gap-7 border border-black/20 p-5 md:h-[420px] md:w-[579px]">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-white/60 backdrop-blur-sm [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"
        />
        <div className="relative z-10 min-h-0 w-full flex-1 overflow-hidden">
          <FeaturedImage key={active.slug} src={active.image} />
        </div>
        <div className="relative z-10">
          <FeaturedCaption key={active.slug} title={active.title} subtitle={active.subtitle} />
        </div>
      </div>

      <div className="flex w-full flex-col md:w-[529px]">
        {PROJECT_TABS.map((project) => (
          <TabRow
            key={project.slug}
            project={project}
            onSelect={() => setActiveSlug(project.slug)}
          />
        ))}
      </div>
    </div>
  );
}

// Both the image and the caption replay a short fade-and-settle whenever the
// selected tab changes — a plain crossfade rather than a scramble decode,
// since scrambling every character on every tab click risked reading as
// gimmicky for something the user will likely click through several times in
// a row. The parent keys these by the active tab's slug, so React fully
// remounts a fresh element on every switch — the CSS animation classes below
// replay automatically on that new element, with no JS-driven mounted state
// needed to retrigger them.
function FeaturedImage({ src }: { src?: string }) {
  if (!src) {
    return (
      <div className="absolute inset-0 animate-[fade-in-up_500ms_ease-out] bg-[#d9d9d9]" />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="absolute inset-0 h-full w-full animate-[fade-in-up_500ms_ease-out] object-contain"
    />
  );
}

function FeaturedCaption({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex w-full animate-[fade-in-up_500ms_ease-out] flex-col gap-0.5">
      <p className="font-mono text-2xl font-bold text-black md:text-[30px]">{title}</p>
      <p className="font-sans text-base text-black">{subtitle}</p>
    </div>
  );
}

function TabRow({ project, onSelect }: { project: ProjectTab; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex w-full items-center gap-6 overflow-hidden border-t border-black/20 p-5 text-left last:border-b"
    >
      {/* Frosted fill on its own layer (see Field/the featured project
          box above), masked to feather toward the edges instead of
          cutting off as a flat rectangle — solid enough through the
          middle (60%) that the index/title/year text reads clearly. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white/60 backdrop-blur-sm [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"
      />
      {/* Same left-to-right gray wipe as FaqRow/ContactSection's fields. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-black/[0.04] transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
      {/* A small preview of the project's own featured image (see
          FeaturedImage above), not a flat swatch — object-contain scales
          the whole image DOWN to fit this box at its own real
          proportions, rather than object-cover's crop (which sliced a
          near-random strip out of the app screenshot's portrait shape).
          Falls back to the old flat swatch for a project with no image
          yet. */}
      {project.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.image}
          alt=""
          className="relative z-10 h-[37px] w-20 shrink-0 object-contain"
        />
      ) : (
        <span aria-hidden className="relative z-10 h-[37px] w-20 shrink-0 bg-[#d9d9d9]" />
      )}
      <span className="relative z-10 flex flex-1 items-center justify-between font-sans text-sm whitespace-nowrap text-black">
        <span>{project.index}</span>
        <span>{project.label}</span>
        <span>{project.year}</span>
      </span>
    </button>
  );
}

// Non-interactive (no click target yet) — hover just tilts the image for a
// bit of life, alternating direction per card (via the `tilt` prop, passed
// explicitly by the caller) rather than every card tilting the same way.
function MerchCard({
  title,
  description,
  tilt,
  children,
}: {
  title: string;
  description: string;
  tilt: "left" | "right";
  children: ReactNode;
}) {
  return (
    <div className="relative flex w-full max-w-[332px] flex-col items-center gap-7 px-3 py-5">
      {/* Frosted fill on its own layer (see Field/TabRow above), masked
          to feather toward the edges instead of cutting off as a flat
          rectangle — solid enough through the middle (60%) that the
          title/description text reads clearly. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white/60 backdrop-blur-sm [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"
      />
      <div className="group relative z-10 h-[300px] w-full overflow-hidden">
        <div
          className={`absolute inset-0 transition-transform duration-300 ease-out ${
            tilt === "left" ? "group-hover:-rotate-2" : "group-hover:rotate-2"
          }`}
        >
          {children}
        </div>
      </div>
      <div className="relative z-10 flex w-full flex-col gap-0.5">
        <p className="font-mono text-2xl font-bold text-black">{title}</p>
        <p className="font-sans text-base text-black/60">{description}</p>
      </div>
    </div>
  );
}
