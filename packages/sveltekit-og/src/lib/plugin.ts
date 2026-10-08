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
export function sveltekitOG(options?: UnwasmPluginOptions): VitePlugin {
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
		applyToEnvironment: (env: { config: { consumer: string } }) => env.config.consumer === "server",
		resolveId: serverOnly(wasm.resolveId),
		load: serverOnly(wasm.load),
		transform: serverOnly(wasm.transform),
	} as VitePlugin;
	return plugin;
}
