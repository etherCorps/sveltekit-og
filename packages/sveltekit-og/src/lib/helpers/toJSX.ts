import { html } from "satori-html";
import type { VNode } from "../types.js";
import { handleSync, ErrorCodes } from "./error-handler.js";

// satori-html gives every empty element `children: []`, and satori treats any array of
// children on a non-flex <div> as "more than one child node" — so an empty <div> (a dot,
// a divider) threw. Drop empty children so an empty element is empty.
function dropEmptyChildren(node: VNode): VNode {
	const children = node.props?.children;
	if (Array.isArray(children)) {
		if (children.length === 0) delete node.props.children;
		else
			node.props.children = children.map((c) =>
				typeof c === "string" ? c : dropEmptyChildren(c)
			);
	} else if (children && typeof children === "object") {
		dropEmptyChildren(children);
	}
	return node;
}

/** HTML string → the VNode tree both engines take. Components are turned into HTML first
 * by the server/client platform, so this never pulls in svelte/server. */
export function createVNode(markup: string): VNode {
	return handleSync(
		() => dropEmptyChildren(html(markup.replaceAll("\n", "").trim())),
		ErrorCodes.VNODE_CREATION_FAILED,
		"Failed to create VNode"
	);
}
