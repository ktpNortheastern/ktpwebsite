import type { ReactNode } from "react";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
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
  // Lets RushTimeline measure exactly where this card's image box ends, to
  // size the progress line against a real DOM position instead of a
  // guessed pixel value — attached to a shared wrapper (below) so it
  // resolves to the same box regardless of whether `image` is set.
  imageRef?: (el: HTMLDivElement | null) => void;
};

export default function RushEventCard({ event, index, imageRef }: RushEventCardProps) {
  const { title, description, inviteOnly, date, time, location, image } = event;

  return (
    <div className="flex flex-col gap-5 sm:h-[160px] sm:flex-row sm:items-start">
      {/* The translucent blue "glass" treatment lives on the CONTAINER now
          (moved from the tags, which read as too solid/attention-grabbing) —
          light tint + soft border, dark text for legibility against it. */}
      <div className="flex w-full flex-col justify-center gap-4 border border-[#2e5b99]/40 bg-[#2e5b99]/20 px-6 py-6 sm:h-full sm:w-[468px] sm:px-9 sm:py-7">
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between gap-4">
            <p className="font-sans text-base font-bold text-navy">{title}</p>
            <p className="shrink-0 font-sans text-base font-bold text-navy/50">
              ({String(index + 1).padStart(2, "0")})
            </p>
          </div>
          <p className="line-clamp-2 font-sans text-base text-navy/70">{description}</p>
        </div>

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

      <div ref={imageRef} className="h-[160px] w-full shrink-0 sm:w-[160px]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <PlaceholderImage n={index + 1} className="h-full w-full" />
        )}
      </div>
    </div>
  );
}

// Simple outline only — no fill, no rounded corners — now that the card
// itself carries the color treatment these used to have.
function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="border border-navy px-2 py-0.5 font-sans text-xs font-medium whitespace-nowrap text-navy">
      {children}
    </span>
  );
}
