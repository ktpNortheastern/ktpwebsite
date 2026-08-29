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
};

export default function RushEventCard({ event, index }: RushEventCardProps) {
  const { title, description, inviteOnly, date, time, location, image } = event;

  return (
    <div className="flex flex-col gap-5 sm:h-[190px] sm:flex-row sm:items-start">
      <div className="flex w-full flex-col justify-between gap-4 border border-navy bg-[#fdfdfd] px-6 py-6 sm:h-full sm:w-[468px] sm:px-9 sm:py-7">
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between gap-4">
            <p className="font-sans text-base font-bold text-navy">{title}</p>
            <p className="shrink-0 font-sans text-base font-bold text-navy">
              ({String(index + 1).padStart(2, "0")})
            </p>
          </div>
          <p className="line-clamp-2 font-sans text-base text-[#6b6b6b]">{description}</p>
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

      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="h-[190px] w-full shrink-0 object-cover sm:w-[190px]"
        />
      ) : (
        <PlaceholderImage n={index + 1} className="h-[190px] w-full shrink-0 sm:w-[190px]" />
      )}
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="bg-navy px-2 py-0.5 font-sans text-xs whitespace-nowrap text-white">
      {children}
    </span>
  );
}
