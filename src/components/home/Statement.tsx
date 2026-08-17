import ScrambleText from "@/components/motion/ScrambleText";

export default function Statement() {
  return (
    <section
      data-snap-section
      className="flex min-h-screen items-center justify-center bg-navy bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:16px_16px] px-6 md:h-screen md:px-[100px]"
    >
      <ScrambleText
        as="h2"
        text="We are the first professional, co-ed technology fraternity in the country"
        className="max-w-4xl text-center font-mono text-3xl font-bold leading-tight text-white md:text-5xl"
      />
    </section>
  );
}
