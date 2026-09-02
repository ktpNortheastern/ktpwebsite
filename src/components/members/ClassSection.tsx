import MemberCard from "@/components/members/MemberCard";
import type { MemberEntry } from "@/components/members/MembersView";

type ClassSectionProps = {
  index: number;
  slug: string;
  name: string;
  members: MemberEntry[];
  expanded: boolean;
  onToggle: () => void;
};

// Matches the Figma reference (node 3278:382): cards share a single grid
// border rather than sitting apart with a gap, and a short last row is
// padded out with empty bordered cells so the grid always resolves to a
// clean rectangle instead of a ragged edge. Column count changes per
// breakpoint, so — same trick GalleryGrid uses for its masonry columns —
// each breakpoint gets its own full grid markup toggled by Tailwind
// visibility classes, rather than one grid whose filler count could only
// ever be right for one column count at a time.
// Five across at lg is the mock's grid — it puts the cards at roughly their
// native 232px on a 1448px screen. Column counts step down from there so the
// cards never get narrower than that ratio: md tops out at 4 because the
// 130px gutters only leave ~508px there.
const BREAKPOINTS: { cols: number; wrapperClass: string }[] = [
  { cols: 3, wrapperClass: "grid grid-cols-3 sm:hidden" },
  { cols: 4, wrapperClass: "hidden sm:grid sm:grid-cols-4 lg:hidden" },
  { cols: 5, wrapperClass: "hidden lg:grid lg:grid-cols-5" },
];

function EmptySlot() {
  return <div aria-hidden className="aspect-[232/303] border-r border-b border-black/70" />;
}

export default function ClassSection({
  index,
  slug,
  name,
  members,
  expanded,
  onToggle,
}: ClassSectionProps) {
  return (
    <section id={slug} className="relative mb-9 px-6 md:px-[130px]">
      {/* The container edge is its own masked layer rather than a border on
          the section: the linear-gradient mask leaves the top rule and its
          rounded corners at full strength and dissolves the side rules on the
          way down, so there's no bottom edge to close the box off. Same
          mask-image idiom the dot-grid overlays use (gallery/page.tsx).
          The fade runs a fixed 140px rather than a percentage so a collapsed
          class and an expanded one dissolve over the same distance instead of
          in proportion to their very different heights. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-2 inset-y-0 rounded-t-[32px] border border-black/15 [mask-image:linear-gradient(to_bottom,black,transparent_140px)] md:inset-x-4"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        // Without the "+" the mock leaves nothing to mark the row as
        // clickable, and the custom cursor rules out a pointer shape — so the
        // whole row dims slightly on hover.
        className={`flex w-full items-baseline gap-8 py-10 text-left font-mono font-bold text-black transition-opacity duration-200 hover:opacity-60 md:pt-[76px] ${
          expanded ? "md:pb-10" : "md:pb-[76px]"
        }`}
      >
        <span>{String(index).padStart(2, "0")}.</span>
        <span className="text-lg">{name}</span>
      </button>

      {expanded &&
        (members.length === 0 ? (
          <p className="pb-6 font-mono text-sm text-black/40">
            No members listed yet — check back soon.
          </p>
        ) : (
          <div className="mb-6 border-t border-l border-black/70">
            {BREAKPOINTS.map(({ cols, wrapperClass }) => {
              const remainder = members.length % cols;
              const fillerCount = remainder === 0 ? 0 : cols - remainder;
              return (
                <div key={cols} className={wrapperClass}>
                  {members.map((member, i) => (
                    <MemberCard
                      key={member.slug}
                      index={i}
                      name={member.name}
                      photo={member.photo}
                      major={member.major}
                      classYear={member.classYear}
                      role={member.role}
                      linkedin={member.linkedin}
                      email={member.email}
                    />
                  ))}
                  {Array.from({ length: fillerCount }, (_, i) => (
                    <EmptySlot key={i} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
    </section>
  );
}
