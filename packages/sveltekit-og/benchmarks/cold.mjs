#!/usr/bin/env node
// Cold render: one fresh Node process per sample, so module evaluation, WASM
// compile/instantiate and font registration all land in the measurement (Vitest
// can't do this: it keeps externalized deps and their wasm alive across runs).
// Times from just before importing the package to the drained PNG; node boot is
// excluded. Needs a built package: run `pnpm package` first.
//
//   node benchmarks/cold.mjs                     run, diff against cold-baseline.json if present
//   node benchmarks/cold.mjs --save              run and write cold-baseline.json
//   COLD_RUNTIME=bun node benchmarks/cold.mjs    same, but each sample runs under `bun`
//                                                (baseline file: cold-baseline.bun.json)

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const SAMPLES = Number(process.env.COLD_SAMPLES ?? 10);
const RUNTIME = process.env.COLD_RUNTIME ?? "node";
const baselineFile = here(
	RUNTIME === "node" ? "./cold-baseline.json" : `./cold-baseline.${RUNTIME}.json`
);
const componentFile = here("./.cold/OG.js");

if (process.argv[2] === "--child") {
	const [engine, input] = process.argv.slice(3);
	const fontData = readFileSync(here("../src/routes/(components)/SpaceMono-Regular.ttf"));
	const options = {
		width: 1200,
		height: 630,
		fonts: [{ name: "Space Mono", data: fontData, weight: 400, style: "normal" }],
		...(engine === "satori" && { engine: "satori" }),
	};
	const element =
		input === "svelte"
			? (await import(componentFile)).default
			: '<div class="h-full w-full flex items-center justify-center bg-white text-6xl">Hello, OGs</div>';
	const props = { text: "Ready to try sveltekit-og?", spanText: "Start building for free." };

	const start = performance.now();
	// same public entries as the warm bench, resolved from dist like a consumer would
	const entry = engine === "satori" ? "../dist/index.js" : "../dist/takumi/index.js";
	const { ImageResponse } = await import(here(entry));
	const res = new ImageResponse(element, options, input === "svelte" ? props : undefined);
	const bytes = await res.arrayBuffer();
	if (res.status !== 200 || bytes.byteLength === 0)
		throw new Error(`render failed: ${res.status}`);
	console.log(performance.now() - start);
	process.exit(0);
}

if (!existsSync(here("../dist/index.js"))) {
	console.error("dist/ missing — run `pnpm package` first");
	process.exit(1);
}

// compile the fixture component once so child processes can import it as plain JS
const { compile } = await import("svelte/compiler");
const source = readFileSync(here("../src/routes/(components)/OG.svelte"), "utf8");
mkdirSync(here("./.cold"), { recursive: true });
writeFileSync(componentFile, compile(source, { generate: "server" }).js.code);

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
const baseline = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, "utf8")) : null;
const results = {};

for (const engine of ["satori", "takumi"]) {
	for (const input of ["html", "svelte"]) {
		const name = `cold ${engine}: ${input} → png`;
		const samples = [];
		for (let i = 0; i < SAMPLES; i++) {
			const run = spawnSync(
				RUNTIME === "node" ? process.execPath : RUNTIME,
				[here("./cold.mjs"), "--child", engine, input],
				{
					encoding: "utf8",
				}
			);
			if (run.status !== 0) {
				console.error(run.stderr);
				process.exit(1);
			}
			samples.push(Number(run.stdout.trim().split("\n").pop()));
		}
		samples.sort((a, b) => a - b);
		const median = pct(samples, 0.5);
		results[name] = { median, p75: pct(samples, 0.75), min: samples[0], max: samples.at(-1) };

		const base = baseline?.results[name]?.median;
		const diff = base ? ` (${(((median - base) / base) * 100).toFixed(1)}% vs baseline)` : "";
		console.log(`${name.padEnd(28)} median ${median.toFixed(1)}ms${diff}`);
	}
}

if (process.argv.includes("--save")) {
	const meta = {
		runtime: RUNTIME,
		node: process.version,
		platform: `${process.platform}-${process.arch}`,
	};
	writeFileSync(
		baselineFile,
		JSON.stringify({ ...meta, samples: SAMPLES, results }, null, "\t") + "\n"
	);
	console.log(`saved → benchmarks/${baselineFile.split("/").pop()}`);
}
