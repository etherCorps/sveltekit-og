import adapter from "@sveltejs/adapter-auto";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import { visualizer } from "rollup-plugin-visualizer";
import { sveltekitOG } from "./src/lib/plugin.js";

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			prerender: {
				handleUnseenRoutes: (details) => {
					console.warn("handleUnseenRoutes", JSON.stringify(details, null, 2));
				},
				handleHttpError: ({ path, message }) => {
					console.log("handleHttpError", path, message);
					// ignore deliberate link to shiny 404 page
					if (path.split("/").length === 2) return;
					if (path.startsWith("/og.png")) return;
					// otherwise fail the build
					throw new Error(message);
				},
				handleMissingId: (details) => {
					console.log("handleMissingId", JSON.stringify(details, null, 2));
				},
			},
		}),
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
