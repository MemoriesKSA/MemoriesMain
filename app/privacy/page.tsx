import type { Metadata } from "next";
import { LegalPage } from "../components/legal-page";
import { legalUpdatedEn, privacyEn } from "../legal-content";
export const metadata: Metadata = { title: "Privacy Policy", description: "How MEMORIES Travel collects, uses, shares and protects personal information." };
export default function Page(){return <LegalPage eyebrow="Your privacy" title="Privacy Policy" intro="A clear explanation of the information we collect, why we use it, who helps us process it and the choices available to you." updated={legalUpdatedEn} sections={privacyEn}/>;}
