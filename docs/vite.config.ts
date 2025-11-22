import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';

const __dirname = new URL(".", import.meta.url).pathname;

export default defineConfig({
	plugins: [sveltekit(), tailwindcss(), sveltekitOG()],
	server: {
		fs: {
			allow: [resolve(__dirname, "./.velite")],
		},
	},
});
