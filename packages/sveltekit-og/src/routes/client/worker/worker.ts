import { createImage } from "$lib/client/index.js";
import Card from "../Card.svelte";

// Dev-only worker for the manual checklist. Components can't cross postMessage, so
// the worker imports Card itself and passes it when asked — that path must fail with
// COMPONENT_IN_WORKER.
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
				: createImage(Card, { engine, width: 800, height: 400, format: "png" }, { title: "Card", subtitle: "in a worker", num1: 1, num2: 2 });
		const bytes = await res.arrayBuffer();
		const out: Res = { id, ok: true, bytes };
		ctx.postMessage(out, [bytes]);
	} catch (err) {
		const { code = "UNKNOWN", message = String(err) } = (err ?? {}) as { code?: string; message?: string };
		const out: Res = { id, ok: false, code, message };
		ctx.postMessage(out);
	}
};
