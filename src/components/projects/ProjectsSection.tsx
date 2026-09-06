"use client";

import { useState, type ReactNode } from "react";

type ProjectTab = {
  slug: string;
  index: string;
  label: string;
  year: string;
  title: string;
  subtitle: string;
};

// Figma's file only supplied one real image (the KTP Life App phone mockup)
// for this featured box — Website Redesign and Philanthropy don't have their
// own screenshots yet, so all three tabs share it for now as a nicer stand-in
// than a plain gray box, not as each project's actual, correct image.
const FEATURED_PLACEHOLDER_IMAGE = "/images/projects/featured-placeholder.png";

const PROJECT_TABS: ProjectTab[] = [
  {
    slug: "ktp-life-app",
    index: "01",
    label: "KTP LIFE APP",
    year: "2026",
    title: "KTP LIFE APP",
    subtitle: "Desc",
  },
  {
    slug: "website-redesign",
    index: "02",
    label: "WEBSITE REDESIGN",
    year: "2026",
    title: "WEBSITE REDESIGN",
    subtitle: "Desc",
  },
  {
    slug: "philanthropy",
    index: "03",
    label: "PHILANTHROPY",
    year: "2026",
    title: "PHILANTHROPY",
    subtitle: "Desc",
  },
];

const MERCH_ITEMS = [
  { title: "Fall 26 Collection" },
  { title: "Summer 26 Collection" },
  { title: "Fall 25 Collection" },
] as const;

export default function ProjectsSection() {
  return (
    <section className="flex min-h-screen flex-col gap-8 bg-[#fafafa] pt-20 pb-16 md:pt-[110px]">
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
          <MerchCard title={MERCH_ITEMS[0].title} tilt="left">
            {/* object-top so the crop comes off the bottom, not the top —
                object-cover alone was clipping the top of the hoodie. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/projects/merch-fall-26.png"
              alt="Fall 26 collection hoodie"
              className="h-full w-full object-cover object-top"
            />
          </MerchCard>
          <MerchCard title={MERCH_ITEMS[1].title} tilt="right">
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
          <MerchCard title={MERCH_ITEMS[2].title} tilt="left">
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
      <div className="flex w-full flex-col gap-7 border border-black p-5 md:h-[420px] md:w-[579px]">
        <div className="relative min-h-0 w-full flex-1 overflow-hidden">
          <FeaturedImage key={active.slug} src={FEATURED_PLACEHOLDER_IMAGE} />
        </div>
        <FeaturedCaption key={active.slug} title={active.title} subtitle={active.subtitle} />
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
function FeaturedImage({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="absolute inset-0 h-full w-full animate-[fade-in_500ms_ease-out] object-contain"
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
      className="group relative flex w-full items-center gap-6 overflow-hidden border-t border-black p-5 text-left last:border-b"
    >
      {/* Same left-to-right gray wipe as FaqRow/ContactSection's fields. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-black/[0.04] transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
      <span aria-hidden className="relative z-10 h-[37px] w-20 shrink-0 bg-[#d9d9d9]" />
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
  tilt,
  children,
}: {
  title: string;
  tilt: "left" | "right";
  children: ReactNode;
}) {
  return (
    <div className="flex w-full max-w-[332px] flex-col items-center gap-7 px-3 py-5">
      <div className="group relative h-[300px] w-full overflow-hidden">
        <div
          className={`absolute inset-0 transition-transform duration-300 ease-out ${
            tilt === "left" ? "group-hover:-rotate-2" : "group-hover:rotate-2"
          }`}
        >
          {children}
        </div>
      </div>
      <div className="flex w-full flex-col gap-0.5">
        <p className="font-mono text-2xl font-bold text-black">{title}</p>
        <p className="font-sans text-base text-black/60">Description</p>
      </div>
    </div>
  );
}
