import type { Metadata } from "next";
import { LegalPage } from "../components/legal-page";
import { bookingEn, legalUpdatedEn } from "../legal-content";
export const metadata: Metadata = { title: "Booking & Cancellation", description: "How MEMORIES Travel proposals, confirmations, changes, cancellations and refunds work." };
export default function Page(){return <LegalPage eyebrow="Before you book" title="Booking & Cancellation" intro="What happens after an enquiry, when a booking becomes confirmed, and how supplier rules affect changes and refunds." updated={legalUpdatedEn} sections={bookingEn}/>;}
