import type { Resvg } from "@resvg/resvg-wasm";
import type _satori from "satori";
import { isEdgeLight, isWorkerd } from "std-env";
import { logger } from "../helpers/logger.js";

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
	const isWorkerLikeRuntime = isEdgeLight || isWorkerd
	logger.info(`Detected runtime: ${isWorkerLikeRuntime ? "Edge Light or Workerd" : "Node.js"}`);
	const moduleImport = isWorkerLikeRuntime ? import(`./resvg/edge.js`) : import("./resvg/node.js");
	resvgInstance.instance = await moduleImport.then((m) => m.default);
	await resvgInstance.instance!.initWasmPromise;
	return resvgInstance.instance!.Resvg;
}

export async function useSatori() {
	if (satoriInstance.instance) {
		return satoriInstance.instance.satori;
	}
	logger.debug("Initializing Satori WASM");
	satoriInstance.instance = await import(`./satori/node.js`).then((m) => m.default);
	await satoriInstance.instance!.initWasmPromise;
	return satoriInstance.instance!.satori;
}
