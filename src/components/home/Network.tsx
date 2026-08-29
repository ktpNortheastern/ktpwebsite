import fs from "fs";
import path from "path";
import { getCollection } from "@/lib/content";

type NetworkEntry = {
  name: string;
  logo?: string;
  order?: number;
};

// Entries are seeded with their eventual /images/logos/<slug>.svg path
// before the file exists (see content/network/), so a truthy `logo`
// field alone doesn't mean there's anything to render yet — check the
// actual file on disk.
function logoFileExists(logoPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", logoPath));
}

export default function Network() {
  const companies = getCollection<NetworkEntry>("network");

  return (
    <section
      data-snap-section
      className="flex flex-col bg-white px-6 py-20 md:px-[130px] md:py-32"
    >
      <p className="font-mono text-sm text-black/50">( Network )</p>
      <div className="mt-2 border-t border-black/20" />
      <h2 className="mt-6 font-sans text-3xl text-black">
        Companies we&apos;ve brought value to
      </h2>

      <div className="mt-10 grid grid-cols-2 border border-black/20 md:grid-cols-4">
        {companies.map((company) => {
          const hasLogo = !!company.logo && logoFileExists(company.logo);
          return (
            <div
              key={company.slug}
              className="flex h-[120px] items-center justify-center border border-black/20 p-4"
            >
              {hasLogo ? (
                // Bounded on both axes (not just object-contain on a fixed
                // box) so a wide wordmark (e.g. Google) and a near-square
                // mark (e.g. IBM) both read at a comparable visual size —
                // capping only height would let a wide logo run edge to
                // edge, capping only width would let a tall one dwarf its
                // neighbors.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-auto max-h-10 w-auto max-w-[70%] object-contain"
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
