// Service-role Supabase client, server-only, bypasses row-level security.
// This is the ONLY client that ever reads or writes the proposals table:
// the anon key has no policy granting it access, by design. Callers of this
// module are responsible for their own authorization (see getReviewerEmail
// in supabase-server.ts for the reviewer tool; the public /journey/[token]
// page authorizes itself by requiring an exact, unguessable token match).

import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
