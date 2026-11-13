import type { Metadata } from "next";
import { pageAlternates } from "../../page-alternates";
import { LegalPage } from "../../components/legal-page";
import { legalUpdatedAr, privacyAr } from "../../legal-content";
export const metadata: Metadata = { alternates: pageAlternates("/privacy", "ar"), title: "سياسة الخصوصية", description: "كيفية جمع ميموريز للبيانات الشخصية واستخدامها وحمايتها." };
export default function Page(){return <LegalPage ar eyebrow="خصوصيتك" title="سياسة الخصوصية" intro="شرح واضح للبيانات التي نجمعها وسبب استخدامها ومن يساعدنا في معالجتها والخيارات المتاحة لك." updated={legalUpdatedAr} sections={privacyAr}/>;}
