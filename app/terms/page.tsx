import type { Metadata } from "next";
import { LegalPage } from "../components/legal-page";
import { legalUpdatedEn, termsEn } from "../legal-content";
export const metadata: Metadata = { title: "Terms of Use", description: "Terms governing the MEMORIES Travel website and the travel plans we write. We are not a travel agent and we book nothing." };
export default function Page(){return <LegalPage eyebrow="Using MEMORIES" title="Terms of Use" intro="The rules that apply when you browse the site, request a plan, or act on one. The most important of them: we sell a written plan and we do not book anything for you." updated={legalUpdatedEn} sections={termsEn}/>;}
