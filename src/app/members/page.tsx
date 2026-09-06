import type { Metadata } from "next";
import { getCollection } from "@/lib/content";
import MembersView, { type ClassEntry, type MemberEntry } from "@/components/members/MembersView";

export const metadata: Metadata = {
  title: "Members | KTP Northeastern",
};

// Executive Board keeps a manually-curated order (its own `order` field,
// set per member in the CMS) — every other class sorts by last name
// automatically instead, so editors never have to hand-order a pledge
// class.
const MANUAL_ORDER_SLUG = "executive-board";

// "Jr"/"III" etc. aren't last names — strip a trailing generational suffix
// before taking the final word as the sort key. Doesn't attempt to handle
// multi-word surnames/particles (e.g. "de Verbigier", "Von Kirchbach") any
// more precisely than "last word" — good enough for alphabetizing a roster,
// not a general name-parsing library.
const NAME_SUFFIXES = new Set(["jr", "jr.", "sr", "sr.", "ii", "iii", "iv", "v"]);

function lastNameKey(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 1 && NAME_SUFFIXES.has(parts[parts.length - 1].toLowerCase())) {
    parts.pop();
  }
  return (parts[parts.length - 1] ?? fullName).toLowerCase();
}

export default function MembersPage() {
  const classes = getCollection<Omit<ClassEntry, "slug">>("classes");
  const members = getCollection<Omit<MemberEntry, "slug">>("members");

  // Alumni is a status, not a class — it doesn't affect where a member is
  // placed. Every member renders under their real, permanent `class`
  // (Gamma, Delta, Executive Board, etc.) regardless of status; there's no
  // separate "Alumni" grouping/section at all.
  const membersByClass: Record<string, MemberEntry[]> = {};
  for (const cls of classes) membersByClass[cls.slug] = [];

  for (const member of members) {
    (membersByClass[member.class] ??= []).push(member);
  }

  for (const [slug, bucket] of Object.entries(membersByClass)) {
    if (slug === MANUAL_ORDER_SLUG) {
      bucket.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
    } else {
      bucket.sort((a, b) => lastNameKey(a.name).localeCompare(lastNameKey(b.name)));
    }
  }

  return (
    <section className="min-h-screen bg-[#fafafa] pt-[var(--nav-h)]">
      <MembersView classes={classes} membersByClass={membersByClass} />
    </section>
  );
}
