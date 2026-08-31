"use client";

import { useState } from "react";

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
      className="flex w-full flex-col gap-10 border-t border-[#909090] px-6 py-10 text-left md:px-[130px]"
    >
      <div className="flex w-full items-center justify-between gap-6">
        <div className="flex items-center gap-6 md:gap-20">
          <span className="shrink-0 font-mono font-bold text-black">
            {String(index).padStart(2, "0")}.
          </span>
          <span className="font-sans font-medium text-[#909090]">{question}</span>
        </div>
        <span
          className={`shrink-0 font-sans text-xl text-black transition-transform duration-200 ${
            open ? "-rotate-45" : ""
          }`}
        >
          +
        </span>
      </div>
      {open && <p className="font-sans text-base text-black">{answer}</p>}
    </button>
  );
}
