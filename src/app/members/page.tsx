import type { Metadata } from "next";
import { getCollection } from "@/lib/content";
import MembersView, { type ClassEntry, type MemberEntry } from "@/components/members/MembersView";

export const metadata: Metadata = {
  title: "Members | KTP Northeastern",
};

export default function MembersPage() {
  const classes = getCollection<Omit<ClassEntry, "slug">>("classes");
  const members = getCollection<Omit<MemberEntry, "slug">>("members");

  // Alumni is a status, not a pledge class — it's deliberately not in the
  // classes collection, so it can't be picked as a member's permanent
  // `class` in the CMS. The page still needs a section for it, added here
  // as a synthetic entry (same slug/order the old alumni.md class used) so
  // the section itself is unaffected.
  const classesWithAlumni: ClassEntry[] = [
    ...classes,
    { slug: "alumni", name: "Alumni", order: 70 },
  ];

  // Alumni status overrides original class for grouping — a member's `class`
  // field stays their permanent record, but anyone marked Alumni always
  // renders in the Alumni section regardless of where they started.
  const membersByClass: Record<string, MemberEntry[]> = {};
  for (const cls of classesWithAlumni) membersByClass[cls.slug] = [];

  for (const member of members) {
    const bucket = member.status === "Alumni" ? "alumni" : member.class;
    (membersByClass[bucket] ??= []).push(member);
  }

  for (const bucket of Object.values(membersByClass)) {
    bucket.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  }

  return (
    <section className="min-h-screen bg-[#fafafa] pt-[var(--nav-h)]">
      <MembersView classes={classesWithAlumni} membersByClass={membersByClass} />
    </section>
  );
}
