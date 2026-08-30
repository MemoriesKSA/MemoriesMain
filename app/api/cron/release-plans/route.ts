import { createSupabaseAdminClient } from "../../../supabase-admin";
import { sendProposalReadyEmail } from "../../../proposal-email";
import { AUTO_RELEASE_ENABLED } from "../../../follow/release";

export const runtime = "nodejs";
export const maxDuration = 60;

// Sends finished plans when their release window is up.
//
// This is the only thing in the system that reaches a customer with nobody
// watching, so it is deliberately narrow about what it will touch. A plan is
// released only when ALL of these hold:
//
//   - the drafting pipeline finished it (the English is stored)
//   - its release window has passed
//   - the self-check came back CLEAN
//   - it has not already been sent
//
// The Arabic half is deliberately NOT required. A customer can ask for English
// only, and requiring both meant their plan would have sat here forever,
// finished and never sent. A plan that should have had an Arabic half and does
// not is caught by the self-check instead, which is what the CLEAN condition
// above is for.
//
// Anything the self-check flagged is left alone forever. Those are the drafts
// with something actually wrong in them, and the whole point of the flag is
// that a person looks before a customer does. The cron does not "eventually"
// send them; it never sends them.
//
// sent_at is stamped BEFORE the send is attempted. A retry, an overlapping run
// or a timeout mid-batch can then only ever under-send, never send twice. A
// customer who has to be sent their plan by hand is a nuisance; a customer who
// receives it three times is a different kind of business.

const BATCH = 25;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("Plan release skipped: CRON_SECRET is not set");
    return Response.json({ error: "Not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!AUTO_RELEASE_ENABLED) {
    return Response.json({ ok: true, released: 0, note: "Automatic release is switched off." });
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("status", "draft")
    .is("sent_at", null)
    .not("release_at", "is", null)
    .lte("release_at", now)
    .not("itinerary_en", "is", null)
    .eq("review_state", "clean")
    .order("release_at", { ascending: true })
    .limit(BATCH);

  if (error) {
    console.error("Plan release could not read due plans", error.message);
    return Response.json({ error: "Read failed." }, { status: 500 });
  }

  let released = 0;
  let held = 0;

  for (const proposal of data ?? []) {
    // review_state is already filtered in the query above. This is the second
    // lock on the same door: a row that somehow arrives here without a clean
    // verdict is not sent, whatever the query thought.
    if (proposal.review_state !== "clean") {
      held++;
      continue;
    }

    // Stamped first. See the note at the top about which way this must fail.
    const { error: claimError } = await supabase
      .from("proposals")
      .update({ sent_at: new Date().toISOString(), status: "published" })
      .eq("id", proposal.id)
      .is("sent_at", null);

    if (claimError) {
      console.error(`Plan release could not claim ${proposal.reference}`, claimError.message);
      continue;
    }

    try {
      await sendProposalReadyEmail({ ...proposal, status: "published" });
      released++;
      console.log(`Released ${proposal.reference} to the customer.`);
    } catch (sendError) {
      // The row already says sent. Say loudly that it did not, because this is
      // the case that needs a human and will not fix itself.
      console.error(`RELEASED BUT EMAIL FAILED for ${proposal.reference}, send it by hand`, sendError);
    }
  }

  console.log(`Plan release: ${released} sent, ${held} held for review.`);
  return Response.json({ ok: true, released, held });
}
