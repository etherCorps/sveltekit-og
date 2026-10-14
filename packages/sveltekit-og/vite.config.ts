import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import { visualizer } from "rollup-plugin-visualizer";
import { sveltekitOG } from "./src/lib/plugin.js";

export default defineConfig({
	plugins: [
		sveltekit(),
		sveltekitOG(),
		visualizer({
			emitFile: true,
			open: true,
			filename: "stats.html",
		}),
	],
	build: {
		rollupOptions: {
			external: [/.+\.wasm$/i, /.+\.ttf$/i, /.+\.woff$/i],
		},
	},
	// the client entry code-splits (lazy engines); Vite's default iife workers can't,
	// so any worker importing /client needs es format — consumers must set this too
	worker: { format: "es" },
	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"],
	},
});
