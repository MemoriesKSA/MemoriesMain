import { createSupabaseAdminClient } from "../../supabase-admin";

export const runtime = "nodejs";

const MAX_MESSAGE = 4_000;
const MAX_SHORT = 200;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  // Same origin check the newsletter route uses: this endpoint writes to our
  // database from an unauthenticated form, so it should only accept posts
  // that came from our own pages.
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== requestUrl.host) return Response.json({ error: "Invalid request origin." }, { status: 403 });
    } catch {
      return Response.json({ error: "Invalid request origin." }, { status: 403 });
    }
  }

  let body: { message?: unknown; name?: unknown; email?: unknown; about?: unknown; locale?: unknown; page?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }

  const message = clean(body.message, MAX_MESSAGE);
  if (message.length < 2) return Response.json({ error: "Please write a message." }, { status: 400 });

  // Everything except the message is optional, so an empty string is stored
  // as null rather than as "". A column full of empty strings reads as
  // "they answered nothing" instead of "we never asked".
  const name = clean(body.name, MAX_SHORT) || null;
  const rawEmail = clean(body.email, 254).toLowerCase();
  // An address that does not parse is dropped rather than refused. They came
  // to say something, and losing the message over a typo in a field we did
  // not require would be the wrong trade.
  const email = rawEmail && emailPattern.test(rawEmail) ? rawEmail : null;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("feedback").insert({
    message,
    name,
    email,
    about: clean(body.about, MAX_SHORT) || null,
    locale: body.locale === "ar" ? "ar" : "en",
    page: clean(body.page, 500) || null,
  });

  if (error) {
    // The message itself is not logged: it is someone's own words and it is
    // already safely in the row if the insert worked, or lost if it did not.
    console.error("Feedback insert failed", error.message);
    return Response.json({ error: "We could not save that. Please try again." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
