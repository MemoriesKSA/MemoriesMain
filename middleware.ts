// Refreshes the reviewer's Supabase Auth session cookie on every request.
// Server Components can't write cookies themselves, so without this, a
// session nearing expiry would silently fail to refresh and sign reviewers
// out mid-session. Route-level access control (allowlist check) lives in
// getReviewerEmail (supabase-server.ts), not here, this only keeps the
// session itself alive.

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/internal/:path*", "/auth/:path*"],
};
