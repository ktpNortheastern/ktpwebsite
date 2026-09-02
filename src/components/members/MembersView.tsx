"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  // Which class the dropdown last jumped to — its own label and picked row
  // show it, and it's deliberately not tied to `expanded`: collapsing that
  // class by hand doesn't mean you were never there.
  const [selected, setSelected] = useState("");
  // Every class open on arrival — the whole roster is the point of the page,
  // and the headings stay clickable to collapse the ones you're done with.
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(classes.map((c) => [c.slug, true])),
  );
  // A ref parked for the effect below rather than a scroll inside the click
  // handler: the jump has to happen after React commits the expansion, since
  // opening the section moves everything under it.
  const pendingScroll = useRef<string | null>(null);

  function handlePick(slug: string) {
    setSelected(slug);
    setExpanded((prev) => ({ ...prev, [slug]: true }));
    pendingScroll.current = slug;
  }

  // Keyed on `expanded` so it runs on the commit that opened the section.
  // Toggling a heading open by hand leaves the ref empty and scrolls nothing.
  useEffect(() => {
    const slug = pendingScroll.current;
    if (!slug) return;
    pendingScroll.current = null;

    const target = document.getElementById(slug);
    if (!target) return;

    // The fixed navbar would otherwise cover the heading we just jumped to.
    const navH =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 0;

    // On desktop ScrollSmoother owns scrolling — the wrapper is fixed and the
    // content is transformed, so scrollIntoView/window.scrollTo do nothing
    // there and the jump has to go through the smoother. Below md it never
    // initializes (see SnapScrollContainer) and native scrolling applies.
    const smoother = ScrollSmoother.get();
    if (smoother) {
      // The section just changed height; refresh so the smoother measures the
      // new geometry before resolving the target's offset.
      ScrollTrigger.refresh();
      smoother.scrollTo(target, true, `top ${navH}px`);
      return;
    }
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - navH,
      behavior: "smooth",
    });
  }, [expanded]);

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
            <ClassFilterDropdown classes={classes} value={selected} onSelect={handlePick} />
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

      {classes.map((cls, index) => (
        <ClassSection
          key={cls.slug}
          index={index}
          slug={cls.slug}
          name={cls.name}
          members={membersByClass[cls.slug] ?? []}
          expanded={Boolean(expanded[cls.slug])}
          onToggle={() => setExpanded((prev) => ({ ...prev, [cls.slug]: !prev[cls.slug] }))}
        />
      ))}
    </>
  );
}
