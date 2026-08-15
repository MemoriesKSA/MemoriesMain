import type { Metadata } from "next";
import { LegalPage } from "../components/legal-page";
import { cookiesEn, legalUpdatedEn } from "../legal-content";
export const metadata: Metadata = { title: "Cookie Notice", description: "How MEMORIES Travel uses cookies, local storage and similar technology." };
export default function Page(){return <LegalPage eyebrow="Website technology" title="Cookie Notice" intro="A short, honest description of the storage and tracking technology currently used on memories.tours." updated={legalUpdatedEn} sections={cookiesEn}/>;}
