import { getCollection } from "@/lib/content";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

type NetworkEntry = {
  name: string;
  logo?: string;
};

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
        {companies.map((company, i) => (
          <div
            key={company.slug}
            className="flex h-[120px] items-center justify-center border border-black/20 p-4"
          >
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={company.name} className="max-h-16 max-w-full" />
            ) : (
              <div className="flex w-full items-center gap-3">
                <PlaceholderImage n={i + 1} className="h-10 w-10 shrink-0" />
                <span className="font-mono text-sm text-black/70">{company.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
