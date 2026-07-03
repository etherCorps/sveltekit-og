import type { Resvg } from "@resvg/resvg-wasm";
import type _satori from "satori";
import { isEdgeLight, isWorkerd } from "std-env";
import { createLogger } from "../helpers/logger.js";
import { handleAsync, ErrorCodes } from "../helpers/error-handler.js";

// we keep instances alive to avoid re-importing them on every request, maybe not needed but
// also helps with type inference
// Code from vue-og-images
type WasmModule = { initWasmPromise: Promise<void> };

/**
 * Lazy singleton around a node/edge wasm module pair. The edge/node choice is
 * made per-runtime via std-env; both sides stay direct import() expressions so
 * the bundler can emit the wasm chunk. Memoizes the init promise (like
 * takumi/renderer.ts) so concurrent first requests share one init, and clears
 * it on rejection so a failed init can be retried.
 */
function createProvider<T extends WasmModule>(
	label: string,
	errorCode: string,
	imports: { edge: () => Promise<{ default: T }>; node: () => Promise<{ default: T }> }
) {
	let instancePromise: Promise<T> | undefined;

	const init = async (debug: boolean): Promise<T> => {
		const log = createLogger(debug);
		log.debug(`Initializing ${label}`);
		const isWorkerLikeRuntime = isEdgeLight || isWorkerd;
		log.info(`Detected runtime: ${isWorkerLikeRuntime ? "Edge Light or Workerd" : "Node.js"}`);

		const moduleImport = isWorkerLikeRuntime ? imports.edge() : imports.node();

		const loaded = await handleAsync(
			() => moduleImport.then((m) => m.default),
			errorCode,
			`Failed to import ${label} module`
		);

		await handleAsync(
			() => loaded.initWasmPromise,
			errorCode,
			`Failed to initialize ${label} WASM`
		);

		return loaded;
	};

	return (debug = false): Promise<T> => {
		instancePromise ??= init(debug).catch((error) => {
			instancePromise = undefined;
			throw error;
		});
		return instancePromise;
	};
}

const useResvgModule = createProvider<WasmModule & { Resvg: typeof Resvg }>(
	"ReSVG",
	ErrorCodes.RESVG_INIT_FAILED,
	{
		// workers take a precompiled `?module`; node takes raw wasm bytes
		edge: () => import("./resvg/edge.js"),
		node: () => import("./resvg/node.js"),
	}
);

const useSatoriModule = createProvider<WasmModule & { satori: typeof _satori }>(
	"Satori",
	ErrorCodes.SATORI_INIT_FAILED,
	{
		edge: () => import("./satori/edge.js"),
		node: () => import("./satori/node.js"),
	}
);

export async function useResvg(debug = false) {
	return (await useResvgModule(debug)).Resvg;
}

export async function useSatori(debug = false) {
	return (await useSatoriModule(debug)).satori;
}
