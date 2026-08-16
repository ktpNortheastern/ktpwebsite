"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  {
    title: "Academic Support",
    body:
      "Kappa Theta Pi brothers strive to foster academic growth and excellence for each other. We provide a supportive network filled with some of the brightest tech minds at the university that members can always rely on for help in classes and extracurricular activities.",
  },
  {
    title: "Alumni Connections",
    body:
      "Our alumni are spread out across the world and work on cutting-edge technologies. They work at a plethora of companies — from tech companies like Microsoft, Amazon, Facebook, Apple, and Google, to startups, consulting firms, financial technology firms, and more!",
  },
  {
    title: "Professional Development",
    body:
      "Through events like interview training, resume building, one-on-one mentorship, private company recruiting, and more, KTP aims to prepare members for success in any technology-related career. We take pride in developing the tech leaders of the future.",
  },
  {
    title: "Technical Advancement",
    body:
      "We provide members numerous opportunities to enhance their current technical skills, as well as learn new ones. Whether it be participation in one of our various project teams or attending a technical workshop, we make it easy for our members to expand their expertise.",
  },
  {
    title: "Social Growth",
    body:
      "The people you meet in Kappa Theta Pi will go on to be some of your closest friends throughout college and beyond. We host a variety of exclusive social events throughout the semester through which our members can bond, some of which include formal, retreat, and apple picking.",
  },
];

export default function Pillars() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const scrollDistance = track.scrollWidth - section.clientWidth;
    if (scrollDistance <= 0) return;

    const tween = gsap.to(track, {
      x: -scrollDistance,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${scrollDistance}`,
        scrub: true,
        pin: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-snap-section
      className="flex h-screen flex-col justify-center overflow-hidden bg-navy px-[100px] py-16"
    >
      <h2 className="font-mono text-4xl text-white">Pillars</h2>
      <div ref={trackRef} className="mt-16 flex gap-16">
        {PILLARS.map((pillar, i) => (
          <div
            key={pillar.title}
            className="w-[386px] shrink-0 border-y border-white/20 py-8"
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
