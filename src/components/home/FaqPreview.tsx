import { getCollection } from "@/lib/content";
import Button from "@/components/ui/Button";
import FaqAccordionRow from "@/components/ui/FaqAccordionRow";
import ScrambleText from "@/components/motion/ScrambleText";

type FaqEntry = {
  question: string;
  answer: string;
  order?: number;
};

// Only a taste of the full list — same content/faq/*.md collection the
// /faq page reads (sorted by `order` in getCollection), so this can never
// drift out of sync with the real answers the way a separately hand-typed
// preview array did.
const PREVIEW_COUNT = 4;

export default function FaqPreview() {
  const faqs = getCollection<FaqEntry>("faq").slice(0, PREVIEW_COUNT);

  return (
    <section
      data-snap-section
      className="flex min-h-screen flex-col justify-center bg-white px-6 py-16 md:h-screen md:px-[130px]"
    >
      <p className="font-mono text-sm text-black/50">( FAQ )</p>
      <div className="mt-2 border-t border-black/20" />
      <ScrambleText
        as="h2"
        text="Common Questions"
        className="mt-6 font-sans text-3xl text-black"
      />

      <div className="mt-10">
        {faqs.map((faq, i) => (
          <FaqAccordionRow key={faq.question} index={i + 1} question={faq.question} answer={faq.answer} />
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button href="/faq" variant="dark">
          Full FAQ
        </Button>
      </div>
    </section>
  );
}
