// The real dimensions of the images already on the site, so a brief for a
// designer states facts rather than guesses.
//
//   npx tsx scripts/image-specs.ts

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

/** Width and height straight out of the file header. */
function size(path: string): { w: number; h: number } | null {
  const buf = readFileSync(path);
  // PNG: IHDR is always the first chunk.
  if (buf.length > 24 && buf.toString("ascii", 1, 4) === "PNG") {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  // WebP: RIFF container, then one of three chunk types.
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const kind = buf.toString("ascii", 12, 16);
    if (kind === "VP8X") return { w: (buf.readUIntLE(24, 3) & 0xffffff) + 1, h: (buf.readUIntLE(27, 3) & 0xffffff) + 1 };
    if (kind === "VP8L") {
      const b = buf.readUInt32LE(21);
      return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
    }
    if (kind === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  }
  return null;
}

function report(label: string, files: string[]) {
  const rows = files.map((f) => ({ f, s: size(f), kb: Math.round(statSync(f).size / 1024) })).filter((r) => r.s);
  if (!rows.length) return;
  const ws = rows.map((r) => r.s!.w);
  const hs = rows.map((r) => r.s!.h);
  const kbs = rows.map((r) => r.kb);
  const ratios = rows.map((r) => r.s!.w / r.s!.h);
  const mid = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
  console.log(`\n${label}  (${rows.length} files)`);
  console.log(`  width   ${Math.min(...ws)}–${Math.max(...ws)}   most common ${mid(ws)}`);
  console.log(`  height  ${Math.min(...hs)}–${Math.max(...hs)}   most common ${mid(hs)}`);
  console.log(`  ratio   ${Math.min(...ratios).toFixed(2)}–${Math.max(...ratios).toFixed(2)}   typical ${mid(ratios).toFixed(2)}`);
  console.log(`  size    ${Math.min(...kbs)}–${Math.max(...kbs)} KB   typical ${mid(kbs)} KB`);
  for (const r of rows.slice(0, 3)) console.log(`    e.g. ${r.f.replace(/\\/g, "/")}  ${r.s!.w}x${r.s!.h}  ${r.kb} KB`);
}

const heroes = existsSync("public/images/destinations")
  ? readdirSync("public/images/destinations").map((f) => join("public/images/destinations", f))
  : [];

const cityFiles: string[] = [];
const root = "public/images/cities";
for (const dir of readdirSync(root)) {
  for (const f of readdirSync(join(root, dir))) cityFiles.push(join(root, dir, f));
}

report("COUNTRY HERO IMAGES  (public/images/destinations/)", heroes);
report("CITY CARD IMAGES  (public/images/cities/<country>/)", cityFiles);
