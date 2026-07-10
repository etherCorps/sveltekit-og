import { mount, unmount, flushSync, type Component } from "svelte";
import { createSatoriImage } from "./satori.js";
import { createTakumiImage } from "../takumi/render.js";
import type { ImageOptions } from "../types.js";
import type { TakumiImageOptions } from "../takumi/types.js";
import type { ClientImageResponseOptions } from "./types.js";

/**
 * Render a Svelte component to an HTML string in the browser. The server path uses
 * `svelte/server`'s `render`, which isn't reliable client-side, so here we mount the
 * component instead.
 *
 * Mounted inside a detached shadow root: the host is never added to the document, so
 * page CSS can't cascade into the component (nothing from the page leaks into the
 * rendered image), and the component's own scoped styles stay in the shadow root
 * instead of piling up in the page's <head> on every render.
 *
 * ponytail: captures innerHTML only — inline styles come through, but scoped /
 * `css="injected"` styles won't (they're separate nodes an engine ignores). Use
 * inline styles (or the `stylesheets`/tailwind options) for client component rendering.
 */
function componentToHtml(component: Component<any>, props: Record<string, unknown>): string {
	const host = document.createElement("div");
	const shadow = host.attachShadow({ mode: "open" });
	const target = document.createElement("div");
	shadow.appendChild(target);
	const instance = mount(component, { target, props });
	try {
		flushSync();
		return target.innerHTML;
	} finally {
		unmount(instance);
	}
}

/**
 * Dispatch to the chosen engine, both running in the browser/worker: Takumi via
 * @takumi-rs/wasm's bundler conditions, Satori/ReSVG via the client wasm providers
 * (client/providers.js). Response-only keys are stripped so they don't leak into
 * the engine options.
 */
export function createClientImage(
	element: string | Component<any>,
	options: ClientImageResponseOptions,
	props?: Record<string, unknown>
): Promise<Uint8Array | string> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { engine = "takumi", status, statusText, headers, ...imageOptions } = options;

	// components are rendered to HTML here (browser mount), so engines only ever see a string
	const html = typeof element === "string" ? element : componentToHtml(element, props ?? {});

	if (engine === "satori") {
		return createSatoriImage(html, imageOptions as ImageOptions);
	}

	return createTakumiImage(html, imageOptions as TakumiImageOptions);
}
