// 5-wide x 7-tall dot-matrix glyphs ("1" = on, "0" = off) — shared so the
// grid-cell rendering approach (see the 404 page) and its gap/sizing
// conventions live in one place instead of being copied per caller. Add
// characters here as new callers need them, rather than pre-building a full
// alphabet nobody's using yet.
const GLYPHS: Record<string, string[]> = {
  "0": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "4": ["10001", "10001", "10001", "11111", "00001", "00001", "00001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
};

const BLANK_GLYPH = Array<string>(7).fill("00000");

// "md" is the 404 page's original size — "sm" is a scaled-down variant
// (smaller cells AND proportionally smaller gaps at every step) for callers
// that want the same treatment without it dominating the page.
const SIZES = {
  md: {
    outerGap: "gap-3 sm:gap-4 md:gap-6",
    cellGap: "gap-x-1 gap-y-0.5 sm:gap-x-1.5 sm:gap-y-1 md:gap-x-2 md:gap-y-1 lg:gap-x-2.5 lg:gap-y-1",
    cell: "h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 lg:h-5 lg:w-5",
    space: "w-2 sm:w-3 md:w-4 lg:w-5",
  },
  sm: {
    outerGap: "gap-1.5 sm:gap-2 md:gap-3",
    cellGap: "gap-x-0.5 gap-y-px sm:gap-x-1 sm:gap-y-0.5 md:gap-x-1 md:gap-y-0.5",
    cell: "h-1 w-1 sm:h-1.5 sm:w-1.5 md:h-2 md:w-2",
    space: "w-1 sm:w-1.5 md:w-2",
  },
} as const;

type DotMatrixSize = keyof typeof SIZES;

type DotMatrixTextProps = {
  text: string;
  // Sets the "on" cell color via currentColor — pass a text-* class (e.g.
  // "text-white") on whatever wraps this, or directly here.
  className?: string;
  size?: DotMatrixSize;
};

export default function DotMatrixText({ text, className = "", size = "md" }: DotMatrixTextProps) {
  const { outerGap, cellGap, cell, space } = SIZES[size];

  return (
    <div role="img" aria-label={text} className={`flex ${outerGap} ${className}`}>
      {text.split("").map((char, i) =>
        char === " " ? (
          <div key={i} aria-hidden className={space} />
        ) : (
          <DotMatrixGlyph
            key={i}
            pattern={GLYPHS[char.toUpperCase()] ?? BLANK_GLYPH}
            cellGap={cellGap}
            cell={cell}
          />
        ),
      )}
    </div>
  );
}

function DotMatrixGlyph({
  pattern,
  cellGap,
  cell,
}: {
  pattern: string[];
  cellGap: string;
  cell: string;
}) {
  return (
    // gap-y stays noticeably smaller than gap-x at every breakpoint — see
    // the 404 page's own note on why (line-height-driven vertical spacing
    // read as too loose relative to the horizontal gap between glyphs).
    <div aria-hidden className={`grid grid-cols-5 ${cellGap}`}>
      {pattern.flatMap((row, r) =>
        row.split("").map((c, colIndex) => (
          <span
            key={`${r}-${colIndex}`}
            className={`${cell} ${c === "1" ? "bg-current" : ""}`}
          />
        )),
      )}
    </div>
  );
}
