import type { Resvg } from "@resvg/resvg-wasm";
import type _satori from "satori";
import { isEdgeLight, isWorkerd } from "std-env";
import { logger } from "../helpers/logger.js";
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

export async function useResvg() {
	if (resvgInstance.instance) {
		return resvgInstance.instance.Resvg;
	}
	logger.debug("Initializing Resvg WASM");
	const isWorkerLikeRuntime = isEdgeLight || isWorkerd;
	logger.info(`Detected runtime: ${isWorkerLikeRuntime ? "Edge Light or Workerd" : "Node.js"}`);

	const moduleImport = await handleAsync(
		async () => {
			if (isWorkerLikeRuntime) {
				return import("./resvg/edge.js");
			}
			return import("./resvg/node.js");
		},
		ErrorCodes.RESVG_INIT_FAILED,
		"Failed to import ReSVG module"
	);

	resvgInstance.instance = await handleAsync(
		async () => {
			const mod = await moduleImport;
			return mod.default;
		},
		ErrorCodes.RESVG_INIT_FAILED,
		"Failed to load ReSVG default export"
	);

	await handleAsync(
		async () => resvgInstance.instance!.initWasmPromise,
		ErrorCodes.RESVG_INIT_FAILED,
		"Failed to initialize ReSVG WASM"
	);

	return resvgInstance.instance!.Resvg;
}

export async function useSatori() {
	if (satoriInstance.instance) {
		return satoriInstance.instance.satori;
	}
	logger.debug("Initializing Satori WASM");

	satoriInstance.instance = await handleAsync(
		async () => {
			const mod = await import("./satori/node.js");
			return mod.default;
		},
		ErrorCodes.SATORI_INIT_FAILED,
		"Failed to load Satori module"
	);

	await handleAsync(
		async () => satoriInstance.instance!.initWasmPromise,
		ErrorCodes.SATORI_INIT_FAILED,
		"Failed to initialize Satori WASM"
	);

	return satoriInstance.instance!.satori;
}
