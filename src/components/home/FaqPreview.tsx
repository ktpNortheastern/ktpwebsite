import Button from "@/components/ui/Button";
import FaqAccordionRow from "@/components/ui/FaqAccordionRow";

const PREVIEW_FAQS = [
  {
    question: "Do I need to be a computer science major to rush?",
    answer:
      "Not at all — KTP is interdisciplinary. We have brothers studying everything from CS and engineering to business, design, and the humanities.",
  },
  {
    question: "What is the time commitment like?",
    answer:
      "Expect a few hours a week for chapter meetings, events, and committee work, with more during the pledge process.",
  },
  {
    question: "Is there a GPA requirement?",
    answer: "We look at your whole application, not just your GPA — academic effort matters more than a specific number.",
  },
  {
    question: "How do I apply?",
    answer: "Applications open each semester ahead of rush — check the Rush page for this cycle's dates and the application link.",
  },
];

export default function FaqPreview() {
  return (
    <section
      data-snap-section
      className="flex min-h-screen flex-col justify-center bg-white px-6 py-16 md:h-screen md:px-[130px]"
    >
      <p className="font-mono text-sm text-black/50">( FAQ )</p>
      <div className="mt-2 border-t border-black" />
      <h2 className="mt-6 font-sans text-3xl text-black">Common Questions</h2>

      <div className="mt-10">
        {PREVIEW_FAQS.map((faq, i) => (
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
