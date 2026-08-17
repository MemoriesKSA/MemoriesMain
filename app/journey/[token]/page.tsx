import { JourneyPageContent } from "../journey-page-content";

export default async function JourneyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <JourneyPageContent token={token} locale="en" />;
}
