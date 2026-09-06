// Every image the site asks for, and whether it exists.
//
// A missing image is invisible in every test we have: the build passes, the
// types pass, and the page renders with a hole in it. The catalogue holdback
// existed precisely because of this, and it only covered country cards - any
// other broken path ships silently.
//
// This reads every /images/... path written anywhere in the source and checks
// it against the files on disk, then reports the reverse too: files nobody
// references, which are either dead weight or a rename that lost its file.
//
//   npx tsx scripts/check-images.ts
//   npx tsx scripts/check-images.ts --orphans

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { countryGuides } from "../app/destination-guide-data";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");
const SHOW_ORPHANS = process.argv.includes("--orphans");

/** Every source file that could name an image. */
function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.(ts|tsx|js|jsx|css|json|md)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Every file actually sitting in public/. */
function publicFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) publicFiles(full, out);
    else out.push(full);
  }
  return out;
}

// Any string that looks like a path into /images. Deliberately loose on the
// extension, because a path with the wrong extension is exactly the bug this
// is looking for.
const IMAGE_PATH = /["'`](\/images\/[A-Za-z0-9/._-]+\.(?:webp|png|jpe?g|svg|avif|gif))["'`]/g;

type Reference = { path: string; where: string };

const references: Reference[] = [];
for (const file of sourceFiles(join(ROOT, "app")).concat(sourceFiles(join(ROOT, "scripts")))) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(IMAGE_PATH)) {
    references.push({ path: match[1], where: relative(ROOT, file).split(sep).join("/") });
  }
}

// The literals above are only part of the story, and a check that stopped
// there would have reported a clean site while 158 files sat unreferenced.
// Every city card builds its path from the data instead:
//
//   image: `/images/cities/${country.value}/${city.value}.webp`
//
// so the catalogue itself has to be walked. This is the authoritative list of
// what the site will actually ask a browser for.
for (const country of countryGuides) {
  references.push({ path: country.image, where: `countryGuides[${country.slug}]` });
  for (const city of country.cities) {
    references.push({ path: city.image, where: `countryGuides[${country.slug}].cities[${city.slug}]` });
  }
}

const unique = [...new Map(references.map((r) => [r.path, r])).values()];
const missing = unique.filter((r) => !existsSync(join(PUBLIC, r.path)));

// Which source files each missing path is named in, so a fix has somewhere to go.
const blamed = new Map<string, string[]>();
for (const r of references) {
  if (!missing.some((m) => m.path === r.path)) continue;
  blamed.set(r.path, [...new Set([...(blamed.get(r.path) ?? []), r.where])]);
}

const onDisk = publicFiles(join(PUBLIC, "images")).map((f) => "/" + relative(PUBLIC, f).split(sep).join("/"));
const referenced = new Set(unique.map((r) => r.path));
const orphans = onDisk.filter((f) => !referenced.has(f));

console.log(`${unique.length} distinct image paths referenced in source`);
console.log(`${onDisk.length} image files on disk under public/images\n`);

if (missing.length) {
  console.log(`MISSING - referenced but not on disk (${missing.length}):`);
  for (const m of missing.sort((a, b) => a.path.localeCompare(b.path))) {
    console.log(`  ${m.path}`);
    console.log(`      named in: ${(blamed.get(m.path) ?? []).join(", ")}`);
  }
} else {
  console.log("MISSING: none. Every referenced image exists.");
}

if (SHOW_ORPHANS) {
  console.log(`\nORPHANS - on disk, referenced nowhere (${orphans.length}):`);
  for (const o of orphans.sort()) {
    const kb = Math.round(statSync(join(PUBLIC, o)).size / 1024);
    console.log(`  ${String(kb).padStart(5)} KB  ${o}`);
  }
  const wasted = orphans.reduce((sum, o) => sum + statSync(join(PUBLIC, o)).size, 0);
  console.log(`  ${Math.round(wasted / 1048576)} MB shipped and never asked for`);
} else if (orphans.length) {
  console.log(`\n${orphans.length} file(s) on disk are referenced nowhere. Re-run with --orphans to list them.`);
}

if (missing.length) process.exit(1);
