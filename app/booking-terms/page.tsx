import type { Metadata } from "next";
import { LegalPage } from "../components/legal-page";
import { bookingEn, legalUpdatedEn } from "../legal-content";
export const metadata: Metadata = { title: "Plans, Payment & Refunds", description: "What you are buying when you buy a MEMORIES plan, what payment unlocks, and when a refund applies. We do not book travel." };
export default function Page(){return <LegalPage eyebrow="Before you buy a plan" title="Plans, Payment & Refunds" intro="What you get free before paying, what the fee unlocks, and how refunds work. We sell a written plan and book nothing, so your travel bookings stay between you and each supplier." updated={legalUpdatedEn} sections={bookingEn}/>;}
