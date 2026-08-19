# Paid plans — product spec

Status: agreed, not built. Written 2026-08-18.

Turns the journey plan from a free deliverable into the product. The customer
gets a genuine preview, pays, and unlocks the rest.

---

## 1. What is sold

A complete, personalised trip plan for **one trip with up to three stops**
inside Saudi Arabia, written to the customer, with the directions to book it
themselves.

| Stops | Price |
|---|---|
| 1 | SAR 99 |
| 2 | SAR 149 |
| 3 | SAR 199 |

Not sold: booking on the customer's behalf. We give the plan and the
directions; they book. This must be unmistakable at checkout, or the
expectation gap becomes a refund argument.

**Saudi only at launch.** AI drafts require flagship city data, which exists
for 15 Saudi cities and nothing else. The "design your dream journey" path
can still take non-Saudi requests as leads, but there is no paid plan behind
them yet and the UI must not imply one.

---

## 2. One trip, multiple stops

A multi-stop request is **one journey**, not several plans:

- One overall date range; the draft proposes how to split it between stops
- Days number sequentially across the whole trip (Riyadh 1–4, Jeddah 5–8)
- The **transition between stops is planned**, not skipped: the Haramain
  train where it applies, a domestic hop otherwise. This is real planning
  work and part of what the extra SAR 50 buys.
- Stops are ordered; the order is the travel order

**Consecutive duplicates are rejected.** Riyadh → Riyadh is just a longer
Riyadh stay and the customer should extend their dates instead. Riyadh →
Jeddah → Riyadh is allowed and priced as three stops, because it is a real
pattern (fly in, side trip, return to depart) and genuinely three segments to
plan.

---

## 3. What is free, and what is paid

**Free, before payment:**
- The whole overview: hotel and driver picks with the reasoning, practical
  notes, getting-there guidance
- **The first day of each stop**, in full
- The headings of every remaining day, e.g. "Day 2 · Friday 21 August", so
  they can see the shape of what they are buying

**Paid:**
- Every remaining day, in full
- Permanent access, both languages

The overview is deliberately free. It is the strongest proof the plan is
genuinely theirs: their name, their dates, a hotel chosen for their budget
with the reason stated. Locking it would hide the evidence that this is worth
paying for.

### Security requirement, non-negotiable

The locked content must **never be sent to the browser** for an unpaid plan.
Rendering the full text and hiding it with CSS means anyone can read it in
devtools, and the entire product is then free. The server decides what to
serve based on `paid`, and unpaid requests receive only the free portion.

---

## 4. Flow

1. Customer completes the planner, choosing 1–3 stops. Free.
2. AI drafts the full trip. Human reviews and publishes.
3. Customer receives "your plan is ready" with their link.
4. Journey page shows the free portion and a clear price for the rest.
5. Customer pays. The full plan unlocks permanently.
6. **One free revision** is available after payment.
7. A different trip means a new request and a new payment.

### Human review happens before payment

Deliberate, for now. Accuracy is the differentiator and showing unreviewed
content in the shop window is the one risk not worth taking. The cost is
review time spent on people who never pay. Revisit if that volume becomes
real, not before.

---

## 5. Revisions

One free revision per paid plan.

**In scope:** a different hotel, a different pace, different restaurants,
small date shifts, anything that adjusts *this* trip.

**Out of scope, needs a new plan at full price:** a different city, a
different date range, a different set of travellers. Those are a new trip
wearing a revision's clothes.

Requested from a button on the journey page, not by email, so the request
stays attached to the plan and the used/unused state is tracked rather than
remembered.

State this scope at checkout. It is much easier to agree in advance than to
argue afterwards.

---

## 6. Refunds

**No refunds for change of mind** once the plan is unlocked. Digital good,
delivered instantly, and it can be screenshotted. Stated at checkout with an
explicit acknowledgement.

**Refunds when we get it wrong, at our discretion.** The customer contacts
support, explains, and we decide whether there was a genuine problem with
the plan.

This is not softness, it is necessary. A hotel in our own data turned out to
be a building site due in 2027. If someone pays SAR 99 for a plan built
around a hotel they cannot book, refusing costs far more than SAR 99.

Worded as discretionary, never as a right the customer can invoke, or every
dissatisfied customer becomes a claim.

**To check before launch:** Saudi consumer law on digital goods. There may be
mandatory provisions that override a stated no-refund policy, and this spec
does not assume otherwise.

---

## 7. Reminder

**One** email, roughly 24 hours after publishing, if still unpaid. Short,
pointing back at their plan.

Not a sequence. They already have the overview and a full day for free;
repeated chasing on a SAR 99 product reads as pestering.

**No invented expiry.** The plan is built for their dates and ages out on its
own. A fake countdown on a product whose entire value is honesty would
contradict everything else we have built.

---

## 8. Sharing

The link is a shared secret, not a login. A customer who pays may share it
with whoever they like; they bought it, and they could screenshot it anyway.

Consequence to remember: anyone holding the URL sees the plan **and** the
customer's name and dates. Acceptable for a bought document. It does mean
nothing genuinely sensitive can be added to that page later without adding
real authentication first.

---

## 9. What has to be built

**Schema** (`proposals`)
- `paid` boolean, default false
- `paid_at` timestamptz
- `payment_ref` text, the provider's reference
- `amount` integer, what was actually charged
- `revision_used` boolean, default false
- `stops` jsonb, the ordered stops and which day each begins on

**Planner**
- "Add another destination" for up to 3 stops
- Reject consecutive duplicates
- Show the price as stops are added

**Draft generation**
- Accept multiple cities, load grounded facts and cached research for each
- Plan the inter-city transition
- Number days sequentially across the trip
- Emit a machine-readable stop marker so the page knows where each stop
  begins, stripped from customer text like the other internal sections

**Journey page**
- Server-side split: free portion for unpaid, everything for paid
- Locked day headers with a clear price
- Revision button when paid and unused

**Payment**
- Provider must support **mada**; it dominates Saudi card payments and a
  Visa/Mastercard-only checkout loses a large share of customers. Moyasar or
  Tap. Stripe does not qualify.
- Mark paid from the **webhook**, never from the browser redirect

**Email**
- One unpaid reminder at ~24h

---

## 10. Open before build

- Payment provider account, and whether it needs a registered commercial entity
- Saudi consumer law on digital-goods refunds
- Whether SAR 99 is the right anchor. It is cheap for a researched,
  personalised multi-day plan; chosen for low friction and fast learning, and
  worth revisiting once conversion is known.
