import type { Component } from "svelte";
import { render } from "svelte/server";
import { handleSync, ErrorCodes } from "./error-handler.js";

/**
 * Render a Svelte component to its SSR html parts. Shared by both engines — satori
 * feeds body+head to satori-html, takumi passes the html string straight in. Use
 * `<svelte:options css="injected" />` to get component styles into `head`.
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
