import type { Metadata } from "next";
import { FollowPageContent } from "../follow-page-content";

// Never indexed: a status page for one customer's request has no business in
// search results, and the token in the URL should not end up in a crawler's log.
export const metadata: Metadata = { title: "Following your request", robots: { index: false, follow: false } };

export default async function FollowPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <FollowPageContent token={token} locale="en" />;
}
