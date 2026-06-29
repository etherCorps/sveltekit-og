import type { Component } from "svelte";
import { html } from "satori-html";
import type { ComponentOptions, VNode } from "$lib/types.js";
import { handleSync, ErrorCodes } from "./error-handler.js";
import { renderComponentToHtml } from "./to-html.js";

function svelteComponentToHTML(component: Component<any>, props: Record<string, any> = {}) {
	return handleSync(
		() => {
			const { body, head } = renderComponentToHtml(component, props);
			return html(body + head);
		},
		ErrorCodes.VNODE_CREATION_FAILED,
		"Failed to render Svelte component to HTML"
	);
}

export function createVNode(
	element: string | Component,
	componentOptions?: ComponentOptions
): VNode {
	return handleSync(
		() =>
			typeof element === "string"
				? html(element.replaceAll("\n", "").trim())
				: svelteComponentToHTML(element, componentOptions?.props),
		ErrorCodes.VNODE_CREATION_FAILED,
		"Failed to create VNode"
	);
}
