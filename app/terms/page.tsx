import type { Metadata } from "next";
import { LegalPage } from "../components/legal-page";
import { legalUpdatedEn, termsEn } from "../legal-content";
export const metadata: Metadata = { title: "Terms of Use", description: "Terms governing the MEMORIES Travel website and journey enquiries." };
export default function Page(){return <LegalPage eyebrow="Using MEMORIES" title="Terms of Use" intro="The rules that apply when you browse the site, share a journey request or use information prepared by MEMORIES." updated={legalUpdatedEn} sections={termsEn}/>;}
