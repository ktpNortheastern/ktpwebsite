import PlaceholderImage from "@/components/ui/PlaceholderImage";

// PLACEHOLDER: Figma copy for this card was literally "something something larp" — swap for real chapter history copy.
const OMEGA_CHAPTER_COPY =
  "Founded by a small group of students who saw the need for a technology-focused, co-ed professional fraternity at Northeastern, the Omega Chapter has grown from a handful of brothers into one of the largest and most active chapters in the KTP national organization. Every class since has built on that foundation — expanding our reach across majors, industries, and campus life.";

function HistoryCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-tr-3xl bg-navy p-8 md:max-w-[560px]">
      <p className="font-mono text-sm text-white/60">( History )</p>
      <div className="mt-2 border-t border-white/20" />
      <h3 className="mt-6 font-sans text-2xl text-white">{title}</h3>
      <p className="mt-4 font-sans text-sm leading-relaxed text-white/70">{body}</p>
    </div>
  );
}

export default function History() {
  return (
    <section
      data-snap-section
      className="relative isolate flex min-h-screen flex-col justify-center gap-10 overflow-hidden bg-navy px-6 py-16 md:h-screen md:gap-16 md:px-[100px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0.5px,transparent_0.5px)] bg-[length:8px_8px] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
      />
      <div className="flex flex-col items-center gap-8 md:flex-row">
        <HistoryCard
          title="Who We Are"
          body="Our members are passionate about technology and are dedicated to making a positive impact on the world. We are a community of like-minded individuals who share a love for technology and a desire to learn, grow, excel, and succeed together. Our community is made up of individuals from all across campus. The strength of KTP lies in our shared enthusiasm for technology and the way our diverse experiences blend into a unified whole."
        />
        <PlaceholderImage n={2} className="h-[180px] w-full shrink-0 md:w-[280px]" />
      </div>
      <div className="flex flex-col items-center gap-8 md:flex-row">
        <PlaceholderImage n={3} className="h-[180px] w-full shrink-0 md:w-[280px]" />
        <HistoryCard title="The Omega Chapter" body={OMEGA_CHAPTER_COPY} />
      </div>
    </section>
  );
}
