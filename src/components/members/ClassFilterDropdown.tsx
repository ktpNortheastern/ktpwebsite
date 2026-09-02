"use client";

import { useEffect, useRef, useState } from "react";
import type { ClassEntry } from "@/components/members/MembersView";

type ClassFilterDropdownProps = {
  classes: ClassEntry[];
  value: string;
  onChange: (value: string) => void;
};

// The mock's list reads "Delta / Gamma / Beta / Alpha / Founding" while the
// content files store "Delta Class" etc. — the section headings keep the full
// name, only this narrow list drops the suffix.
function shortLabel(name: string) {
  return name.replace(/ Class$/, "");
}

/**
 * A real filter, not a jump-to-anchor menu — deliberately deviates from the
 * Figma mock, which shows every class stacked with this control above it.
 * That layout doesn't scale once the roster grows (more classes, hundreds
 * of members): jumping to an anchor still means scrolling past everything
 * else first. Filtering to just the selected class avoids that. Worth
 * raising with the designer since the mock implies scroll-to-section.
 *
 * Custom rather than a styled <select> because the mock splits the control
 * into two bordered boxes (label + chevron) with a bordered option list —
 * none of which a native select can render. That costs us the platform's
 * keyboard handling, so listbox semantics and arrow/Escape keys are wired up
 * by hand below. It also matters more than usual that the rows have a hover
 * state: globals.css hides the system cursor everywhere in favor of the
 * custom dot, so there's no pointer shape to signal "clickable".
 */
export default function ClassFilterDropdown({ classes, value, onChange }: ClassFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = classes.find((c) => c.slug === value);

  // Same click-outside idiom as GalleryGrid: a data attribute on the wrapper
  // plus closest(), rather than a ref containment check.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-class-filter]")) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function close({ refocus }: { refocus: boolean }) {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  function select(slug: string) {
    // Re-picking the active class clears back to all classes, which is the
    // only way out of a filter for anyone who opened the list without one
    // selected (the "All Classes" row below only appears once one is).
    onChange(slug === value ? "all" : slug);
    close({ refocus: true });
  }

  // Roving focus across the rows, since these are buttons rather than a
  // native select's options.
  function handleListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();

    const rows = Array.from(listRef.current?.querySelectorAll("button") ?? []);
    const i = rows.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === "ArrowDown" ? i + 1 : i - 1;
    rows[(next + rows.length) % rows.length]?.focus();
  }

  return (
    <div
      data-class-filter
      className="relative inline-block"
      onKeyDown={(e) => {
        if (e.key === "Escape") close({ refocus: true });
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Filter by class"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-stretch gap-1.5 font-mono text-sm text-black"
      >
        <span className="min-w-[128px] border border-black px-3 py-[5px] text-left leading-none">
          {selected ? shortLabel(selected.name) : "Select Class"}
        </span>
        <span aria-hidden className="grid w-[22px] place-items-center border border-black">
          <span className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}>›</span>
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Class"
          onKeyDown={handleListKeyDown}
          // Row borders stay uncollapsed — the mock shows the doubled rule
          // between rows.
          className="absolute top-full left-0 z-20 mt-1.5 w-[156px]"
        >
          {value !== "all" && (
            <Row label="All Classes" selected={false} onSelect={() => select("all")} />
          )}
          {classes.map((c) => (
            <Row
              key={c.slug}
              label={shortLabel(c.name)}
              selected={c.slug === value}
              onSelect={() => select(c.slug)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    // role="none" so the button is the listbox's direct owned option — an
    // <li>'s implicit listitem role would sit between the two.
    <li role="none">
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onSelect}
        className={`block w-full border border-black bg-[#fafafa] px-3 py-[5px] text-left font-mono text-sm leading-none transition-colors duration-150 hover:bg-black hover:text-[#fafafa] ${
          selected ? "text-black" : "text-black/70"
        }`}
      >
        {label}
      </button>
    </li>
  );
}
