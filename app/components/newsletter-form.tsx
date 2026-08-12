"use client";

import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";

export function NewsletterForm() {
  const [joined, setJoined] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setJoined(true); event.currentTarget.reset(); }
  return <div className="newsletter"><div className="mailIcon"><Mail /></div><div><h3>Be the first to know</h3><p>Join our list for travel inspiration and founding-member offers.</p></div>{joined ? <p className="success" role="status">You&apos;re on the list. Welcome to MEMORIES.</p> : <form onSubmit={submit}><label className="srOnly" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" name="email" type="email" placeholder="Enter your email" required /><button type="submit">Join the list</button></form>}<div className="trust"><strong>★★★★★</strong><span>Private. No spam. Unsubscribe anytime.</span></div></div>;
}
