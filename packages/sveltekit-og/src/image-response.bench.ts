import { readFileSync } from "node:fs";
import { bench, describe } from "vitest";

// Public API only: CI overlays this file onto the v4.4.0 sources to build the
// baseline on the same runner, so it must not import anything that moves in v5.
import { ImageResponse as RootImageResponse } from "#lib/index.js";
import { ImageResponse as TakumiImageResponse } from "#lib/takumi/index.js";
import OG from "./routes/(components)/OG.svelte";

// Local font so we measure pure generation cost, not a network font fetch.
const fontData = readFileSync(
	new URL("./routes/(components)/SpaceMono-Regular.ttf", import.meta.url)
);

const fonts = [
	{ name: "Space Mono", data: fontData, weight: 400 as const, style: "normal" as const },
];

// A representative OG template: flex layout, nested text, tailwind classes.
const template = `
	<div class="h-full w-full flex flex-col items-center justify-center bg-white">
		<div class="text-6xl font-bold" style="color:#203649">Hello, OGs</div>
		<div class="text-3xl" style="margin-top:20px;color:#475569">Welcome to sveltekit-og</div>
	</div>
`
	.replaceAll("\n", "")
	.trim();

const props = { text: "Ready to try sveltekit-og?", spanText: "Start building for free." };
const size = { width: 1200, height: 630, fonts };

// 4.4.0's root entry is Satori and ignores `engine`; v5 defaults to Takumi and needs it.
// Passing it on both keeps the case name honest across versions. (Spread in, so the 4.x
// option type doesn't reject the key.)
const satori = { ...size, engine: "satori" as const };

type Format = "png" | "svg";
const engines = {
	satori: (format: Format, component?: boolean) =>
		component
			? new RootImageResponse(OG, { ...satori, format }, props)
			: new RootImageResponse(template, { ...satori, format }),
	takumi: (format: Format, component?: boolean) =>
		component
			? new TakumiImageResponse(OG, { ...size, format }, props)
			: new TakumiImageResponse(template, { ...size, format }),
};

// Bump time so we collect plenty of samples for a stable p99; warmup iterations
// absorb the one-time WASM init so it never lands in the measured set. Cold
// (fresh process) numbers come from benchmarks/cold.mjs.
const cfg = { time: Number(process.env.BENCH_TIME ?? 5000), warmupIterations: 3 };

// One group per case: Vitest's "Nx faster than" summary across engines isn't the
// point. Cross-version comparison is — use `pnpm bench:compare`.
for (const [engine, render] of Object.entries(engines)) {
	describe(`warm ${engine}: html → png`, () => {
		bench(
			"html → png",
			() =>
				render("png")
					.arrayBuffer()
					.then(() => {}),
			cfg
		);
	});
	describe(`warm ${engine}: svelte → png`, () => {
		bench(
			"svelte → png",
			() =>
				render("png", true)
					.arrayBuffer()
					.then(() => {}),
			cfg
		);
	});
	describe(`warm ${engine}: html → svg`, () => {
		bench(
			"html → svg",
			() =>
				render("svg")
					.arrayBuffer()
					.then(() => {}),
			cfg
		);
	});
}
