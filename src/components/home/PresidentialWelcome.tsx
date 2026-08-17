import PlaceholderImage from "@/components/ui/PlaceholderImage";

const LETTER = `We are Eleanor (Ellie) Meltzer and Andrew Rettig, and we are thrilled to welcome you to the Omega chapter of Kappa Theta Pi at Northeastern University. Joining Kappa Theta Pi is the first step towards an invaluable journey of growth and professional development. Since joining in our second year, this chapter has shaped our professional growth and granted us lifelong connections and a sense of community. We are honored to serve as our chapter's president this year and hope to give back even a fraction of what Kappa Theta Pi has contributed to me.

Kappa Theta Pi is the largest professional co-ed technology fraternity in the world, with over 290,000 members. We take pride in our chapter's interdisciplinary nature, always striving to uphold our reputation of the premier developer of principled business leaders. Our chapter brings together members of all majors and backgrounds, united by a common goal: excellence and positive impact throughout our lifelong journey.

The members of the Omega Chapter work to uphold our values of brotherhood, knowledge, unity, integrity, and service in all we do. We are self-starters, always ambitious, motivated, and determined to succeed, but we are also a tight-knit community. We encourage you to experience our community firsthand by attending recruitment events and exploring the rest of our website. Thank you for your interest — we look forward to meeting you soon!

Best,
Eleanor Meltzer & Andrew Rettig
Omega Chapter Presidents`;

export default function PresidentialWelcome() {
  return (
    <section
      data-snap-section
      className="flex h-screen items-center gap-16 bg-navy px-[100px] pt-[68px]"
    >
      <PlaceholderImage n={1} className="h-[500px] w-[380px] shrink-0" />
      <div className="max-w-[622px]">
        <h2 className="font-mono text-2xl font-bold text-white">Presidential Welcome</h2>
        <div className="mt-8 flex flex-col gap-4 whitespace-pre-line font-sans text-[15px] leading-relaxed text-white/80">
          {LETTER}
        </div>
      </div>
    </section>
  );
}
