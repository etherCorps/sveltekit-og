#!/usr/bin/env node
// Runs the micro-benchmark and saves a date-stamped snapshot under
// benchmarks/snapshots/. If a baseline.json exists, it also diffs the run
// against it in the same pass. Use this to build up a history of runs.

import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const snapshotsDir = join(root, "benchmarks", "snapshots");
const baseline = join(root, "benchmarks", "baseline.json");

mkdirSync(snapshotsDir, { recursive: true });

// 2026-06-27T14-30-00 — sortable, filename-safe, and unique per run.
const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
const outFile = join("benchmarks", "snapshots", `${stamp}.json`);

const args = ["bench", "--run", "--outputJson", outFile];
if (existsSync(baseline)) {
	args.push("--compare", "benchmarks/baseline.json");
	console.log(`\n  comparing against benchmarks/baseline.json`);
} else {
	console.log(`\n  no baseline.json yet — run "pnpm bench:save" to set a reference point`);
}
console.log(`  saving snapshot → ${outFile}\n`);

const res = spawnSync("vitest", args, { cwd: root, stdio: "inherit", shell: true });
process.exit(res.status ?? 1);
