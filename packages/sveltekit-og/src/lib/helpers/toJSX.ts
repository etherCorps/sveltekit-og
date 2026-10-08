import type { Component } from "svelte";
import { html } from "satori-html";
import type { ComponentOptions, VNode } from "$lib/types.js";
import { handleSync, ErrorCodes } from "./error-handler.js";
import { renderComponentToHtml } from "./to-html.js";

// satori-html gives every empty element `children: []`, and satori treats any array of
// children on a non-flex <div> as "more than one child node" — so an empty <div> (a dot,
// a divider) threw. Drop empty children so an empty element is empty.
function dropEmptyChildren(node: VNode): VNode {
	const children = node.props?.children;
	if (Array.isArray(children)) {
		if (children.length === 0) delete node.props.children;
		else node.props.children = children.map((c) => (typeof c === "string" ? c : dropEmptyChildren(c)));
	} else if (children && typeof children === "object") {
		dropEmptyChildren(children);
	}
	return node;
}

export function createVNode(
	element: string | Component<any>,
	componentOptions?: ComponentOptions
): VNode {
	return handleSync(
		() => {
			if (typeof element === "string") return dropEmptyChildren(html(element.replaceAll("\n", "").trim()));
			const { body, head } = renderComponentToHtml(element, componentOptions?.props);
			// satori's CSS value parsers (e.g. linear-gradient) reject any line break or tab
			// inside a value, and `css="injected"` emits the component's <style> verbatim into
			// head — collapse its whitespace. The body gets the same treatment as HTML strings.
			return dropEmptyChildren(html(body.replaceAll("\n", "") + head.replace(/\s+/g, " ")));
		},
		ErrorCodes.VNODE_CREATION_FAILED,
		"Failed to create VNode"
	);
}
