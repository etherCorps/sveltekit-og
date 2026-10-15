import type { Engine } from "./types.js";

/** npm packages each engine needs; all optional peers the app installs itself. */
export const ENGINE_PACKAGES: Record<Engine, readonly string[]> = {
	takumi: ["takumi-js"],
	satori: ["satori", "@resvg/resvg-wasm"],
};

export const installMessage = (engine: Engine) =>
	`Engine "${engine}" is not installed. Run: pnpm add ${ENGINE_PACKAGES[engine].join(" ")}`;

/**
 * Package-resolution failures across runtimes and bundlers: Node/Bun set a code,
 * Vite dev and Deno only have a message, and loaders often wrap the original as
 * `cause`. Anything else (syntax error, network) is not an install problem and
 * must surface as-is.
 */
export function isModuleNotFound(error: unknown): boolean {
	const e = error as { code?: string; message?: string; cause?: unknown } | null;
	if (!e || typeof e !== "object") return false;
	if (e.code === "ERR_MODULE_NOT_FOUND" || e.code === "MODULE_NOT_FOUND") return true;
	if (/cannot find (module|package)|module not found|failed to resolve/i.test(e.message ?? ""))
		return true;
	return isModuleNotFound(e.cause);
}
