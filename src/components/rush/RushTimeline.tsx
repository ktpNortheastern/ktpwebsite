"use client";

import { useRef } from "react";
import RushHeader from "@/components/rush/RushHeader";
import GridBackground from "@/components/ui/GridBackground";
import RushScheduleTrack from "@/components/rush/RushScheduleTrack";
import type { RushEvent } from "@/components/rush/RushEventCard";

type RushTimelineProps = {
  events: RushEvent[];
  applicationsDue: string;
  applyUrl: string;
};

/**
 * One viewport, not a tall scrolling section — the schedule's reveal
 * (see RushScheduleTrack) happens entirely within this screen via a
 * pinned scrub, the same pattern WhyRush/Pillars use elsewhere on the
 * site, rather than by the user scrolling past a tall page of stacked
 * cards. Once the scrub finishes, the pin releases and the footer
 * (RushPage's only sibling) is what's already sitting right below.
 *
 * pt/pb match ContactSection's exactly (pt-20/pb-20, md:pt-[110px]/
 * md:pb-[110px]) with the same `justify-center` — Contact's own comment
 * covers why: matched top/bottom padding is what makes centering's
 * leftover space split evenly, landing the block dead center with equal
 * breathing room above and below instead of top-heavy.
 *
 * The two columns live in their OWN inner wrapper, not directly as this
 * section's flex children — `justify-center` above is on a `flex-col`
 * section with that ONE wrapper as its only child, so it centers the row
 * as a single block (sized to its tallest column, the schedule's) the
 * same way Contact centers its own one content block. Making the
 * section itself `flex-row` and centering each column independently
 * (`items-center`) was the first attempt here, but it centers the much
 * shorter header around its OWN height instead of the row's, sinking it
 * well past where Contact's own title sits despite matching padding.
 * `md:items-start` on the inner row then just top-aligns both columns to
 * that shared, already-centered block instead of re-centering either.
 */
export default function RushTimeline({ events, applicationsDue, applyUrl }: RushTimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      data-snap-section
      className="relative isolate flex min-h-screen flex-col justify-center bg-[#fafafa] px-6 pt-20 pb-20 md:h-screen md:px-[80px] md:pt-[110px] md:pb-[110px]"
    >
      {/* Matches Contact/Projects' lighter grid — this page's own event
          cards already carry the visual weight, so the grid only needs
          to read as a faint texture behind them. */}
      <GridBackground maxAlpha={0.035} />
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-x-16">
        {/* w-fit + shrink-0, not a fixed px width — sized to whatever
            "( FALL 2026 RUSH SCHEDULE )" actually needs to stay on one
            line, so the schedule column (flex-1, below) picks up exactly
            the rest of the row instead of either column leaving dead
            space before the section's own right padding. */}
        <div className="md:w-fit md:shrink-0">
          <RushHeader applicationsDue={applicationsDue} applyUrl={applyUrl} />
        </div>
        <RushScheduleTrack events={events} sectionRef={sectionRef} />
      </div>
    </section>
  );
}
