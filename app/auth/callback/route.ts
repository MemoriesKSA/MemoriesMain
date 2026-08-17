import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../supabase-server";

// Handles the redirect from a Supabase magic-link email: exchanges the
// one-time code for a real session cookie, then sends the reviewer on to
// wherever they were headed. Allowlist enforcement happens on the
// destination pages themselves (getReviewerEmail), not here, a valid
// Supabase session just proves the email was theirs to click.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/internal/journeys";
  if (!next.startsWith("/")) next = "/internal/journeys";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/internal/login?error=send-failed`);
}
