import Hero from "@/components/home/Hero";
import PresidentialWelcome from "@/components/home/PresidentialWelcome";
import Statement from "@/components/home/Statement";
import History from "@/components/home/History";
import Pillars from "@/components/home/Pillars";
import WhyRush from "@/components/home/WhyRush";
import Network from "@/components/home/Network";
import FaqPreview from "@/components/home/FaqPreview";

export default function Home() {
  return (
    <>
      <Hero />
      <PresidentialWelcome />
      <Statement />
      <History />
      <Pillars />
      <WhyRush />
      <Network />
      <FaqPreview />
    </>
  );
}
