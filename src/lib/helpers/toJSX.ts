import type { Component } from "svelte";
import { render } from "svelte/server";
import { html } from "satori-html";
import type { ComponentOptions, VNode } from "$lib/types.js";

function svelteComponentToHTML(component: Component<any>, props: Record<string, any> = {}) {
	const { body, head } = render(component, { props });
	return html(body + head);
}

export function createVNode(
	element: string | Component,
	componentOptions?: ComponentOptions
): VNode {
	return typeof element === "string"
		? html(element.replaceAll("\n", "").trim())
		: svelteComponentToHTML(element, componentOptions?.props);
}
