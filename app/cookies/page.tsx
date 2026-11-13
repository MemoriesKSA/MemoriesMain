import type { Metadata } from "next";
import { pageAlternates } from "../page-alternates";
import { LegalPage } from "../components/legal-page";
import { cookiesEn, legalUpdatedEn } from "../legal-content";
import { ConsentSettings } from "../components/analytics-consent";
export const metadata: Metadata = { alternates: pageAlternates("/cookies", "en"), title: "Cookie Notice", description: "How MEMORIES Travel uses cookies, local storage and similar technology." };
export default function Page(){return <><LegalPage eyebrow="Website technology" title="Cookie Notice" intro="A short, honest description of the storage and tracking technology currently used on memories.tours." updated={legalUpdatedEn} sections={cookiesEn}/><div className="container"><ConsentSettings /></div></>;}
