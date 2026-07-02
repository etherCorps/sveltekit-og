// Shared demo templates. Each image documents which route produced it:
// provider, output format, whether it was pre-rendered or rendered per-request,
// and a timestamp (build time for pre-rendered routes, request time otherwise).

export type TemplateData = {
	provider: string;
	format: string;
	mode: 'Prerendered' | 'Runtime';
	timestamp: string;
};

// Satori understands Tailwind through `class` (satori-html maps recognised
// utilities for us), so the Satori-backed routes (PNG via resvg, and SVG)
// share this one.
export function satoriTemplate({ provider, format, mode, timestamp }: TemplateData): string {
	return `
	<div class="flex h-full w-full flex-col items-center justify-center bg-gray-900">
		<div class="flex flex-col items-center rounded-2xl bg-gray-800 px-20 py-14">
			<div class="text-3xl font-semibold text-indigo-400">@ethercorps/sveltekit-og</div>
			<div class="mt-3 text-7xl font-bold text-white">Open Graph Images</div>
			<div class="mt-8 flex items-center">
				<div class="flex rounded-full bg-indigo-600 px-5 py-2 text-2xl font-medium text-white">${provider}</div>
				<div class="flex ml-3 rounded-full bg-gray-700 px-5 py-2 text-2xl font-medium text-gray-200">${format}</div>
				<div class="flex ml-3 rounded-full bg-gray-700 px-5 py-2 text-2xl font-medium text-gray-200">${mode}</div>
			</div>
			<div class="mt-6 text-xl text-gray-400">${timestamp}</div>
		</div>
	</div>`;
}

// Takumi reads inline `style` and ships a built-in font, so no font setup is
// needed. Inline styles keep this bulletproof across every runtime.
export function takumiTemplate({ provider, format, mode, timestamp }: TemplateData): string {
	return `
	<div style="display:flex;height:100%;width:100%;flex-direction:column;align-items:center;justify-content:center;background:#111827">
		<div style="display:flex;flex-direction:column;align-items:center;border-radius:24px;background:#1f2937;padding:56px 80px">
			<div style="font-size:30px;font-weight:600;color:#818cf8">@ethercorps/sveltekit-og</div>
			<div style="font-size:72px;font-weight:700;color:#ffffff;margin-top:12px">Open Graph Images</div>
			<div style="display:flex;align-items:center;margin-top:32px">
				<div style="display:flex;border-radius:9999px;background:#4f46e5;padding:8px 20px;font-size:24px;font-weight:500;color:#ffffff">${provider}</div>
				<div style="display:flex;border-radius:9999px;background:#374151;padding:8px 20px;font-size:24px;font-weight:500;color:#e5e7eb;margin-left:12px">${format}</div>
				<div style="display:flex;border-radius:9999px;background:#374151;padding:8px 20px;font-size:24px;font-weight:500;color:#e5e7eb;margin-left:12px">${mode}</div>
			</div>
			<div style="font-size:20px;color:#9ca3af;margin-top:24px">${timestamp}</div>
		</div>
	</div>`;
}
