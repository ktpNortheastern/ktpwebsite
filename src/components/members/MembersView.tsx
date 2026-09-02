"use client";

import { useState } from "react";
import ClassFilterDropdown from "@/components/members/ClassFilterDropdown";
import ClassSection from "@/components/members/ClassSection";

export type ClassEntry = {
  slug: string;
  name: string;
  order?: number;
};

export type MemberEntry = {
  slug: string;
  name: string;
  photo?: string;
  major: string;
  classYear: string;
  class: string;
  status: string;
  role?: string;
  linkedin?: string;
  email?: string;
  order?: number;
};

type MembersViewProps = {
  classes: ClassEntry[];
  membersByClass: Record<string, MemberEntry[]>;
};

export default function MembersView({ classes, membersByClass }: MembersViewProps) {
  const [selected, setSelected] = useState("all");
  // Collapsed by default so the page reads as a dense index rather than a
  // long scroll of grids — Executive Board opens first since it's the
  // natural starting point. Selecting a specific class from the dropdown
  // always shows it open regardless of this state (see isOpen below).
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "executive-board": true,
  });

  const visibleClasses = selected === "all" ? classes : classes.filter((c) => c.slug === selected);

  return (
    <>
      {/* The intro copy lives here rather than in the server page component
          because the mock puts the class filter inside this text column,
          alongside the ASCII hand — as a sibling block below the hero row it
          would land underneath the hand instead. */}
      <div className="flex items-start justify-between gap-6 px-6 pt-10 pb-6 md:px-[130px] md:pt-[88px]">
        {/* shrink-0 only from lg, where the hand is beside it — below that
            the column has to be free to shrink under 440px. */}
        <div className="max-w-[440px] lg:shrink-0">
          {/* Steps down below sm because the padded parens make this string
              wide enough to force horizontal page overflow at 375px. */}
          <p className="font-sans text-lg leading-none font-bold text-black sm:text-2xl md:text-[30px]">
            (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MEET OUR BROTHERS&nbsp;&nbsp;&nbsp;&nbsp;)
          </p>
          <p className="mt-10 font-sans text-base text-black">
            Our members are shaping technology as engineers, designers, product thinkers,
            founders, and operators building at the edge of what&apos;s possible. Kappa Theta
            Pi is a collective of people who don&apos;t wait for opportunity.
          </p>
          <p className="mt-2 font-sans text-base text-black">
            The best way to predict your future is to invent it. Build with us.
          </p>
          <div className="mt-6">
            <ClassFilterDropdown classes={classes} value={selected} onChange={setSelected} />
          </div>
        </div>
        {/* aspect matches the asset's own 622x476 so object-contain doesn't
            letterbox it, and the box is sized past the mock's 500px hand
            because roughly 18% of the PNG's width is transparent padding.
            Below lg the 130px gutters leave no room for it beside the copy. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/members-hand-ascii.png"
          alt=""
          className="hidden aspect-[622/476] w-[610px] min-w-0 object-contain lg:block"
        />
      </div>

      {visibleClasses.map((cls) => (
        <ClassSection
          key={cls.slug}
          index={classes.findIndex((c) => c.slug === cls.slug)}
          slug={cls.slug}
          name={cls.name}
          members={membersByClass[cls.slug] ?? []}
          expanded={selected !== "all" || Boolean(expanded[cls.slug])}
          onToggle={() => setExpanded((prev) => ({ ...prev, [cls.slug]: !prev[cls.slug] }))}
        />
      ))}
    </>
  );
}
