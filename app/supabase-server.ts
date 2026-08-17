// Supabase client for Server Components, Server Actions and Route Handlers,
// scoped to the current visitor's session (via cookies). Used for reviewer
// auth checks. For actual proposals data access, see supabase-admin.ts —
// the proposals table has no permissive RLS policies, only the service role
// key (never this client) can read or write it.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component that can't set cookies, middleware
          // already refreshes the session on every request, so this is safe to ignore.
        }
      },
    },
  });
}

function allowedReviewerEmails(): string[] {
  return (process.env.REVIEWER_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

// Verifies the current request belongs to a logged-in, allowlisted reviewer.
// Returns the reviewer's email if valid, null otherwise, never throws.
export async function getReviewerEmail(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : null;
  if (error || !email) return null;
  return allowedReviewerEmails().includes(email) ? email : null;
}
