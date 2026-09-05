import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | KTP Northeastern",
};

// Intentionally empty aside from NavBar/Footer (both global via RootLayout)
// — real 404 content/design comes later.
export default function NotFound() {
  return <section className="min-h-screen bg-white pt-[var(--nav-h)]" />;
}
