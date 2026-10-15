#!/usr/bin/env node
// Fails when any warm-render case regressed more than THRESHOLD vs the baseline.
// Both files are vitest `--outputJson` reports; cases match by position (vitest's
// own compare does the same), so new cases must be appended at the end.
//
//   node scripts/bench-gate.mjs benchmarks/baseline.json benchmarks/head.json [threshold=0.10]

import { readFileSync } from "node:fs";

const [baseFile, headFile, thr = "0.10"] = process.argv.slice(2);
const THRESHOLD = Number(thr);
const cases = (file) =>
	JSON.parse(readFileSync(file, "utf8")).files.flatMap((f) =>
		f.groups.flatMap((g) =>
			g.benchmarks.map((b) => ({ name: g.fullName.split(" > ").pop(), mean: b.mean }))
		)
	);
const base = cases(baseFile);
const head = cases(headFile);
let failed = false;
for (let i = 0; i < head.length; i++) {
	const h = head[i];
	const b = base[i];
	if (!b) {
		console.log(`  new   ${h.name}: ${h.mean.toFixed(3)}ms (no baseline)`);
		continue;
	}
	const ratio = h.mean / b.mean;
	const tag = ratio > 1 + THRESHOLD ? "FAIL " : ratio < 1 - THRESHOLD ? "faster" : "ok   ";
	if (tag === "FAIL ") failed = true;
	console.log(
		`  ${tag} ${h.name}: ${b.mean.toFixed(3)} → ${h.mean.toFixed(3)}ms (${((ratio - 1) * 100).toFixed(1)}%)`
	);
}
if (failed) {
	console.error(
		`\nbench-gate: a warm-render case is more than ${THRESHOLD * 100}% slower than the baseline.`
	);
	process.exit(1);
}
console.log(`\nbench-gate: all ${head.length} cases within ${THRESHOLD * 100}%`);
