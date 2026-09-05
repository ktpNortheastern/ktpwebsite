import type { Metadata } from "next";
import ScrambleText from "@/components/motion/ScrambleText";
import DotMatrixText from "@/components/ui/DotMatrixText";

export const metadata: Metadata = {
  title: "Page Not Found | KTP Northeastern",
};

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden bg-black px-6 pt-[var(--nav-h)]">
      <DotMatrixText text="404" className="text-white" />
      <ScrambleText
        as="p"
        text="Coming soon. This page doesn't seem to exist. If you believe this is an error please contact us."
        className="max-w-xl text-center font-sans text-base text-white/70 md:text-lg"
      />
    </section>
  );
}
