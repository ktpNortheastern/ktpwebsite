import type { Metadata } from "next";
import { getCollection } from "@/lib/content";
import MembersView, { type ClassEntry, type MemberEntry } from "@/components/members/MembersView";

export const metadata: Metadata = {
  title: "Members | KTP Northeastern",
};

export default function MembersPage() {
  const classes = getCollection<Omit<ClassEntry, "slug">>("classes");
  const members = getCollection<Omit<MemberEntry, "slug">>("members");

  // Alumni status overrides original class for grouping — a member's `class`
  // field stays their permanent record, but anyone marked Alumni always
  // renders in the Alumni section regardless of where they started.
  const membersByClass: Record<string, MemberEntry[]> = {};
  for (const cls of classes) membersByClass[cls.slug] = [];

  for (const member of members) {
    const bucket = member.status === "Alumni" ? "alumni" : member.class;
    (membersByClass[bucket] ??= []).push(member);
  }

  for (const bucket of Object.values(membersByClass)) {
    bucket.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  }

  return (
    <section className="min-h-screen bg-white pt-[var(--nav-h)]">
      <div className="flex items-start justify-between gap-6 px-6 py-5 md:px-[38px] md:py-6">
        <div className="max-w-lg">
          <p className="font-mono text-sm text-black/50">( Meet Our Brothers )</p>
          <div className="mt-2 border-t border-black/20" />
          <p className="mt-3 font-sans text-sm text-black">
            Our members are shaping technology as engineers, designers, product thinkers,
            founders, and operators building at the edge of what&apos;s possible. Kappa Theta
            Pi is a collective of people who don&apos;t wait for opportunity.
          </p>
          <p className="mt-2 font-sans text-sm font-medium text-black">
            The best way to predict your future is to invent it. Build with us.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/members-hand-ascii.png"
          alt=""
          className="hidden aspect-[486/413] w-40 shrink-0 object-contain md:block lg:w-56"
        />
      </div>

      <MembersView classes={classes} membersByClass={membersByClass} />
    </section>
  );
}
