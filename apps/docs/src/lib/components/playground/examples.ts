// Playground templates. Each is the OG *content* — inline styles (or a `tw` attribute)
// only, because both engines read them and the client component path captures inline
// styles alone.
// Keep every template to one accent on a plain surface; the point is the API, not the art.

export type Engine = 'takumi' | 'satori';

export type Example = {
	id: string;
	label: string;
	/** one line under the chip row explaining what this template shows */
	hint: string;
	html: string;
};

const FONT = 'font-family:ui-sans-serif,system-ui,sans-serif';

export const examples: Example[] = [
	{
		id: 'docs',
		label: 'Docs page',
		hint: 'Title, one-line description and the site name — the shape most docs sites ship.',
		html: `<div style="display:flex;flex-direction:column;justify-content:space-between;width:100%;height:100%;padding:72px 80px;background:#0f172a;color:#f8fafc;${FONT}">
  <div style="display:flex;align-items:center;gap:14px;font-size:26px;color:#94a3b8">
    <div style="display:flex;width:14px;height:14px;border-radius:9999px;background:#f43f5e"></div>
    sveltekit-og.dev
  </div>
  <div style="display:flex;flex-direction:column;gap:20px">
    <div style="font-size:72px;font-weight:700;line-height:1.05;letter-spacing:-0.02em">Client-side rendering</div>
    <div style="font-size:30px;line-height:1.4;color:#cbd5e1">Generate Open Graph images in the browser — Takumi or Satori, no server request.</div>
  </div>
  <div style="display:flex;font-size:24px;color:#94a3b8">Usage · Client-side rendering</div>
</div>`
	},
	{
		id: 'post',
		label: 'Blog post',
		hint: 'Headline with author and date on a light surface.',
		html: `<div style="display:flex;flex-direction:column;justify-content:space-between;width:100%;height:100%;padding:72px 80px;background:#fafaf9;color:#1c1917;${FONT}">
  <div style="display:flex;font-size:26px;font-weight:600;color:#be123c">Engineering notes</div>
  <div style="display:flex;font-size:68px;font-weight:700;line-height:1.08;letter-spacing:-0.02em;max-width:980px">Why we render OG images on the client now</div>
  <div style="display:flex;align-items:center;gap:18px;font-size:26px;color:#57534e">
    <div style="width:52px;height:52px;border-radius:9999px;background:#1c1917;color:#fafaf9;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">SM</div>
    <div style="display:flex">Shivam Meena</div>
    <div style="display:flex;color:#a8a29e">·</div>
    <div style="display:flex">8 Oct 2026</div>
    <div style="display:flex;color:#a8a29e">·</div>
    <div style="display:flex">6 min read</div>
  </div>
</div>`
	},
	{
		id: 'release',
		label: 'Release',
		hint: 'Version badge, a headline and three change lines.',
		html: `<div style="display:flex;flex-direction:column;width:100%;height:100%;padding:72px 80px;background:#111827;color:#f9fafb;${FONT}">
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
</div>`
	},
	{
		id: 'profile',
		label: 'Profile',
		hint: 'Name, handle and a short bio — a social card.',
		html: `<div style="display:flex;align-items:center;width:100%;height:100%;padding:72px 80px;gap:56px;background:#fff7ed;color:#431407;${FONT}">
  <div style="display:flex;align-items:center;justify-content:center;width:220px;height:220px;border-radius:9999px;background:#ea580c;color:#fff7ed;font-size:88px;font-weight:700;flex-shrink:0">SM</div>
  <div style="display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;font-size:60px;font-weight:700;letter-spacing:-0.02em">Shivam Meena</div>
    <div style="display:flex;font-size:30px;color:#9a3412">@theether0</div>
    <div style="display:flex;margin-top:12px;font-size:28px;line-height:1.4;color:#7c2d12;max-width:720px">Building SvelteKit OG. Open Graph images for every runtime, and now for the browser too.</div>
  </div>
</div>`
	},
	{
		id: 'tailwind',
		label: 'Tailwind',
		hint: 'Utility classes in a tw attribute — both engines read them, no stylesheet or build step.',
		html: `<div tw="flex flex-col justify-between w-full h-full p-20 bg-slate-900 text-slate-50">
  <div tw="flex items-center text-2xl text-slate-400">
    <div tw="flex w-4 h-4 mr-4 rounded-full bg-rose-500"></div>
    sveltekit-og.dev
  </div>
  <div tw="flex flex-col">
    <div tw="flex text-7xl font-bold leading-tight tracking-tight">Tailwind classes</div>
    <div tw="flex mt-5 text-3xl leading-snug text-slate-300">Both engines read the tw attribute. No stylesheet, no build step.</div>
  </div>
  <div tw="flex text-2xl text-slate-400">Usage · Tailwind</div>
</div>`
	},
	{
		id: 'component',
		label: 'Svelte component',
		hint: 'Renders Card.svelte with the props below — components mount in a detached shadow root.',
		html: ''
	}
];

export const DEFAULT_EXAMPLE = examples[0];
