import type { Metadata } from "next";
import { pageAlternates } from "../../page-alternates";
import { LegalPage } from "../../components/legal-page";
import { legalUpdatedAr, termsAr } from "../../legal-content";
export const metadata: Metadata = { alternates: pageAlternates("/terms", "ar"), title: "شروط الاستخدام", description: "الشروط التي تحكم استخدام موقع ميموريز وطلبات الرحلات." };
export default function Page(){return <LegalPage ar eyebrow="استخدام ميموريز" title="شروط الاستخدام" intro="القواعد التي تنطبق عند تصفح الموقع أو مشاركة طلب رحلة أو استخدام المعلومات التي تعدها ميموريز." updated={legalUpdatedAr} sections={termsAr}/>;}
