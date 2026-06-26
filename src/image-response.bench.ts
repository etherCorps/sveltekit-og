import { readFileSync } from "node:fs";
import { bench, describe } from "vitest";

import { ImageResponse } from "$lib/index.js";
import { createPng, createSvg } from "$lib/helpers/create.js";
import type { ImageResponseOptions } from "$lib/types.js";

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

const options: ImageResponseOptions = { width: 1200, height: 630, fonts };

// Bump time so we collect plenty of samples for a stable p99; warmup iterations
// absorb the one-time WASM (yoga/resvg) init so it never lands in the measured set.
const cfg = { time: 5000, warmupIterations: 3 };

// Each bench lives in its own group: ImageResponse uses createPng/createSvg
// internally, so comparing them to each other is meaningless. Separate groups
// keep every number in the log but drop Vitest's "Nx faster than" summary.
// Cross-version comparison is what matters — use `pnpm bench:compare`.

describe("ImageResponse: html → png (full, incl. stream drain)", () => {
	bench(
		"ImageResponse",
		async () => {
			const res = new ImageResponse(template, options);
			await res.arrayBuffer();
		},
		cfg
	);
});

describe("createPng: html → png (satori + resvg)", () => {
	bench(
		"createPng",
		async () => {
			await createPng(template, options);
		},
		cfg
	);
});

describe("createSvg: html → svg (satori only)", () => {
	bench(
		"createSvg",
		async () => {
			await createSvg(template, options);
		},
		cfg
	);
});
