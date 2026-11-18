// news-image-20261117 entry: copies the front-page image to the output dir.
// Deterministic: no network, no timestamps, no randomness. Node 22 stdlib only.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const entryPng = fileURLToPath(new URL("./entry.png", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.png");

// Validate the source is a whole PNG before copying (PNG magic bytes).
const bytes = readFileSync(entryPng);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("entry.png is not a valid PNG file");
}
if (bytes.length > 1048576) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
}

// Second-run guard: if the output already holds an identical copy, leave it.
if (existsSync(outPath)) {
  const existing = readFileSync(outPath);
  const same =
    createHash("sha256").update(existing).digest("hex") ===
    createHash("sha256").update(bytes).digest("hex");
  if (same) {
    console.log(`Already up to date: ${outPath}`);
    process.exit(0);
  }
}

copyFileSync(entryPng, outPath);
console.log(`Wrote ${outPath}`);
