// patch-notes-entry — writes one original comedy patch note to /output/entry.txt.
// Node 22 stdlib only. Run: node main.ts [out-dir]
// The out dir defaults to /output (the grader's sandbox path); pass a
// different directory as the first argument when running locally.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";

// The entry: one original patch note, drafted for this competition.
// A real-life/human-biology bug (the brain replaying an old embarrassment
// instead of sleeping), written in the terse register of a release note.
const PATCH_NOTE =
  "v2.7.4: fixed a bug where the brain replayed your most embarrassing " +
  "moment from 2009 every night at 3 AM instead of sleeping.";

const MIN_CHARS = 1;
const MAX_CHARS = 160;

function codePointLength(text: string): number {
  return [...text].length;
}

function validate(note: string): void {
  const length = codePointLength(note);
  if (length < MIN_CHARS || length > MAX_CHARS) {
    throw new Error(
      `entry must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${length}`,
    );
  }
  if (note.includes("\n") || note.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (note.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
}

function main(): void {
  validate(PATCH_NOTE);

  const outDir = resolve(process.argv[2] ?? process.env.MAKEFUN_OUT_DIR ?? "/output");
  mkdirSync(outDir, { recursive: true });

  // No trailing newline: the gate counts characters, so the file holds
  // exactly the one line, byte for byte, every run.
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, PATCH_NOTE, "utf8");

  // Read-back verification: re-read what was just written and compare it
  // byte-for-byte with the intended line, so a silent write failure
  // (truncated/partial/corrupt output) is caught instead of shipped.
  const written = readFileSync(outPath);
  if (!written.equals(Buffer.from(PATCH_NOTE, "utf8"))) {
    throw new Error(`read-back mismatch: ${outPath} does not match the entry`);
  }

  const sha256 = createHash("sha256").update(PATCH_NOTE, "utf8").digest("hex");
  console.log(`wrote ${outPath} (${codePointLength(PATCH_NOTE)} chars, sha256 ${sha256})`);
}

main();
