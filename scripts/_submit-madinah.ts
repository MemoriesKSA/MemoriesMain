import { randomUUID } from "node:crypto";
const SITE = "https://memories.tours";
const submissionId = randomUUID();
const body = {
  submissionId, journeyType: "journey", country: "saudi-arabia", city: "madinah",
  stops: "madinah", stopPurposes: "family", stopNights: "4", stopNightsChosen: "yes",
  purpose: "family", travellers: "family", travellerCount: "4",
  fromDate: "2027-03-14", toDate: "2027-03-18",
  transport: ["private-driver"], stays: ["hotel"], stayRating: "",
  departureCity: "Dammam", flightTiming: "daytime",
  planIncludes: ["accommodation", "transport", "dining", "activities"],
  packageNotes: "Travelling with our two children, 9 and 13. We want to be walking distance from the Haram, and we would like the children to see something of the history rather than only the hotel.",
  currency: "SAR", budget: "", budgetMode: "open",
  delivery: ["email"], name: "Random City Test (Madinah)",
  email: "memoriesksasupport@gmail.com", phoneCode: "+966", phone: "500000000",
  notes: "", privacyAccepted: "yes",
};
async function main() {
  console.log(`reference: ${submissionId.slice(0, 8).toUpperCase()}`);
  const r = await fetch(`${SITE}/api/journeys`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  console.log(`HTTP ${r.status}`, (await r.text()).slice(0, 200));
}
main().then(() => process.exit(0));
