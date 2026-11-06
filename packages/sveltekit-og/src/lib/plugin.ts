import { createRequire } from "node:module";
import { dirname } from "node:path";
import { unwasm, type UnwasmPluginOptions } from "unwasm/plugin";
import type { Plugin as VitePlugin } from "vite";

type Plugin = ReturnType<typeof unwasm>;

export function rollupWasm(options?: UnwasmPluginOptions): Plugin {
	return unwasm({
		esmImport: true,
		lazy: true,
		...options,
	});
}

/** Rollup object-form hook: `{ order?, filter?, handler }`. */
type ObjectHook = { handler: (this: HookContext, ...args: unknown[]) => unknown };
type HookContext = { environment?: { config: { consumer: string } } };

/**
 * Is this hook call for the server bundle? Vite 6+ (SvelteKit 3 builds through the
 * Environment API) exposes `this.environment`; Vite 5 (SvelteKit 2 runs separate
 * client and SSR builds) passes `{ ssr }` as the hook's last argument instead.
 */
function isServer(ctx: HookContext, args: unknown[]): boolean {
	if (ctx.environment) return ctx.environment.config.consumer === "server";
	const last = args[args.length - 1];
	return typeof last === "object" && last !== null && (last as { ssr?: boolean }).ssr === true;
}

function serverOnly<T extends ObjectHook | undefined>(hook: T): T {
	if (!hook) return hook;
	return {
		...hook,
		handler(this: HookContext, ...args: unknown[]) {
			return isServer(this, args) ? hook.handler.apply(this, args) : null;
		},
	} as T;
}

/**
 * Vite plugin: wires the wasm loader into the SSR bundle only. The client build
 * (e.g. the /client entry) loads its wasm through Vite's own asset handling, and
 * unwasm would break that.
 *
 * Gated at runtime rather than by Vite version: `import { version } from "vite"`
 * resolves to this package's own copy of vite, not the consumer's.
 * - Vite 6+: `applyToEnvironment` keeps the plugin off the client environment.
 * - Vite 5: each hook no-ops unless the call carries `{ ssr: true }`.
 * `apply: "build"` keeps parity with the previous `build.rollupOptions.plugins` wiring.
 */
export function sveltekitOG(options?: UnwasmPluginOptions): VitePlugin[] {
	return [wasmPlugin(options), harfbuzz()];
}

function wasmPlugin(options?: UnwasmPluginOptions): VitePlugin {
	const wasm = rollupWasm(options) as unknown as VitePlugin & {
		resolveId?: ObjectHook;
		load?: ObjectHook;
		transform?: ObjectHook;
	};
	// `applyToEnvironment` only exists in Vite 6+ types; this package compiles against Vite 5.
	const plugin: VitePlugin & {
		applyToEnvironment?: (env: { config: { consumer: string } }) => boolean;
	} = {
		...wasm,
		name: "vite-plugin-sveltekit-og",
		apply: "build",
		applyToEnvironment: (env: { config: { consumer: string } }) =>
			env.config.consumer === "server",
		resolveId: serverOnly(wasm.resolveId),
		load: serverOnly(wasm.load),
		transform: serverOnly(wasm.transform),
	} as VitePlugin;
	return plugin;
}

const HB_ID = "\0sveltekit-og:harfbuzz";

// emscripten env sniffing in hb.js: with every flag false it touches no fs/__dirname/
// self.location and loads nothing itself; instantiateWasm hands it the wasm instead.
const HB_JS_PATCHES: [string, string][] = [
	['ENVIRONMENT_IS_WEB=typeof window=="object"', "ENVIRONMENT_IS_WEB=false"],
	['ENVIRONMENT_IS_WORKER=typeof WorkerGlobalScope!="undefined"', "ENVIRONMENT_IS_WORKER=false"],
	[
		'ENVIRONMENT_IS_NODE=typeof process=="object"&&process.versions?.node&&process.type!="renderer"',
		"ENVIRONMENT_IS_NODE=false",
	],
	['require("fs")', "null"],
	['typeof exports==="object"&&typeof module==="object"', "false"],
];
const HBJS_PATCHES: [string, string][] = [["module.exports = hbjs;", ""]];

/** harfbuzzjs as resolved by our own satori; undefined when satori doesn't use it. */
function harfbuzzPackage(): { dir: string; version: string } | undefined {
	try {
		const fromSatori = createRequire(
			createRequire(import.meta.url).resolve("satori/package.json")
		);
		const pkg = fromSatori.resolve("harfbuzzjs/package.json");
		return { dir: dirname(pkg).replace(/\\/g, "/"), version: fromSatori(pkg).version };
	} catch {
		return undefined;
	}
}

/** CJS → ESM plus the patches above; throws if harfbuzzjs changed under us. */
function patchHarfbuzz(code: string, path: string, patches: [string, string][], name: string) {
	for (const [from, to] of patches) {
		if (!code.includes(from))
			throw new Error(
				`[sveltekit-og] can't patch ${path} (missing ${JSON.stringify(from)}); please report this`
			);
		code = code.replace(from, to);
	}
	return { code: `${code}\nexport default ${name};\n`, map: null };
}

/**
 * satori >=0.33 shapes text with `harfbuzzjs`, whose emscripten loader reads fs/__dirname
 * and fetches hb.wasm from beside itself. None of that survives bundling: ESM server chunks
 * have no __dirname, the browser 404s on /hb.wasm, workers can't compile wasm at runtime.
 * Swap the import for a module that hands emscripten the wasm via `instantiateWasm`:
 * - server build: workers/edge get unwasm's precompiled `?module`; node/bun/deno read the
 *   bytes from the installed package, else unpkg (same fallback as providers/resvg/node.js)
 * - client (build + dev): a Vite `?url` asset, like the client engine's yoga.wasm
 */
function harfbuzz(worker = false): VitePlugin {
	const hb = harfbuzzPackage();
	let build = false;
	const file = (name: string) => JSON.stringify(`${hb?.dir}/${name}`);
	const loaders = {
		server: `
async function loadWasm() {
	// same check as std-env's isWorkerd / isEdgeLight (providers/instances.ts)
	if (globalThis.navigator?.userAgent === "Cloudflare-Workers" || typeof EdgeRuntime === "string") {
		const m = await import(${file("hb.wasm?module")});
		return m.default ?? m;
	}
	try {
		const { createRequire } = await import("node:module");
		const { readFile } = await import("node:fs/promises");
		let require = createRequire(import.meta.url);
		for (const pkg of ["@ethercorps/sveltekit-og", "satori"]) require = createRequire(require.resolve(pkg + "/package.json"));
		return await readFile(require.resolve("harfbuzzjs/hb.wasm"));
	} catch {
		return (await fetch("https://unpkg.com/harfbuzzjs@${hb?.version}/hb.wasm")).arrayBuffer();
	}
}`,
		client: `
import url from ${file("hb.wasm?url")};
const loadWasm = () => fetch(new URL(url, import.meta.url)).then((r) => r.arrayBuffer());`,
	};

	return {
		name: "vite-plugin-sveltekit-og:harfbuzz",
		enforce: "pre",
		config(config) {
			if (!hb || worker) return;
			const userWorkerPlugins = config.worker?.plugins;
			return {
				// dev: keep harfbuzzjs out of satori's prebundle so the import reaches resolveId
				optimizeDeps: { exclude: ["harfbuzzjs"] },
				// Vite bundles web workers with worker.plugins, not this plugin list
				worker: { plugins: () => [...(userWorkerPlugins?.() ?? []), harfbuzz(true)] },
			};
		},
		configResolved(config) {
			build = config.command === "build";
		},
		resolveId(id, _importer, opts) {
			if (!hb || id !== "harfbuzzjs") return null;
			const server = isServer(this as unknown as HookContext, [opts]);
			// dev SSR loads satori from node_modules, where the stock loader works
			if (server && !build) return null;
			return `${HB_ID}:${server ? "server" : "client"}`;
		},
		load(id) {
			if (!id.startsWith(HB_ID)) return null;
			return `import createHarfBuzz from ${file("hb.js")};
import hbjs from ${file("hbjs.js")};
${id.endsWith(":server") ? loaders.server : loaders.client}
const harfbuzz = loadWasm().then((wasm) => new Promise((resolve, reject) => {
	createHarfBuzz({
		instantiateWasm(imports, done) {
			WebAssembly.instantiate(wasm, imports).then((r) => done(r.instance ?? r), reject);
			return {};
		},
	}).then((module) => resolve(hbjs(module)), reject);
}));
// created at import, awaited only on the first render: don't let an early failure
// crash node as an unhandled rejection (satori's own await still sees it)
harfbuzz.catch(() => {});
export default harfbuzz;
`;
		},
		transform(code, id) {
			if (!hb) return null;
			const path = id.split("?")[0].replace(/\\/g, "/");
			if (path === `${hb.dir}/hb.js`)
				return patchHarfbuzz(code, path, HB_JS_PATCHES, "createHarfBuzz");
			if (path === `${hb.dir}/hbjs.js`)
				return patchHarfbuzz(code, path, HBJS_PATCHES, "hbjs");
			return null;
		},
	};
}
