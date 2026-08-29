"use client";

import type { ClassEntry } from "@/components/members/MembersView";

type ClassFilterDropdownProps = {
  classes: ClassEntry[];
  value: string;
  onChange: (value: string) => void;
};

/**
 * A real filter, not a jump-to-anchor menu — deliberately deviates from the
 * Figma mock, which shows every class stacked with this control above it.
 * That layout doesn't scale once the roster grows (more classes, hundreds
 * of members): jumping to an anchor still means scrolling past everything
 * else first. Filtering to just the selected class avoids that. Worth
 * raising with the designer since the mock implies scroll-to-section.
 */
export default function ClassFilterDropdown({ classes, value, onChange }: ClassFilterDropdownProps) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by class"
        className="w-full min-w-[180px] appearance-none border border-black bg-white px-3 py-2 pr-8 font-mono text-sm text-black"
      >
        <option value="all">All Classes</option>
        {classes.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-black"
      >
        ▾
      </span>
    </div>
  );
}
