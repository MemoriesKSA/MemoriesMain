import { JourneyPageContent } from "../journey-page-content";

export default async function JourneyPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ payment?: string | string[] }>;
}) {
  const { token } = await params;
  const { payment } = await searchParams;
  return <JourneyPageContent token={token} locale="en" paymentNotice={typeof payment === "string" ? payment : null} />;
}
