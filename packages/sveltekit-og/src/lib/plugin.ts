import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { unwasm, type UnwasmPluginOptions } from "unwasm/plugin";
import type { Plugin as VitePlugin } from "vite";
import type { Engine } from "./core/types.js";
import { ENGINE_PACKAGES } from "./core/packages.js";

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
 * Wires the wasm loader into the SSR bundle only. The client build (e.g. the /client
 * entry) loads its wasm through Vite's own asset handling, and unwasm would break that.
 *
 * Gated at runtime rather than by Vite version: `import { version } from "vite"`
 * resolves to this package's own copy of vite, not the consumer's.
 * - Vite 6+: `applyToEnvironment` keeps the plugin off the client environment.
 * - Vite 5: each hook no-ops unless the call carries `{ ssr: true }`.
 * `apply: "build"` keeps parity with the previous `build.rollupOptions.plugins` wiring.
 */
function wasmPlugin(options?: UnwasmPluginOptions): VitePlugin {
	const wasm = rollupWasm(options) as unknown as VitePlugin & {
		resolveId?: ObjectHook;
		load?: ObjectHook;
		transform?: ObjectHook;
	};
	// `applyToEnvironment` is typed by Vite 6+ (this package compiles against Vite 8);
	// Vite 5 ignores the unknown key and relies on the serverOnly gates instead.
	return {
		...wasm,
		name: "vite-plugin-sveltekit-og",
		apply: "build",
		applyToEnvironment: (env) => env.config.consumer === "server",
		resolveId: serverOnly(wasm.resolveId),
		load: serverOnly(wasm.load),
		transform: serverOnly(wasm.transform),
	};
}

/** The package's modules that statically import an engine's packages. */
const ENGINE_MODULES: Record<Engine, RegExp> = {
	takumi: /\/core\/engines\/takumi\.[jt]s$/,
	satori: /\/(core\/engines\/satori|client\/satori-wasm|providers\/instances)\.[jt]s$/,
};

export const STUB_PREFIX = "\0sveltekit-og:missing-engine:";

/**
 * Which engines are NOT installed, judged the way the bundler will judge it: an
 * engine's packages are resolved from this package's own location (pnpm links the
 * app's optional peers beside the package; npm/yarn hoist them above it). Walks the
 * `node_modules` ancestors by hand so NODE_PATH, which `pnpm run` sets to the virtual
 * store, can't claim a package the bundler won't find.
 */
export function missingEngines(from = dirname(fileURLToPath(import.meta.url))): Engine[] {
	const installed = (pkg: string) => {
		for (let dir = from; ; dir = dirname(dir)) {
			if (existsSync(join(dir, "node_modules", pkg, "package.json"))) return true;
			if (dirname(dir) === dir) return false;
		}
	};
	return (Object.keys(ENGINE_PACKAGES) as Engine[]).filter(
		(engine) => !ENGINE_PACKAGES[engine].every(installed)
	);
}

/**
 * Stub for a module of an engine the app hasn't installed. Evaluating it throws the
 * same shape as a missing package would, so core/render.ts turns it into
 * ENGINE_NOT_INSTALLED with the install command — one message, built in one place.
 */
export function stubSource(engine: Engine): string {
	return [
		`const error = new Error(${JSON.stringify(`Engine "${engine}" is not installed`)});`,
		`error.code = "ERR_MODULE_NOT_FOUND";`,
		`throw error;`,
		``,
	].join("\n");
}

/**
 * Engines are optional peers: the app installs the one(s) it uses. Bundlers still
 * resolve every engine's imports because core/render.ts lazy-imports both, so a
 * missing engine's modules are aliased to a throwing stub. Runs on every environment
 * (client and server) and in dev too, so the error is the same everywhere.
 */
function enginesPlugin(engines?: Engine[]): VitePlugin {
	// `engines` is the app's word on what it installed (or wants bundled); otherwise probe
	const missing = engines
		? (Object.keys(ENGINE_PACKAGES) as Engine[]).filter((e) => !engines.includes(e))
		: missingEngines();
	return {
		name: "vite-plugin-sveltekit-og:engines",
		enforce: "pre",
		resolveId(source, importer) {
			if (!importer || missing.length === 0) return null;
			// `enforce: "pre"` sees the raw specifier; resolve it against the importer so the
			// module path is checkable whether it comes from src/, dist/ or a consumer's node_modules
			const id = (
				source.startsWith(".") ? resolve(dirname(importer), source) : source
			).replace(/\\/g, "/");
			const engine = missing.find((e) => ENGINE_MODULES[e].test(id));
			return engine ? STUB_PREFIX + engine : null;
		},
		load(id) {
			return id.startsWith(STUB_PREFIX)
				? stubSource(id.slice(STUB_PREFIX.length) as Engine)
				: null;
		},
	};
}

export interface SveltekitOGOptions extends UnwasmPluginOptions {
	/**
	 * Engines to bundle. Defaults to whichever engine packages are installed; set it
	 * to pin the list (e.g. `["takumi"]` to keep Satori out of the bundle even when
	 * another dependency pulls it in). Calls to an excluded engine reject with
	 * `ENGINE_NOT_INSTALLED`.
	 */
	engines?: Engine[];
}

/** Vite plugin for sveltekit-og: wasm loading for SSR plus optional-engine stubs. */
export function sveltekitOG(options: SveltekitOGOptions = {}): VitePlugin[] {
	const { engines, ...wasm } = options;
	return [wasmPlugin(wasm), enginesPlugin(engines)];
}
