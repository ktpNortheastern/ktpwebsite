import type { Metadata } from "next";
import { getCollection } from "@/lib/content";
import FaqRow from "@/components/faq/FaqRow";

export const metadata: Metadata = {
  title: "FAQ | KTP Northeastern",
};

type FaqEntry = {
  question: string;
  answer: string;
  order?: number;
};

export default function FaqPage() {
  const faqs = getCollection<FaqEntry>("faq");

  return (
    <section className="flex min-h-screen flex-col items-start gap-10 bg-[#fafafa] pt-24 pb-16 md:pt-[150px]">
      <div className="flex w-full items-center px-6 md:px-[130px]">
        <p className="font-sans text-2xl font-bold text-black md:text-[30px]">
          (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FAQ&nbsp;&nbsp;&nbsp;&nbsp;)
        </p>
      </div>
      <div className="flex w-full flex-col items-start">
        {faqs.map((faq, i) => (
          <FaqRow key={faq.slug} index={i + 1} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
}
