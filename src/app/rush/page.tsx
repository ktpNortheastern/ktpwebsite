import type { Metadata } from "next";
import { getCollection } from "@/lib/content";
import RushTimeline from "@/components/rush/RushTimeline";
import type { RushEvent } from "@/components/rush/RushEventCard";

export const metadata: Metadata = {
  title: "Rush | KTP Northeastern",
};

// TODO(design feedback): "Applications are due 9/16" is page copy, not a
// CMS field — swap in the real Fall 2026 deadline when confirmed.
const APPLICATIONS_DUE = "Applications are due 9/16";
const APPLY_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdOOtrz029JD4sbGDL0VcgNzS_qOYyQn-uq3AyqMSTH8tB98A/viewform";

export default function RushPage() {
  const events = getCollection<RushEvent>("rush-events");

  return (
    <RushTimeline events={events} applicationsDue={APPLICATIONS_DUE} applyUrl={APPLY_URL} />
  );
}
