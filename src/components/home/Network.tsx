import fs from "fs";
import path from "path";
import { getCollection } from "@/lib/content";

type NetworkEntry = {
  name: string;
  logo?: string;
  order?: number;
  // Multiplier on the base bounding box (BASE_MAX_HEIGHT / BASE_MAX_WIDTH_PCT
  // below). Source files vary wildly in how much of their own canvas the
  // visible mark actually fills — some (Sony Music, JPMorgan) are a small
  // wordmark centered in a mostly-empty square — so this is a per-entry,
  // content-editable knob rather than a hardcoded list in code, since
  // which logos need it (and by how much) will keep changing as more are
  // sourced.
  scale?: number;
};

// Entries are seeded with their eventual /images/logos/<slug>.svg path
// before the file exists (see content/network/), so a truthy `logo`
// field alone doesn't mean there's anything to render yet — check the
// actual file on disk.
function logoFileExists(logoPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", logoPath));
}

// A few sourced files arrived with a baked-in background instead of
// transparency — CSS-only fix rather than re-exporting the assets.
// jefferies.png is solid black with white text: invert flips it to a
// white background the multiply below can then drop out. cbai.png's
// background is a light off-white (not true white), which multiply
// alone drops out against the section's white background.
const COLOR_KEY_CLASSES: Record<string, string> = {
  jefferies: "invert mix-blend-multiply",
  cbai: "mix-blend-multiply",
};

const BASE_MAX_HEIGHT = 64; // px
const BASE_MAX_WIDTH_PCT = 80; // % of the cell

export default function Network() {
  const companies = getCollection<NetworkEntry>("network");

  return (
    <section
      data-snap-section
      data-snap-through
      className="flex flex-col bg-white px-6 pt-20 pb-12 md:px-[130px] md:pt-32 md:pb-16"
    >
      <p className="font-mono text-sm text-black/50">( Network )</p>
      <div className="mt-2 border-t border-black/20" />
      <h2 className="mt-6 font-sans text-3xl text-black">
        Companies we&apos;ve brought value to
      </h2>

      <div className="mt-10 grid grid-cols-2 border border-black/20 md:grid-cols-4">
        {companies.map((company) => {
          const hasLogo = !!company.logo && logoFileExists(company.logo);
          const scale = company.scale ?? 1;
          return (
            <div
              key={company.slug}
              className="flex h-[120px] items-center justify-center overflow-hidden border border-black/20 p-4"
            >
              {hasLogo ? (
                // Explicit height + width (not max-height/max-width) is
                // deliberate: max-* only ever caps size, it never scales a
                // small image UP to fill the box, so a tightly-cropped
                // logo (see the SVG viewBox crops and sharp .trim() calls
                // this content went through) would render at its own tiny
                // intrinsic size instead of matching its neighbors.
                // object-contain on a box with real dimensions is what
                // actually makes every logo target the same HEIGHT while
                // letting width vary with aspect ratio — a wide wordmark
                // (Google) and a near-square mark (IBM) both read at a
                // comparable size instead of one dwarfing the other.
                // overflow-hidden on the cell (above) is a backstop
                // against a scale value large enough to blow out the
                // fixed cell height.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo}
                  alt={company.name}
                  style={{
                    height: BASE_MAX_HEIGHT * scale,
                    width: `${Math.min(BASE_MAX_WIDTH_PCT * scale, 100)}%`,
                  }}
                  className={`object-contain ${COLOR_KEY_CLASSES[company.slug] ?? ""}`}
                />
              ) : (
                // Shows the actual company name, not just a numbered
                // swatch — with 42 entries, a bare index is useless for
                // spotting which ones still need a real logo dropped in.
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <div className="h-6 w-6 bg-[#c4c4c4]" />
                  <span className="font-mono text-[10px] uppercase text-black/40">
                    {company.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
