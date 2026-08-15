import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { MotionEnhancer } from "./components/motion-enhancer";
import { LocaleDocument } from "./components/locale-document";
import { SupportChat } from "./components/support-chat";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://memories.tours"),
  title: { default: "MEMORIES Travel, Journeys made personal", template: "%s | MEMORIES Travel" },
  description: "Dream journeys, Saudi Arabia experiences and study-abroad planning for travellers around the world.",
  alternates: { canonical: "/", languages: { en: "/", ar: "/ar" } },
  openGraph: { title: "MEMORIES Travel", description: "Every journey begins with a dream. We turn it into a memory.", images: ["/images/hero-family.webp"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body><Script id="memories-theme" strategy="beforeInteractive">{`try{var t=localStorage.getItem('memories-theme');document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}`}</Script><LocaleDocument /><Header /><MotionEnhancer />{children}<Footer /><SupportChat /></body>
    </html>
  );
}
