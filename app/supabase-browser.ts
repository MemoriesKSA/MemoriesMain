// Supabase client for the browser, used only by the reviewer login page to
// request a magic link. Never used to query the proposals table directly,
// the anon key has no read/write access to it (see supabase-admin.ts).

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
