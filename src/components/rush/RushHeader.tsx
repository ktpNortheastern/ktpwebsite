import Button from "@/components/ui/Button";

type RushHeaderProps = {
  applicationsDue: string;
  applyUrl: string;
};

// Plain and static. RushTimeline now pins its WHOLE section (both this
// header and the schedule beside it) as one block for the scrub-driven
// reveal — see RushScheduleTrack — so this doesn't need its own
// ScrollTrigger pin the way it did when the schedule was a tall
// free-scrolling column next to it: once the section is pinned, this
// column is already staying in place for free, along with everything
// else in it.
export default function RushHeader({ applicationsDue, applyUrl }: RushHeaderProps) {
  return (
    <div className="flex w-fit flex-col items-start gap-2">
      {/* whitespace-nowrap backs up the column's own w-fit + shrink-0
          (RushTimeline) — together they size the column to whatever
          width this line needs and never let it shrink below that, so
          this never wraps onto a second line. */}
      <p className="font-sans text-2xl font-bold whitespace-nowrap text-black md:text-[30px]">
        (&nbsp;&nbsp;&nbsp;&nbsp;FALL 2026 RUSH SCHEDULE&nbsp;&nbsp;&nbsp;&nbsp;)
      </p>
      <p className="font-sans text-base font-medium text-black">{applicationsDue}</p>
      {/* Same flip-up hover as the nav's Rush Now button, just without its
          arrow — arrow={false} covers that instead of a bespoke plain link. */}
      <Button
        href={applyUrl}
        variant="dark"
        arrow={false}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 w-fit"
      >
        Apply Now
      </Button>
    </div>
  );
}
