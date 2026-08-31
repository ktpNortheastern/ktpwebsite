import ScrambleText from "@/components/motion/ScrambleText";

export default function Statement() {
  return (
    <section
      data-snap-section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy px-6 md:h-screen md:px-[100px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:16px_16px] [mask-image:linear-gradient(to_bottom,transparent,black_10%)]"
      />
      <ScrambleText
        as="h2"
        text="We are the first professional, co-ed technology fraternity in the country"
        className="max-w-5xl text-center font-mono text-5xl font-bold leading-tight text-white md:text-7xl"
      />
    </section>
  );
}
