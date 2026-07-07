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
			return html(body + head);
		},
		ErrorCodes.VNODE_CREATION_FAILED,
		"Failed to create VNode"
	);
}
