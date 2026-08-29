"use client";

import { useState } from "react";
import ClassFilterDropdown from "@/components/members/ClassFilterDropdown";
import ClassSection from "@/components/members/ClassSection";

export type ClassEntry = {
  slug: string;
  name: string;
  order?: number;
};

export type MemberEntry = {
  slug: string;
  name: string;
  photo?: string;
  major: string;
  classYear: string;
  class: string;
  status: string;
  role?: string;
  linkedin?: string;
  email?: string;
  order?: number;
};

type MembersViewProps = {
  classes: ClassEntry[];
  membersByClass: Record<string, MemberEntry[]>;
};

export default function MembersView({ classes, membersByClass }: MembersViewProps) {
  const [selected, setSelected] = useState("all");
  // Collapsed by default so the page reads as a dense index rather than a
  // long scroll of grids — Executive Board opens first since it's the
  // natural starting point. Selecting a specific class from the dropdown
  // always shows it open regardless of this state (see isOpen below).
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "executive-board": true,
  });

  const visibleClasses = selected === "all" ? classes : classes.filter((c) => c.slug === selected);

  return (
    <>
      <div className="px-6 pb-3 md:px-[38px]">
        <ClassFilterDropdown classes={classes} value={selected} onChange={setSelected} />
      </div>

      {visibleClasses.map((cls) => (
        <ClassSection
          key={cls.slug}
          index={classes.findIndex((c) => c.slug === cls.slug)}
          slug={cls.slug}
          name={cls.name}
          members={membersByClass[cls.slug] ?? []}
          expanded={selected !== "all" || Boolean(expanded[cls.slug])}
          onToggle={() => setExpanded((prev) => ({ ...prev, [cls.slug]: !prev[cls.slug] }))}
        />
      ))}
    </>
  );
}
