import PlaceholderImage from "@/components/ui/PlaceholderImage";

const LETTER = `Hi everyone! We are Andrew Rettig and Eleanor (Ellie) Meltzer, and we are thrilled to welcome you to the Omega chapter of Kappa Theta Pi at Northeastern University.

Kappa Theta Pi is the largest professional co-ed technology fraternity in the world, with over 800 members nationally. Our chapter brings together members of all majors and backgrounds, united by a common goal of excellence and positive impact throughout our lifelong journey.

For both of us, joining KTP has shaped our time at Northeastern more than we ever expected. We both joined freshman year, not really knowing what to expect, and it ended up giving us so much more than we imagined professionally, socially, and academically.

Professionally, we've had mentors push us to apply for co-ops and internships we weren't sure we were ready for, help us prep for interviews, and give us honest feedback on our resumes when we needed to hear it. That kind of support doesn't happen by accident, it's built into the culture here, and it's something we want to keep alive for all of you.

Socially, some of our closest friends at Northeastern came from this chapter. The late night study sessions, the group dinners, the random weekday hangouts, those are the moments that make this place feel like home away from home. Academically, we've leaned on brothers to get through tough classes, share notes, and just remind each other that we're not doing this alone.

We are incredibly honored to serve as your Presidents, and we take seriously the responsibility of carrying forward what so many members before us built. This chapter has a legacy of mentorship, ambition, and genuine care for one another, and our goal this year is to make sure every one of you feels that same sense of belonging and support that we did when we first walked in.

We're so excited for what this year has in store, and we can't wait to get to know each of you. We encourage you to experience our community firsthand by attending recruitment events and exploring the rest of our website.

Welcome to KTP.

Eleanore (Ellie) Meltzer
Andrew Rettig
Omega Chapter Presidents`;

export default function PresidentialWelcome() {
  return (
    <section
      data-snap-section
      className="flex min-h-screen flex-col items-center justify-center gap-10 bg-navy px-6 py-16 pt-[100px] md:flex-row md:items-stretch md:gap-16 md:px-[100px] md:py-24 md:pt-[100px]"
    >
      {/* items-stretch on the row (set below) makes this match the text
          block's actual rendered height instead of a hardcoded value that
          would drift out of sync with the (now much longer) real letter. */}
      <PlaceholderImage n={1} className="h-[260px] w-full shrink-0 md:h-auto md:w-[380px]" />
      <div className="md:max-w-[622px]">
        <h2 className="font-mono text-2xl font-bold text-white">Presidential Welcome</h2>
        <div className="mt-8 flex flex-col gap-4 whitespace-pre-line font-sans text-[15px] leading-relaxed text-white/80">
          {LETTER}
        </div>
      </div>
    </section>
  );
}
