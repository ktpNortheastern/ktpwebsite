"use client";

import { useState } from "react";
import { renderRichText } from "@/lib/renderRichText";

type FaqAccordionRowProps = {
  index: number;
  question: string;
  answer: string;
};

export default function FaqAccordionRow({ index, question, answer }: FaqAccordionRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="group relative flex w-full flex-col gap-3 overflow-hidden border-t border-black/10 py-5 pr-4 pl-1 text-left first:border-t-0"
    >
      {/* Same left-to-right hover wipe as the full FAQ page's rows
          (FaqRow.tsx) — scaleX from the left edge, not a plain fade. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-black/[0.04] transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <span className="font-mono text-sm text-black/50">
            {String(index).padStart(2, "0")}.
          </span>
          <span className="font-sans text-black">{question}</span>
        </div>
        <span className="font-mono text-xl text-black/50">{open ? "−" : "+"}</span>
      </div>
      {open && (
        <p className="relative z-10 pl-12 font-sans text-black">
          {renderRichText(answer)}
        </p>
      )}
    </button>
  );
}
