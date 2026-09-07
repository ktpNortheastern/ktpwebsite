import PlaceholderImage from "@/components/ui/PlaceholderImage";
import ScrambleText from "@/components/motion/ScrambleText";

const PILLARS = [
  {
    title: "Academic Support",
    body:
      "Kappa Theta Pi brothers strive to foster academic growth and excellence for each other. We provide a supportive network filled with some of the brightest tech minds at the university that members can always rely on for help in classes and extracurricular activities.",
  },
  {
    title: "Professional / Technical Development",
    body:
      "Through events like interview training, resume building, one-on-one mentorship, private company recruiting, project teams, and technical workshops, KTP prepares members for success in any technology-related career while giving them hands-on ways to build new skills.",
  },
  {
    title: "Social Growth",
    body:
      "The people you meet in Kappa Theta Pi will go on to be some of your closest friends throughout college and beyond. We host a variety of exclusive social events throughout the semester through which our members can bond, some of which include formal, retreat, and apple picking.",
  },
];

export default function Pillars() {
  return (
    <section
      data-snap-section
      className="flex min-h-screen flex-col justify-center overflow-hidden bg-navy px-6 py-16 md:px-[100px]"
    >
      {/* font-bold matches WhyRush's "Why Rush?" heading weight. */}
      <ScrambleText as="h2" text="Our Pillars" className="font-mono text-4xl font-bold text-white" />
      {/* Flush left (no justify-center) so the row's left edge lines up
          with the title above it — both share the same section padding
          (px-6/md:px-[100px]) as their left margin, instead of the row
          being centered as its own block within that padding. */}
      <div className="mt-8 flex w-full flex-col items-stretch gap-8 md:flex-row md:justify-between">
        {PILLARS.map((pillar, i) => (
          <div
            key={pillar.title}
            className="border-y border-white/20 py-8 md:w-[320px]"
          >
            <PlaceholderImage n={i + 4} className="h-[210px] w-full" />
            <p className="mt-6 font-mono text-sm text-white/60">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 font-sans font-medium text-white">{pillar.title}</h3>
            <p className="mt-3 font-mono text-sm leading-relaxed text-white/60">
              {pillar.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
