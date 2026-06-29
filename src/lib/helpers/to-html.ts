import type { Component } from "svelte";
import { render } from "svelte/server";
import { handleSync, ErrorCodes } from "./error-handler.js";

/**
 * Renders a Svelte component to its server-side HTML parts.
 *
 * Shared by both rendering engines: the satori path feeds `body + head` into
 * `satori-html`, while the takumi path passes an HTML string to its renderer.
 * Components that need their styles inlined should use
 * `<svelte:options css="injected" />` so the CSS lands in `head`.
 */
export function renderComponentToHtml(
	component: Component<any>,
	props: Record<string, unknown> = {}
): { head: string; body: string } {
	return handleSync(
		() => render(component, { props }),
		ErrorCodes.VNODE_CREATION_FAILED,
		"Failed to render Svelte component to HTML"
	);
}
