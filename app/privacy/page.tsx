import type { Metadata } from "next";
import { LegalPage } from "../components/legal-page";
import { legalUpdatedEn, privacyEn } from "../legal-content";
export const metadata: Metadata = { title: "Privacy Policy", description: "How MEMORIES Travel collects, uses, shares and protects personal information." };
export default function Page(){return <LegalPage eyebrow="Your privacy" title="Privacy Policy" intro="What we collect, why we use it, which providers help us process it including the AI that drafts your plan, and the choices available to you." updated={legalUpdatedEn} sections={privacyEn}/>;}
