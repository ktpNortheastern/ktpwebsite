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
      className="group relative flex w-full flex-col gap-10 overflow-hidden px-6 py-8 text-left md:px-[130px]"
    >
      {/* A plain `border-t` on this button spans its full border box —
          from the raw edge before px-6/md:px-[130px] padding kicks in, to
          the same raw edge on the right — so it ran screen-edge to
          screen-edge instead of matching the visible row content (from
          the "01." index to the "+" icon). Inset via absolute positioning
          with the same px values as the button's own padding instead, so
          it starts/ends exactly where that content does. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 right-6 left-6 border-t border-[#c5c5c5] md:right-[130px] md:left-[130px]"
      />
      {/* Same left/right inset as the divider line above (and the same
          reasoning: match the visible "01." → "+" content span, not the
          button's own full-width border box) — a soft frosted panel
          behind each row, same idea as the rush event cards, just a
          lighter touch of blur (backdrop-blur-sm, not -md). inset-y-0
          (not top-0 alone) so it still covers the row's full height
          once it's open and taller with the answer text showing.
          mask-image feathers the fill+blur toward its own edges (an
          ellipse, not a hard rectangle) so it blends into the grid
          instead of cutting off sharply — solid enough through the
          middle (60%) that the question/answer text stays fully
          readable. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-6 left-6 bg-white/60 backdrop-blur-sm [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] md:right-[130px] md:left-[130px]"
      />
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
