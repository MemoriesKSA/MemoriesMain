import type { Metadata } from "next";
import { LegalPage } from "../../components/legal-page";
import { bookingAr, legalUpdatedAr } from "../../legal-content";
export const metadata: Metadata = { title: "الحجز والإلغاء", description: "آلية عروض ميموريز والتأكيد والتغيير والإلغاء والاسترداد." };
export default function Page(){return <LegalPage ar eyebrow="قبل الحجز" title="الحجز والإلغاء" intro="ما يحدث بعد الاستفسار، ومتى يتأكد الحجز، وكيف تؤثر شروط المزودين في التغيير والاسترداد." updated={legalUpdatedAr} sections={bookingAr}/>;}
