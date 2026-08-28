import type { Metadata } from "next";
import { FollowPageContent } from "../../../follow/follow-page-content";

export const metadata: Metadata = { title: "متابعة طلبك", robots: { index: false, follow: false } };

export default async function FollowPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <FollowPageContent token={token} locale="ar" />;
}
