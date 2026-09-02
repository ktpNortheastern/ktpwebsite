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
    <section className="min-h-screen bg-[#fafafa] pt-[var(--nav-h)]">
      <MembersView classes={classes} membersByClass={membersByClass} />
    </section>
  );
}
