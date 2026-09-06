"use client";

import { useState } from "react";
import { renderRichText } from "@/lib/renderRichText";

type FaqRowProps = {
  index: number;
  question: string;
  answer: string;
};

export default function FaqRow({ index, question, answer }: FaqRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      className="group relative flex w-full flex-col gap-10 overflow-hidden border-t border-[#c5c5c5] px-6 py-8 text-left md:px-[130px]"
    >
      {/* Wipes in from the left on hover, scaleX rather than a plain
          background-color transition so the fill visibly travels across
          the block instead of just fading up in place. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-black/[0.04] transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
      <div className="relative z-10 flex w-full items-center justify-between gap-6">
        <div className="flex items-center gap-6 md:gap-20">
          <span className="shrink-0 font-mono font-bold text-[#909090]">
            {String(index).padStart(2, "0")}.
          </span>
          <span className="font-sans font-medium text-black">{question}</span>
        </div>
        <span
          className={`shrink-0 font-sans text-xl text-[#909090] transition-transform duration-200 ${
            open ? "-rotate-45" : ""
          }`}
        >
          +
        </span>
      </div>
      {open && (
        <p className="relative z-10 font-sans text-base text-black">{renderRichText(answer)}</p>
      )}
    </button>
  );
}
