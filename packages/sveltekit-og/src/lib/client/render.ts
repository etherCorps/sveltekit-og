import type { Component } from "svelte";
import { createSatoriImage } from "./satori.js";
import { createTakumiImage } from "../takumi/render.js";
import { ImageResponseError, ErrorCodes } from "../helpers/error-handler.js";
import type { ImageOptions } from "../types.js";
import type { TakumiImageOptions } from "../takumi/types.js";
import type { ClientImageResponseOptions } from "./types.js";

/** Components need the DOM to mount; workers have none. */
const hasDocument = () => typeof document !== "undefined";

async function toHtml(element: string | Component<any>, props?: Record<string, unknown>): Promise<string> {
	if (typeof element === "string") return element;
	if (!hasDocument()) {
		throw new ImageResponseError(
			"Svelte components can't be rendered in a worker (no document). Pass an HTML string instead.",
			ErrorCodes.COMPONENT_IN_WORKER
		);
	}
	// lazy: only main-thread component users download the mounter + Svelte's mount runtime
	const { componentToHtml } = await import("./component.js");
	return componentToHtml(element, props ?? {});
}

/**
 * Dispatch to the chosen engine, both running in the browser/worker. Response-only
 * keys are stripped so they don't leak into the engine options.
 */
export async function createClientImage(
	element: string | Component<any>,
	options: ClientImageResponseOptions,
	props?: Record<string, unknown>
): Promise<Uint8Array | string> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { engine = "takumi", status, statusText, headers, ...imageOptions } = options;

	// components are rendered to HTML here (browser mount), so engines only ever see a string
	const html = await toHtml(element, props);

	if (engine === "satori") {
		return createSatoriImage(html, imageOptions as ImageOptions);
	}

	return createTakumiImage(html, imageOptions as TakumiImageOptions);
}
