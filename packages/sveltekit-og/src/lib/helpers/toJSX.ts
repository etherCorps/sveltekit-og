import type { Component } from "svelte";
import { html } from "satori-html";
import type { ComponentOptions, VNode } from "$lib/types.js";
import { handleSync, ErrorCodes } from "./error-handler.js";
import { renderComponentToHtml } from "./to-html.js";

export function createVNode(
	element: string | Component<any>,
	componentOptions?: ComponentOptions
): VNode {
	return handleSync(
		() => {
			if (typeof element === "string") return html(element.replaceAll("\n", "").trim());
			const { body, head } = renderComponentToHtml(element, componentOptions?.props);
			// satori's CSS value parsers (e.g. linear-gradient) reject any line break or tab
			// inside a value, and `css="injected"` emits the component's <style> verbatim into
			// head — collapse its whitespace. The body gets the same treatment as HTML strings.
			return html(body.replaceAll("\n", "") + head.replace(/\s+/g, " "));
		},
		ErrorCodes.VNODE_CREATION_FAILED,
		"Failed to create VNode"
	);
}
