"use client";

import { useState } from "react";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { isCoarsePointer } from "@/lib/isTouchDevice";

type MemberCardProps = {
  index: number;
  name: string;
  photo?: string;
  major: string;
  classYear: string;
  role?: string;
  linkedin?: string;
  email?: string;
};

/**
 * Matches the Figma "Person Card" component (node 3877:1948): a single
 * bordered box — centered role title (exec only) inside the top padding,
 * photo filling the rest with a subtle navy gradient, and a left-aligned
 * name/tags block pinned over the photo's bottom edge on its own stronger
 * navy gradient. On hover the LinkedIn/email row grows in below the tags
 * (height + opacity, not a plain fade) — since the block is bottom-
 * anchored, that growth pushes the name/tags up, matching the Figma
 * default→hover states (top: 230px → 201px) instead of just cross-fading
 * icons into pre-reserved space.
 */
export default function MemberCard({
  index,
  name,
  photo,
  major,
  classYear,
  role,
  linkedin,
  email,
}: MemberCardProps) {
  const [revealed, setRevealed] = useState(false);
  const hasLinks = Boolean(linkedin || email);

  return (
    <figure
      className="relative flex aspect-[232/303] flex-col gap-3 border-r border-b border-black/70 p-3 transition-colors duration-200 hover:border-black"
      onPointerEnter={() => {
        if (!isCoarsePointer()) setRevealed(true);
      }}
      onPointerLeave={() => {
        if (!isCoarsePointer()) setRevealed(false);
      }}
      onClick={() => {
        if (isCoarsePointer()) setRevealed((r) => !r);
      }}
    >
      {role && (
        <p className="shrink-0 truncate text-center font-sans text-base font-medium uppercase text-black">
          {role}
        </p>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <PlaceholderImage n={index + 1} className="absolute inset-0 h-full w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/0 to-navy/20" />
      </div>

      <div className="absolute inset-x-3 bottom-2 flex flex-col bg-gradient-to-t from-navy from-20% to-transparent px-2 pt-8 pb-2">
        <figcaption className="truncate font-sans text-sm font-medium text-white">{name}</figcaption>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="bg-black px-2 py-1 font-mono text-[10px] uppercase text-white">
            {major}
          </span>
          <span className="bg-black px-2 py-1 font-mono text-[10px] uppercase text-white">
            Class of {classYear}
          </span>
        </div>

        {/* Always mounted (once hasLinks) so the height transition below
            has something to animate between — a conditionally-rendered
            row can't transition in on mount. */}
        {hasLinks && (
          <div
            className={`flex items-center gap-3 overflow-hidden transition-[max-height,margin-top,opacity] duration-200 ease-out ${
              revealed ? "mt-2 max-h-6 opacity-100" : "mt-0 max-h-0 opacity-0"
            }`}
          >
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} on LinkedIn`}
              >
                <LinkedInIcon />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} aria-label={`Email ${name}`}>
                <MailIcon />
              </a>
            )}
          </div>
        )}
      </div>
    </figure>
  );
}

// Exact vector paths exported from the Figma "Person Card" hover state
// (node 3877:1970 / 3877:1971), not hand-drawn approximations.
function LinkedInIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.1111 0C15.6121 0 16.0925 0.199007 16.4468 0.553243C16.801 0.907478 17 1.38792 17 1.88889V15.1111C17 15.6121 16.801 16.0925 16.4468 16.4468C16.0925 16.801 15.6121 17 15.1111 17H1.88889C1.38792 17 0.907478 16.801 0.553243 16.4468C0.199007 16.0925 0 15.6121 0 15.1111V1.88889C0 1.38792 0.199007 0.907478 0.553243 0.553243C0.907478 0.199007 1.38792 0 1.88889 0H15.1111ZM14.6389 14.6389V9.63333C14.6389 8.81676 14.3145 8.03363 13.7371 7.45623C13.1597 6.87883 12.3766 6.55444 11.56 6.55444C10.7572 6.55444 9.82222 7.04556 9.36889 7.78222V6.73389H6.73389V14.6389H9.36889V9.98278C9.36889 9.25556 9.95445 8.66056 10.6817 8.66056C11.0323 8.66056 11.3687 8.79986 11.6166 9.04783C11.8646 9.29579 12.0039 9.6321 12.0039 9.98278V14.6389H14.6389ZM3.66444 5.25111C4.08525 5.25111 4.48883 5.08395 4.78639 4.78639C5.08395 4.48883 5.25111 4.08525 5.25111 3.66444C5.25111 2.78611 4.54278 2.06833 3.66444 2.06833C3.24113 2.06833 2.83515 2.23649 2.53582 2.53582C2.23649 2.83515 2.06833 3.24113 2.06833 3.66444C2.06833 4.54278 2.78611 5.25111 3.66444 5.25111ZM4.97722 14.6389V6.73389H2.36111V14.6389H4.97722Z"
        fill="white"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 0H2C0.9 0 0.00999999 0.9 0.00999999 2L0 14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 4L10 9L2 4V2L10 7L18 2V4Z"
        fill="white"
      />
    </svg>
  );
}
