// Playground templates. Each is the OG *content* — inline styles (or a `tw` attribute)
// only, because both engines read them and the client component path captures inline
// styles alone. Keep every template to one accent on a plain surface; the point is the
// API, not the art.
//
// Every HTML template is written two ways — vanilla CSS and Tailwind (`tw` attribute) —
// and the vanilla one is per engine: Satori gets flex only, Takumi gets CSS grid,
// box-shadow and gradients on top, since that is what it adds.

export type Engine = 'takumi' | 'satori';
export type Style = 'css' | 'tailwind';

export const STYLES: { id: Style; label: string }[] = [
	{ id: 'css', label: 'Vanilla CSS' },
	{ id: 'tailwind', label: 'Tailwind' }
];

/** one-line description of what the current template uses, for the editor head */
export function styleHint(style: Style, engine: Engine): string {
	if (style === 'tailwind') return 'tw attribute';
	return engine === 'takumi' ? 'grid, shadows, gradients' : 'flex only';
}

/** the markup to load for a template given the styling and the engine */
export function templateFor(example: Example, style: Style, engine: Engine): string {
	if (!example.html) return '';
	return style === 'tailwind' ? example.html.tailwind : example.html[engine];
}

export type Example = {
	id: string;
	label: string;
	/** one line under the template picker explaining what this template shows */
	hint: string;
	/** empty for the component template, which renders Card.svelte instead */
	html: Record<Engine | 'tailwind', string> | null;
};

const FONT = 'font-family:ui-sans-serif,system-ui,sans-serif';

export const examples: Example[] = [
	{
		id: 'docs',
		label: 'Docs page',
		hint: 'Title, one-line description and the site name — the shape most docs sites ship.',
		html: {
			satori: `<div style="display:flex;flex-direction:column;justify-content:space-between;width:100%;height:100%;padding:72px 80px;background:#0f172a;color:#f8fafc;${FONT}">
  <div style="display:flex;align-items:center;gap:14px;font-size:26px;color:#94a3b8">
    <div style="display:flex;width:14px;height:14px;border-radius:9999px;background:#f43f5e"></div>
    sveltekit-og.dev
  </div>
  <div style="display:flex;flex-direction:column;gap:20px">
    <div style="font-size:72px;font-weight:700;line-height:1.05;letter-spacing:-0.02em">Client-side rendering</div>
    <div style="font-size:30px;line-height:1.4;color:#cbd5e1">Generate Open Graph images in the browser — Takumi or Satori, no server request.</div>
  </div>
  <div style="display:flex;font-size:24px;color:#94a3b8">Usage · Client-side rendering</div>
</div>`,
			takumi: `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto 1fr auto;gap:20px 24px;width:100%;height:100%;padding:64px 80px;background:#0f172a;color:#f8fafc;${FONT}">
  <div style="grid-column:1 / -1;display:flex;align-items:center;gap:14px;font-size:26px;color:#94a3b8">
    <div style="display:flex;width:14px;height:14px;border-radius:9999px;background:#f43f5e"></div>
    sveltekit-og.dev
  </div>
  <div style="grid-column:1 / -1;display:flex;align-self:center;font-size:72px;font-weight:700;line-height:1.05;letter-spacing:-0.02em">Client-side rendering</div>
  <div style="display:flex;align-items:flex-end;padding:22px 26px;border-radius:18px;background:#1e293b;box-shadow:0 12px 32px rgba(0,0,0,0.35);font-size:26px">Takumi</div>
  <div style="display:flex;align-items:flex-end;padding:22px 26px;border-radius:18px;background:#1e293b;box-shadow:0 12px 32px rgba(0,0,0,0.35);font-size:26px">Satori + ReSVG</div>
  <div style="display:flex;align-items:flex-end;padding:22px 26px;border-radius:18px;background:linear-gradient(135deg,#f43f5e,#fb7185);box-shadow:0 12px 32px rgba(244,63,94,0.35);font-size:26px;font-weight:600">No server request</div>
</div>`,
			tailwind: `<div tw="flex flex-col justify-between w-full h-full p-20 bg-slate-900 text-slate-50">
  <div tw="flex items-center text-2xl text-slate-400">
    <div tw="flex w-4 h-4 mr-4 rounded-full bg-rose-500"></div>
    sveltekit-og.dev
  </div>
  <div tw="flex flex-col">
    <div tw="flex text-7xl font-bold leading-tight tracking-tight">Client-side rendering</div>
    <div tw="flex mt-5 text-3xl leading-snug text-slate-300">Generate Open Graph images in the browser — Takumi or Satori, no server request.</div>
  </div>
  <div tw="flex text-2xl text-slate-400">Usage · Client-side rendering</div>
</div>`
		}
	},
	{
		id: 'post',
		label: 'Blog post',
		hint: 'Headline, author row and a series card — the same layout in every styling.',
		html: {
			satori: `<div style="display:flex;flex-direction:column;gap:24px;width:100%;height:100%;padding:72px 80px;background:#fafaf9;color:#1c1917;${FONT}">
  <div style="display:flex;font-size:26px;font-weight:600;color:#be123c">Engineering notes</div>
  <div style="display:flex;flex:1;gap:56px">
    <div style="display:flex;flex:1;flex-direction:column;justify-content:space-between">
      <div style="display:flex;flex:1;align-items:center;font-size:64px;font-weight:700;line-height:1.08;letter-spacing:-0.02em">Why we render OG images on the client now</div>
      <div style="display:flex;align-items:center;gap:18px;font-size:26px;color:#57534e">
        <div style="display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:9999px;background:#1c1917;color:#fafaf9;font-size:22px;font-weight:700">SM</div>
        <div style="display:flex">Shivam Meena · 8 Oct 2026 · 6 min read</div>
      </div>
    </div>
    <div style="display:flex;width:300px;flex-direction:column;justify-content:flex-end;gap:10px;padding:28px;border-radius:22px;background:linear-gradient(160deg,#fff1f2,#fecdd3);box-shadow:0 16px 40px rgba(190,18,60,0.18);font-size:24px;color:#881337">
      <div style="display:flex;font-size:20px;font-weight:600;letter-spacing:0.04em">SERIES</div>
      <div style="display:flex;font-size:30px;font-weight:700;line-height:1.2">Open Graph, everywhere</div>
      <div style="display:flex">Part 3 of 3</div>
    </div>
  </div>
</div>`,
			takumi: `<div style="display:grid;grid-template-columns:1fr 300px;grid-template-rows:auto 1fr auto;gap:24px 56px;width:100%;height:100%;padding:72px 80px;background:#fafaf9;color:#1c1917;${FONT}">
  <div style="grid-column:1 / -1;display:flex;font-size:26px;font-weight:600;color:#be123c">Engineering notes</div>
  <div style="grid-column:1;grid-row:2;display:flex;align-self:center;font-size:64px;font-weight:700;line-height:1.08;letter-spacing:-0.02em">Why we render OG images on the client now</div>
  <div style="grid-column:2;grid-row:2 / 4;display:flex;flex-direction:column;justify-content:flex-end;gap:10px;padding:28px;border-radius:22px;background:linear-gradient(160deg,#fff1f2,#fecdd3);box-shadow:0 16px 40px rgba(190,18,60,0.18);font-size:24px;color:#881337">
    <div style="display:flex;font-size:20px;font-weight:600;letter-spacing:0.04em">SERIES</div>
    <div style="display:flex;font-size:30px;font-weight:700;line-height:1.2">Open Graph, everywhere</div>
    <div style="display:flex">Part 3 of 3</div>
  </div>
  <div style="grid-column:1;grid-row:3;display:flex;align-items:center;gap:18px;font-size:26px;color:#57534e">
    <div style="width:52px;height:52px;border-radius:9999px;background:#1c1917;color:#fafaf9;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">SM</div>
    <div style="display:flex">Shivam Meena · 8 Oct 2026 · 6 min read</div>
  </div>
</div>`,
			tailwind: `<div tw="flex flex-col w-full h-full p-20 bg-stone-50 text-stone-900">
  <div tw="flex text-2xl font-semibold text-rose-700">Engineering notes</div>
  <div tw="flex flex-1 mt-6">
    <div tw="flex flex-1 flex-col justify-between mr-14">
      <div tw="flex flex-1 items-center text-6xl font-bold leading-tight tracking-tight">Why we render OG images on the client now</div>
      <div tw="flex items-center text-2xl text-stone-600">
        <div tw="flex items-center justify-center w-14 h-14 mr-4 rounded-full bg-stone-900 text-stone-50 text-xl font-bold">SM</div>
        <div tw="flex">Shivam Meena · 8 Oct 2026 · 6 min read</div>
      </div>
    </div>
    <div tw="flex w-[300px] flex-col justify-end p-7 rounded-3xl bg-rose-100 shadow-xl text-2xl text-rose-900">
      <div tw="flex text-xl font-semibold tracking-wider">SERIES</div>
      <div tw="flex mt-2 text-3xl font-bold leading-tight">Open Graph, everywhere</div>
      <div tw="flex mt-2">Part 3 of 3</div>
    </div>
  </div>
</div>`
		}
	},
	{
		id: 'release',
		label: 'Release',
		hint: 'Version badge, a headline and three change lines.',
		html: {
			satori: `<div style="display:flex;flex-direction:column;width:100%;height:100%;padding:72px 80px;background:#111827;color:#f9fafb;${FONT}">
  <div style="display:flex;align-items:center;gap:16px">
    <div style="display:flex;padding:8px 18px;border-radius:9999px;background:#f43f5e;color:#fff;font-size:24px;font-weight:700">v4.4.0</div>
    <div style="display:flex;font-size:26px;color:#9ca3af">@ethercorps/sveltekit-og</div>
  </div>
  <div style="display:flex;margin-top:40px;font-size:64px;font-weight:700;line-height:1.08;letter-spacing:-0.02em">Render in the browser</div>
  <div style="display:flex;flex-direction:column;gap:14px;margin-top:40px;font-size:28px;line-height:1.35;color:#d1d5db">
    <div style="display:flex">— New /client entry with Takumi and Satori engines</div>
    <div style="display:flex">— Engines load lazily, only the one you pick is downloaded</div>
    <div style="display:flex">— Works in web workers with HTML strings</div>
  </div>
</div>`,
			takumi: `<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto 1fr;gap:20px 24px;width:100%;height:100%;padding:64px 80px;background:#111827;color:#f9fafb;${FONT}">
  <div style="grid-column:1 / -1;display:flex;align-items:center;gap:16px">
    <div style="display:flex;padding:8px 18px;border-radius:9999px;background:linear-gradient(90deg,#f43f5e,#fb7185);box-shadow:0 8px 24px rgba(244,63,94,0.4);color:#fff;font-size:24px;font-weight:700">v4.4.0</div>
    <div style="display:flex;font-size:26px;color:#9ca3af">@ethercorps/sveltekit-og</div>
  </div>
  <div style="grid-column:1 / -1;display:flex;font-size:60px;font-weight:700;line-height:1.08;letter-spacing:-0.02em">Render in the browser</div>
  <div style="display:flex;flex-direction:column;justify-content:flex-end;gap:8px;padding:24px 28px;border-radius:18px;background:#1f2937;box-shadow:0 12px 32px rgba(0,0,0,0.35);font-size:24px;line-height:1.3;color:#d1d5db">
    <div style="display:flex;font-size:20px;color:#9ca3af">ADDED</div>
    <div style="display:flex">/client entry with Takumi and Satori engines</div>
  </div>
  <div style="display:flex;flex-direction:column;justify-content:flex-end;gap:8px;padding:24px 28px;border-radius:18px;background:#1f2937;box-shadow:0 12px 32px rgba(0,0,0,0.35);font-size:24px;line-height:1.3;color:#d1d5db">
    <div style="display:flex;font-size:20px;color:#9ca3af">FIXED</div>
    <div style="display:flex">Empty elements and multi-line styles on Satori</div>
  </div>
</div>`,
			tailwind: `<div tw="flex flex-col w-full h-full p-20 bg-gray-900 text-gray-50">
  <div tw="flex items-center">
    <div tw="flex px-5 py-2 mr-4 rounded-full bg-rose-500 text-white text-2xl font-bold">v4.4.0</div>
    <div tw="flex text-2xl text-gray-400">@ethercorps/sveltekit-og</div>
  </div>
  <div tw="flex mt-10 text-6xl font-bold leading-tight tracking-tight">Render in the browser</div>
  <div tw="flex flex-col mt-10 text-3xl leading-snug text-gray-300">
    <div tw="flex">— New /client entry with Takumi and Satori engines</div>
    <div tw="flex mt-3">— Engines load lazily, only the one you pick is downloaded</div>
    <div tw="flex mt-3">— Works in web workers with HTML strings</div>
  </div>
</div>`
		}
	},
	{
		id: 'profile',
		label: 'Profile',
		hint: 'Name, handle and a short bio — a social card.',
		html: {
			satori: `<div style="display:flex;align-items:center;width:100%;height:100%;padding:72px 80px;gap:56px;background:#fff7ed;color:#431407;${FONT}">
  <div style="display:flex;align-items:center;justify-content:center;width:220px;height:220px;border-radius:9999px;background:#ea580c;color:#fff7ed;font-size:88px;font-weight:700;flex-shrink:0">SM</div>
  <div style="display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;font-size:60px;font-weight:700;letter-spacing:-0.02em">Shivam Meena</div>
    <div style="display:flex;font-size:30px;color:#9a3412">@theether0</div>
    <div style="display:flex;margin-top:12px;font-size:28px;line-height:1.4;color:#7c2d12;max-width:720px">Building SvelteKit OG. Open Graph images for every runtime, and now for the browser too.</div>
  </div>
</div>`,
			takumi: `<div style="display:grid;grid-template-columns:220px 1fr;grid-template-rows:auto auto auto;gap:14px 56px;align-content:center;align-items:center;width:100%;height:100%;padding:64px 80px;background:linear-gradient(135deg,#fff7ed,#ffedd5);color:#431407;${FONT}">
  <div style="grid-row:1 / 4;display:flex;align-items:center;justify-content:center;width:220px;height:220px;border-radius:9999px;background:linear-gradient(160deg,#f97316,#c2410c);box-shadow:0 20px 48px rgba(194,65,12,0.35);color:#fff7ed;font-size:88px;font-weight:700">SM</div>
  <div style="display:flex;font-size:60px;font-weight:700;letter-spacing:-0.02em">Shivam Meena</div>
  <div style="display:flex;font-size:30px;color:#9a3412">@theether0</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:12px;font-size:24px;color:#7c2d12">
    <div style="display:flex;padding:16px 20px;border-radius:16px;background:rgba(255,255,255,0.7);box-shadow:0 8px 24px rgba(194,65,12,0.12)">SvelteKit OG</div>
    <div style="display:flex;padding:16px 20px;border-radius:16px;background:rgba(255,255,255,0.7);box-shadow:0 8px 24px rgba(194,65,12,0.12)">Every runtime</div>
    <div style="display:flex;padding:16px 20px;border-radius:16px;background:rgba(255,255,255,0.7);box-shadow:0 8px 24px rgba(194,65,12,0.12)">Now the browser</div>
  </div>
</div>`,
			tailwind: `<div tw="flex items-center w-full h-full p-20 bg-orange-50 text-orange-950">
  <div tw="flex items-center justify-center w-56 h-56 mr-14 rounded-full bg-orange-600 text-orange-50 text-8xl font-bold">SM</div>
  <div tw="flex flex-col">
    <div tw="flex text-6xl font-bold tracking-tight">Shivam Meena</div>
    <div tw="flex mt-3 text-3xl text-orange-800">@theether0</div>
    <div tw="flex mt-6 text-3xl leading-snug text-orange-900 max-w-[720px]">Building SvelteKit OG. Open Graph images for every runtime, and now for the browser too.</div>
  </div>
</div>`
		}
	},
	{
		id: 'component',
		label: 'Svelte component',
		hint: 'Renders Card.svelte with the props below — components mount in a detached shadow root.',
		html: null
	}
];

export const DEFAULT_EXAMPLE = examples[0];
