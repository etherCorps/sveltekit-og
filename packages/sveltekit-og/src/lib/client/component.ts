import { mount, unmount, flushSync, type Component } from "svelte";

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
 * Loaded lazily by render.js, only on the main thread and only when a component is
 * passed — string-only users and workers never ship this (or Svelte's mount runtime).
 *
 * ponytail: captures innerHTML only — inline styles come through, but scoped /
 * `css="injected"` styles won't (they're separate nodes an engine ignores). Use
 * inline styles (or the `stylesheets`/tailwind options) for client component rendering.
 */
export function componentToHtml(component: Component<any>, props: Record<string, unknown>): string {
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
