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
const BREAKPOINTS: { cols: number; wrapperClass: string }[] = [
  { cols: 3, wrapperClass: "grid grid-cols-3 sm:hidden" },
  { cols: 4, wrapperClass: "hidden sm:grid sm:grid-cols-4 md:hidden" },
  { cols: 6, wrapperClass: "hidden md:grid md:grid-cols-6 lg:hidden" },
  { cols: 7, wrapperClass: "hidden lg:grid lg:grid-cols-7" },
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
    <section id={slug} className="border-t border-black/10 px-6 first:border-t-0 md:px-[38px]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-baseline justify-between gap-3 py-4 text-left"
      >
        <span className="flex items-baseline gap-3 font-mono font-bold text-black">
          <span>{String(index).padStart(2, "0")}.</span>
          <span className="text-lg">{name}</span>
          <span className="font-mono text-xs font-normal text-black/40">
            ({members.length})
          </span>
        </span>
        <span
          className={`font-mono text-lg text-black transition-transform duration-200 ${expanded ? "rotate-45" : ""}`}
        >
          +
        </span>
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
