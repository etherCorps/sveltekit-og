import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { ImageResponse } from "$lib/index.js";
import { createSvg } from "$lib/helpers/create.js";
import InjectedStyles from "./routes/(components)/InjectedStyles.svelte";

// local font so the satori path runs offline (no default_fonts fetch)
const fontData = readFileSync(
	new URL("./routes/(components)/SpaceMono-Regular.ttf", import.meta.url)
);
const fonts = [
	{ name: "Space Mono", data: fontData, weight: 400 as const, style: "normal" as const },
];
const html = `<div style="display:flex;width:100%;height:100%">hi</div>`;

describe("satori ImageResponse", () => {
	it("createSvg returns an <svg> string", async () => {
		const svg = await createSvg(html, { width: 200, height: 100, fonts });
		expect(svg).toContain("<svg");
	});

	// regression: satori-html gives every empty element `children: []`, and satori treats any
	// array of children on a non-flex <div> as "more than one child" — so an empty decorative
	// <div> (a dot, a rule) always threw. Empty children must be dropped before satori sees them.
	it("renders an empty non-flex <div> next to text", async () => {
		const dot = `<div style="display:flex;width:100%;height:100%;align-items:center;gap:8px">
  <div style="width:14px;height:14px;border-radius:9999px;background:#f43f5e"></div>
  site.dev
</div>`;
		const svg = await createSvg(dot, { width: 400, height: 100, fonts });
		expect(svg).toContain("<svg");
	});

	// regression: the svg body used to enqueue a raw string and throw on read
	it("svg body is readable bytes", async () => {
		const res = new ImageResponse(html, { format: "svg", width: 200, height: 100, fonts });
		expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
		const text = await res.text();
		expect(text).toContain("<svg");
	});
});

describe("component rendering", () => {
	// satori rejects newlines inside CSS values (e.g. a multi-line linear-gradient) with
	// "object null is not iterable"; the injected <style> must be normalized like strings are
	it("renders a component whose injected <style> spans multiple lines", async () => {
		const svg = await createSvg(InjectedStyles, { width: 400, height: 200, fonts });
		expect(svg).toContain("<svg");
		expect(svg).toContain("linearGradient");
	});
});
