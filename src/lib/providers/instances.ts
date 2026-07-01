import type { Resvg } from "@resvg/resvg-wasm";
import type _satori from "satori";
import { isEdgeLight, isWorkerd } from "std-env";
import { createLogger } from "../helpers/logger.js";
import { handleAsync, ErrorCodes } from "../helpers/error-handler.js";

// we keep instances alive to avoid re-importing them on every request, maybe not needed but
// also helps with type inference
// Code from vue-og-images
const resvgInstance: { instance?: { initWasmPromise: Promise<void>; Resvg: typeof Resvg } } = {
	instance: undefined,
};
const satoriInstance: { instance?: { initWasmPromise: Promise<void>; satori: typeof _satori } } = {
	instance: undefined,
};

export async function useResvg(debug = false) {
	const log = createLogger(debug);
	if (resvgInstance.instance) {
		return resvgInstance.instance.Resvg;
	}

	log.debug("Initializing ReSVG WASM");
	const isWorkerLikeRuntime = isEdgeLight || isWorkerd;
	log.info(`Detected runtime: ${isWorkerLikeRuntime ? "Edge Light or Workerd" : "Node.js"}`);

	// workers take a precompiled `?module`; node takes raw wasm bytes. keep both
	// as direct import() expressions so the bundler can emit the wasm chunk.
	const moduleImport = isWorkerLikeRuntime
		? import("./resvg/edge.js")
		: import("./resvg/node.js");

	resvgInstance.instance = await handleAsync(
		() => moduleImport.then((m) => m.default),
		ErrorCodes.RESVG_INIT_FAILED,
		"Failed to import ReSVG module"
	);

	await handleAsync(
		() => resvgInstance.instance!.initWasmPromise,
		ErrorCodes.RESVG_INIT_FAILED,
		"Failed to initialize ReSVG WASM"
	);

	return resvgInstance.instance!.Resvg;
}

export async function useSatori(debug = false) {
	const log = createLogger(debug);
	if (satoriInstance.instance) {
		return satoriInstance.instance.satori;
	}

	log.debug("Initializing Satori");
	const isWorkerLikeRuntime = isEdgeLight || isWorkerd;
	log.info(`Detected runtime: ${isWorkerLikeRuntime ? "Edge Light or Workerd" : "Node.js"}`);

	const moduleImport = isWorkerLikeRuntime
		? import("./satori/edge.js")
		: import("./satori/node.js");

	satoriInstance.instance = await handleAsync(
		() => moduleImport.then((m) => m.default),
		ErrorCodes.SATORI_INIT_FAILED,
		"Failed to import Satori module"
	);

	await handleAsync(
		() => satoriInstance.instance!.initWasmPromise,
		ErrorCodes.SATORI_INIT_FAILED,
		"Failed to initialize Satori WASM"
	);

	return satoriInstance.instance!.satori;
}
