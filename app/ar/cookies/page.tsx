import type { Metadata } from "next";
import { LegalPage } from "../../components/legal-page";
import { cookiesAr, legalUpdatedAr } from "../../legal-content";
export const metadata: Metadata = { title: "إشعار ملفات الارتباط", description: "كيفية استخدام ميموريز لملفات الارتباط والتخزين المحلي والتقنيات المشابهة." };
export default function Page(){return <LegalPage ar eyebrow="تقنية الموقع" title="إشعار ملفات الارتباط" intro="وصف مختصر وصريح للتخزين وتقنيات التتبع المستخدمة حاليًا على memories.tours." updated={legalUpdatedAr} sections={cookiesAr}/>;}
