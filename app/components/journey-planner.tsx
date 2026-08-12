"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function JourneyPlanner({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }
  if (sent) return <div className="plannerSuccess" role="status"><CheckCircle2 /><div><strong>Your journey has begun.</strong><p>Thank you. A MEMORIES travel designer will contact you within one business day.</p></div></div>;
  return <form className={compact ? "quickPlanner" : "journeyForm"} onSubmit={submit}>
    {compact ? <div><p className="kicker light">Plan the first step</p><h3>Where will your next memory be?</h3></div> : null}
    <label><span>Destination</span><select name="destination" required defaultValue=""><option value="" disabled>Where would you like to go?</option><option>AlUla</option><option>Maldives</option><option>Paris</option><option>Switzerland</option><option>Istanbul</option><option>Surprise me</option></select></label>
    <label><span>Travellers</span><select name="travellers" required defaultValue=""><option value="" disabled>Who is travelling?</option><option>Solo</option><option>Couple</option><option>Family</option><option>Friends</option><option>Corporate group</option></select></label>
    <label><span>{compact ? "When" : "Preferred month"}</span><input name="month" type="month" required /></label>
    {!compact ? <><label><span>Full name</span><input name="name" autoComplete="name" required placeholder="Your name" /></label><label><span>Email</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label><span>Phone / WhatsApp</span><input name="phone" type="tel" autoComplete="tel" required placeholder="+966" /></label><label className="full"><span>Tell us what would make this journey special</span><textarea name="notes" rows={5} placeholder="Celebration, preferred pace, children’s ages, accessibility needs…" /></label></> : null}
    <button className="button gold" type="submit">{compact ? "Start planning" : "Send my request"} <ArrowRight size={16} /></button>
  </form>;
}
