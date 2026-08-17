"use client";

import { useState } from "react";

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
      className="flex w-full flex-col gap-3 border-t border-black/10 py-6 text-left first:border-t-0"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <span className="font-mono text-sm text-black/50">
            {String(index).padStart(2, "0")}.
          </span>
          <span className="font-sans text-black/70">{question}</span>
        </div>
        <span className="font-mono text-xl">{open ? "−" : "+"}</span>
      </div>
      {open && <p className="pl-12 font-sans text-sm text-black/60">{answer}</p>}
    </button>
  );
}
