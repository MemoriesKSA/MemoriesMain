// Checks every URL in the registry actually resolves. A 403 or 406 usually
// means bot-blocking rather than a dead page, so it's reported separately from a
// genuine 404.

import { PLACE_URLS } from "../app/journey/place-urls";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36";

// Forty-odd requests fired back to back made hosts start refusing, and a
// different entry failed on every run: a timeout one time, a 503 the next,
// on URLs that answer fine when asked on their own. A report that changes
// its mind between runs is worse than no report, because the real dead link
// is indistinguishable from the noise.
const GAP_MS = 400;
// A pause alone doesn't clear a 503, so a transient answer is asked once
// more after a longer wait. Only for the statuses that mean "not now":
// a 404 is an answer and is never retried.
const RETRY_PAUSE_MS = 2_000;
const TRANSIENT = (status: number) => status === 0 || status === 429 || status >= 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function attempt(url: string) {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": UA, Accept: "text/html" }, signal: AbortSignal.timeout(20000) });
    return { status: res.status, finalUrl: res.url };
  } catch (e) {
    return { status: 0, finalUrl: "", error: (e as Error).message };
  }
}

async function check(url: string) {
  const first = await attempt(url);
  if (!TRANSIENT(first.status)) return { ...first, retried: false };
  await sleep(RETRY_PAUSE_MS);
  const second = await attempt(url);
  return { ...second, retried: true };
}

async function main() {
  const entries: [string, string][] = Object.entries(PLACE_URLS);
  const bad: string[] = [];
  const blocked: string[] = [];

  for (const [index, [name, url]] of entries.entries()) {
    if (index > 0) await sleep(GAP_MS);
    const r = await check(url);
    const ok = r.status >= 200 && r.status < 400;
    const redirected = r.finalUrl && r.finalUrl.replace(/\/$/, "") !== url.replace(/\/$/, "");
    const blockedStatus = r.status === 403 || r.status === 406;
    let tag = ok ? "OK  " : blockedStatus ? "BLOCK" : "FAIL";
    if (!ok && !blockedStatus) bad.push(`${name} -> ${url} (${r.status || r.error})`);
    if (blockedStatus) blocked.push(`${name} -> ${url}`);
    console.log(`${tag} ${String(r.status).padStart(3)}  ${name}${r.retried ? "  (retried)" : ""}`);
    if (ok && redirected) console.log(`        redirects to: ${r.finalUrl}`);
  }

  console.log(`\n--- summary of ${entries.length} ---`);
  console.log(`failed: ${bad.length}`);
  bad.forEach((b) => console.log(`  ${b}`));
  console.log(`bot-blocked (likely fine, verify by eye): ${blocked.length}`);
  blocked.forEach((b) => console.log(`  ${b}`));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
