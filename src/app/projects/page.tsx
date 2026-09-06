import type { Metadata } from "next";
import ProjectsSection from "@/components/projects/ProjectsSection";

export const metadata: Metadata = {
  title: "Projects | KTP Northeastern",
};

// NavBar/Footer are both global via RootLayout — this page only needs its
// own content in between.
export default function ProjectsPage() {
  return <ProjectsSection />;
}
