import type { Metadata } from "next";
import { LegalPage } from "../../components/legal-page";
import { bookingAr, legalUpdatedAr } from "../../legal-content";
export const metadata: Metadata = { title: "الخطط والدفع والاسترداد", description: "ما الذي تشتريه عند شراء خطة من ميموريز، وما الذي يفتحه الدفع، ومتى يُستحق الاسترداد. نحن لا نحجز السفر." };
export default function Page(){return <LegalPage ar eyebrow="قبل شراء الخطة" title="الخطط والدفع والاسترداد" intro="ما تحصل عليه مجانًا قبل الدفع، وما يفتحه الدفع، وكيف يعمل الاسترداد. نحن نبيع خطة مكتوبة ولا نحجز شيئًا، فتبقى حجوزاتك بينك وبين كل مزود." updated={legalUpdatedAr} sections={bookingAr}/>;}
