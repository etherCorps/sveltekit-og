#!/usr/bin/env node
// Cold render on Cloudflare Workers, via miniflare (`wrangler dev`) serving
// examples/cf-workers-build. Each sample starts a fresh wrangler, waits for the
// `/` page (which evaluates SvelteKit but not the image routes, so the package's
// own modules, the engine chunk and its wasm are still cold), then times the first
// request to each image route. The example's Satori route also fetches its fonts
// from the network, so that number includes a Google Fonts round trip.
//
//   node benchmarks/workers.mjs            run, diff against workers-baseline.json if present
//   node benchmarks/workers.mjs --save     run and write workers-baseline.json
//   WORKERS_SAMPLES=3                      samples per route (default 5)
//
// Rebuild first after a package change: `pnpm package` here, then `pnpm build` in the example.

import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const example = here("../../../examples/cf-workers-build");
const SAMPLES = Number(process.env.WORKERS_SAMPLES ?? 5);
const PORT = 8799;
const baselineFile = here("./workers-baseline.json");
const ROUTES = {
	"cold takumi (workers): html → png": "/takumi/default",
	"cold satori (workers): html → png, incl. font fetch": "/png/default.png",
};

if (!existsSync(`${example}/.svelte-kit/cloudflare/_worker.js`)) {
	console.error("examples/cf-workers-build is not built — run `pnpm build` there first");
	process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withWrangler(fn) {
	const child = spawn(
		"npx",
		["wrangler", "dev", "--port", String(PORT), "--log-level", "error"],
		{
			cwd: example,
			detached: true,
			stdio: "ignore",
		}
	);
	try {
		for (let i = 0; i < 120; i++) {
			try {
				if ((await fetch(`http://localhost:${PORT}/`)).ok) break;
			} catch {
				// not listening yet
			}
			await sleep(500);
		}
		return await fn();
	} finally {
		// wrangler spawns workerd; kill the whole group
		try {
			process.kill(-child.pid, "SIGTERM");
		} catch {
			// already gone
		}
		await sleep(500);
	}
}

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
const baseline = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, "utf8")) : null;
const results = {};

for (const [name, route] of Object.entries(ROUTES)) {
	const samples = [];
	for (let i = 0; i < SAMPLES; i++) {
		const ms = await withWrangler(async () => {
			const start = performance.now();
			const res = await fetch(`http://localhost:${PORT}${route}`);
			const bytes = await res.arrayBuffer();
			if (res.status !== 200 || bytes.byteLength === 0)
				throw new Error(`${route}: ${res.status}`);
			return performance.now() - start;
		});
		samples.push(ms);
	}
	samples.sort((a, b) => a - b);
	const median = pct(samples, 0.5);
	results[name] = { median, p75: pct(samples, 0.75), min: samples[0], max: samples.at(-1) };
	const base = baseline?.results[name]?.median;
	const diff = base ? ` (${(((median - base) / base) * 100).toFixed(1)}% vs baseline)` : "";
	console.log(`${name.padEnd(52)} median ${median.toFixed(1)}ms${diff}`);
}

if (process.argv.includes("--save")) {
	writeFileSync(
		baselineFile,
		JSON.stringify({ runtime: "workers (miniflare)", samples: SAMPLES, results }, null, "\t") +
			"\n"
	);
	console.log("saved → benchmarks/workers-baseline.json");
}
