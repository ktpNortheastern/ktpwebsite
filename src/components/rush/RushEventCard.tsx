import type { ReactNode } from "react";
import { formatEventDate } from "@/lib/formatEventDate";

export type RushEvent = {
  slug: string;
  title: string;
  description: string;
  order?: number;
  inviteOnly?: boolean;
  date?: string;
  time?: string;
  location?: string;
  image?: string;
};

type RushEventCardProps = {
  event: RushEvent;
  index: number;
  // Lets RushScheduleTrack re-scramble the title text each time this
  // card becomes the active one in the desktop crossfade.
  titleRef?: (el: HTMLParagraphElement | null) => void;
};

export default function RushEventCard({ event, index, titleRef }: RushEventCardProps) {
  const { title, description, inviteOnly, date, time, location } = event;

  return (
    <div className="h-full min-h-[200px]">
      {/* Terminal-window styling for the "retro tech" pass: a mono-font
          "EVENT NN" label bar (echoing the gallery node cards' "PICTURE
          NN" + dot treatment) up top, then the title, then description +
          tags. Light gray + translucent (bg-gray-200/60), not the old
          solid bg-[#fafafa] or the blue-tinted white/70 before that, so
          the schedule line/dots drawn behind these cards (see
          RushScheduleTrack) still show through as a soft smear rather
          than a sharp shape competing with the card's text. No image
          column anymore — just this one text block. */}
      <div className="group relative flex w-full flex-col gap-2 overflow-hidden border border-[#2e5b99]/70 bg-gray-200/60 px-6 py-6 backdrop-blur-md sm:px-9 sm:py-7">
        {/* Same left-to-right wipe idiom as ProjectsSection/FaqRow/
            ContactSection's hover fields. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-white/40 transition-transform duration-300 ease-out group-hover:scale-x-100"
        />
        <div className="relative mb-2 flex w-full items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2e5b99]" />
          <span className="font-mono text-xs font-bold tracking-wide text-navy/60 uppercase">
            Event {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <p ref={titleRef} className="relative font-sans text-xl font-bold text-navy md:text-2xl">
          {title}
        </p>

        <div className="relative flex w-full flex-col gap-3">
          {/* No line-clamp — the full description always shows, wrapping
              onto as many lines as it needs, rather than truncating with
              an ellipsis. */}
          <p className="font-sans text-base text-navy/70">{description}</p>

          <div className="flex w-full flex-wrap items-center gap-2">
            {inviteOnly ? (
              <Chip>Details Found Within Invite</Chip>
            ) : (
              <>
                {date && <Chip>{formatEventDate(date)}</Chip>}
                {time && <Chip>{time}</Chip>}
                {location && <Chip>{location}</Chip>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// An inline-code look — a soft fill, no border, like a <code> snippet —
// monotone blue (the same #2e5b99 as the "EVENT NN" label) rather than
// navy, so every accent on this card reads as one color.
function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-sm bg-[#2e5b99]/10 px-1.5 py-0.5 font-mono text-xs font-medium tracking-wide whitespace-nowrap text-[#2e5b99] uppercase">
      {children}
    </span>
  );
}
