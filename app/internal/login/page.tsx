import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../supabase-server";
import { SubmitButton } from "./submit-button";

async function signIn(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/internal/login?error=missing-fields");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect("/internal/login?error=invalid-credentials");
  redirect("/internal/journeys");
}

export default async function InternalLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const inputStyle = { width: "100%", boxSizing: "border-box" as const, padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15, marginBottom: 16 };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ivory)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, boxShadow: "var(--shadow)", padding: 36 }}>
        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "var(--gold)" }}>MEMORIES · REVIEWER SIGN IN</p>
        <h1 style={{ margin: "0 0 20px", fontFamily: "var(--font-display), Georgia, serif", fontSize: 26, color: "var(--ink)" }}>Internal access</h1>

        <form action={signIn}>
          <label htmlFor="email" style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
            Email address
          </label>
          <input id="email" name="email" type="email" required placeholder="you@memoriesksasupport.com" style={inputStyle} />

          <label htmlFor="password" style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
            Password
          </label>
          <input id="password" name="password" type="password" required style={inputStyle} />

          {params.error === "missing-fields" && <p style={{ color: "#b3261e", fontSize: 13, margin: "0 0 12px" }}>Enter both fields.</p>}
          {params.error === "invalid-credentials" && <p style={{ color: "#b3261e", fontSize: 13, margin: "0 0 12px" }}>Wrong email or password.</p>}

          <SubmitButton label="Sign in" pendingLabel="Signing in…" />
        </form>
      </div>
    </div>
  );
}
