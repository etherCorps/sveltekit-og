import type { Component } from "svelte";
import { createImage } from "$lib/client/index.js";

// Dev-only worker for the manual checklist. Components can't cross postMessage and
// Vite's worker sub-build has no Svelte plugin, so stand in with a non-string element:
// the guard only checks `typeof element === "string"` and must reject it with
// COMPONENT_IN_WORKER before anything is mounted or downloaded.
const FakeCard = (() => {}) as unknown as Component<{ title: string }>;
type Req = { id: number; engine: "takumi" | "satori"; kind: "html" | "component" };
type Res = { id: number; ok: true; bytes: ArrayBuffer } | { id: number; ok: false; code: string; message: string };

const html = `<div style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;background:#0f172a;color:#f8fafc;font-size:56px">Rendered in a worker</div>`;

// the project's TS lib is DOM, where `self.postMessage` has the window signature;
// narrow to the worker shape instead of pulling in the conflicting `webworker` lib.
const ctx = self as unknown as {
	onmessage: ((e: MessageEvent<Req>) => void) | null;
	postMessage(message: Res, transfer?: Transferable[]): void;
};

ctx.onmessage = async (e: MessageEvent<Req>) => {
	const { id, engine, kind } = e.data;
	try {
		const res =
			kind === "html"
				? createImage(html, { engine, width: 800, height: 400, format: "png" })
				: createImage(FakeCard, { engine, width: 800, height: 400, format: "png" }, { title: "Card" });
		const bytes = await res.arrayBuffer();
		const out: Res = { id, ok: true, bytes };
		ctx.postMessage(out, [bytes]);
	} catch (err) {
		const { code = "UNKNOWN", message = String(err) } = (err ?? {}) as { code?: string; message?: string };
		const out: Res = { id, ok: false, code, message };
		ctx.postMessage(out);
	}
};
