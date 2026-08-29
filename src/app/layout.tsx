import type { Metadata } from "next";
import { Anonymous_Pro, EB_Garamond } from "next/font/google";
import localFont from "next/font/local";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { CustomCursorProvider } from "@/components/motion/CustomCursor";
import SnapScrollContainer from "@/components/motion/SnapScrollContainer";
import PageTransition from "@/components/motion/PageTransition";
import "./globals.css";

const satoshi = localFont({
  variable: "--font-satoshi",
  src: [
    { path: "./fonts/satoshi/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/satoshi/Satoshi-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/satoshi/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/satoshi/Satoshi-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/satoshi/Satoshi-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/satoshi/Satoshi-BoldItalic.woff2", weight: "700", style: "italic" },
    { path: "./fonts/satoshi/Satoshi-Black.woff2", weight: "900", style: "normal" },
    { path: "./fonts/satoshi/Satoshi-BlackItalic.woff2", weight: "900", style: "italic" },
  ],
});

const anonymousPro = Anonymous_Pro({
  variable: "--font-anonymous-pro",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "KTP Northeastern",
  description: "Kappa Theta Pi - Northeastern University Chapter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${anonymousPro.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col cursor-none">
        <CustomCursorProvider>
          <PageTransition />
          <NavBar />
          <SnapScrollContainer>
            {children}
            <Footer />
          </SnapScrollContainer>
        </CustomCursorProvider>
      </body>
    </html>
  );
}
