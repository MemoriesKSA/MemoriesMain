import type { Metadata } from "next";
import { pageAlternates } from "../../page-alternates";
import { KnowBeforeYouGoPage } from "../../components/know-before-you-go-page";

export const metadata: Metadata = { alternates: pageAlternates("/know-before-you-go", "ar"), title: "قبل ما تجهز نفسك للسفر لا زم تعرف", description: "إجابات عملية وحقيقية لزيارة السعودية: الأمان، أرقام الطوارئ، الزي المناسب، العملة، الاتصال، والمزيد." };

export default function Page() {
  return <KnowBeforeYouGoPage locale="ar" />;
}
