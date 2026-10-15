#!/usr/bin/env node
// Collects the current numbers into benchmarks/report.json for the docs "Benchmarks"
// page: warm (vitest, mean ms), cold on node and bun (median ms), cold on Workers
// (miniflare, median ms). Run on release, on a quiet machine, after `pnpm package`
// and a build of examples/cf-workers-build.
//
//   node scripts/bench-report.mjs            everything
//   node scripts/bench-report.mjs --no-workers

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { arch, cpus, platform, release } from "node:os";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const run = (cmd, args, env = {}) => {
	const r = spawnSync(cmd, args, {
		cwd: here(".."),
		encoding: "utf8",
		env: { ...process.env, ...env },
	});
	if (r.status !== 0)
		throw new Error(`${cmd} ${args.join(" ")} failed:\n${r.stderr || r.stdout}`);
	return r.stdout;
};
const parseCold = (out) =>
	Object.fromEntries(
		[...out.matchAll(/^(cold [^:]+): ([^\n]+?)\s+median ([\d.]+)ms/gm)].map((m) => [
			`${m[1]}: ${m[2]}`.replace(/\s+/g, " "),
			Number(m[3]),
		])
	);

const report = {
	generatedAt: new Date().toISOString(),
	version: JSON.parse(readFileSync(here("../package.json"), "utf8")).version,
	machine: {
		platform: `${platform()} ${release()} ${arch()}`,
		cpu: cpus()[0]?.model ?? "",
		node: process.version,
	},
	warm: {},
	cold: {},
};

run("pnpm", ["vitest", "bench", "--run", "--outputJson", "benchmarks/report-warm.json"]);
for (const f of JSON.parse(readFileSync(here("../benchmarks/report-warm.json"), "utf8")).files)
	for (const g of f.groups)
		for (const b of g.benchmarks)
			report.warm[g.fullName.split(" > ").pop()] = { mean: b.mean, p99: b.p99 };

report.cold.node = parseCold(run("node", ["benchmarks/cold.mjs"], { COLD_SAMPLES: "15" }));
report.cold.bun = parseCold(
	run("node", ["benchmarks/cold.mjs"], { COLD_SAMPLES: "15", COLD_RUNTIME: "bun" })
);
if (
	!process.argv.includes("--no-workers") &&
	existsSync(here("../../../examples/cf-workers-build/.svelte-kit/cloudflare/_worker.js"))
)
	report.cold.workers = parseCold(
		run("node", ["benchmarks/workers.mjs"], { WORKERS_SAMPLES: "5" })
	);

writeFileSync(here("../benchmarks/report.json"), JSON.stringify(report, null, "\t") + "\n");
console.log(
	`benchmarks/report.json written (${Object.keys(report.warm).length} warm, ${Object.keys(report.cold).length} cold runtimes)`
);
