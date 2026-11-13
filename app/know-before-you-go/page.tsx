import type { Metadata } from "next";
import { pageAlternates } from "../page-alternates";
import { KnowBeforeYouGoPage } from "../components/know-before-you-go-page";

export const metadata: Metadata = { alternates: pageAlternates("/know-before-you-go", "en"), title: "Know Before You Go", description: "Practical, factual answers for visiting Saudi Arabia: safety, emergency numbers, dress code, currency, connectivity and more." };

export default function Page() {
  return <KnowBeforeYouGoPage locale="en" />;
}
