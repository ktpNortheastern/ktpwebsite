import type { Metadata } from "next";
import ContactSection from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact | KTP Northeastern",
};

// NavBar/Footer are both global via RootLayout — this page only needs its
// own single-screen content in between.
export default function ContactPage() {
  return <ContactSection />;
}
