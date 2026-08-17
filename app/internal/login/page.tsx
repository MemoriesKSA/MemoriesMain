import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../supabase-server";

async function sendMagicLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/internal/login?error=missing-email");

  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/internal/journeys` },
  });

  if (error) redirect("/internal/login?error=send-failed");
  redirect(`/internal/login?sent=${encodeURIComponent(email)}`);
}

export default async function InternalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div style={{ minHeight: "100vh", background: "var(--ivory)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, boxShadow: "var(--shadow)", padding: 36 }}>
        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "var(--gold)" }}>MEMORIES · REVIEWER SIGN IN</p>
        <h1 style={{ margin: "0 0 20px", fontFamily: "var(--font-display), Georgia, serif", fontSize: 26, color: "var(--ink)" }}>Internal access</h1>

        {params.sent ? (
          <p style={{ color: "var(--ink-2)", fontSize: 15, lineHeight: 1.6 }}>
            Sent a sign-in link to <strong>{params.sent}</strong>. Open it on this device to continue, it expires shortly.
          </p>
        ) : (
          <form action={sendMagicLink}>
            <label htmlFor="email" style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@memoriesksasupport.com"
              style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15, marginBottom: 16 }}
            />
            {params.error === "missing-email" && <p style={{ color: "#b3261e", fontSize: 13, margin: "0 0 12px" }}>Enter an email address.</p>}
            {params.error === "send-failed" && <p style={{ color: "#b3261e", fontSize: 13, margin: "0 0 12px" }}>Couldn&apos;t send the link, try again.</p>}
            <button
              type="submit"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "none", background: "var(--ink)", color: "var(--paper)", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
            >
              Send sign-in link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
