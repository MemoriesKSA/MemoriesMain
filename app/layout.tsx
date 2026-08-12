import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://memories-main-delta.vercel.app"),
  title: { default: "MEMORIES Travel — Journeys made personal", template: "%s | MEMORIES Travel" },
  description: "Tailor-made journeys and trusted support for Saudi travellers, at home and around the world.",
  openGraph: { title: "MEMORIES Travel", description: "Every journey begins with a dream. We turn it into a memory.", images: ["/images/hero-family.webp"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body><Header />{children}<Footer /></body>
    </html>
  );
}
