import type { Metadata } from "next";
import { KnowBeforeYouGoPage } from "../../components/know-before-you-go-page";

export const metadata: Metadata = { title: "قبل أن تسافر", description: "إجابات عملية وحقيقية لزيارة السعودية: الأمان، أرقام الطوارئ، الزي المناسب، العملة، الاتصال، والمزيد." };

export default function Page() {
  return <KnowBeforeYouGoPage locale="ar" />;
}
