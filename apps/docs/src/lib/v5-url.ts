// Where each v4 page lives in the v5 docs (sveltekit-og.dev). Used for the banner link
// and the canonical tag. Paths that didn't move map to themselves.
const MOVED: Record<string, string> = {
	'/docs/usage/svelte': '/docs/guides/svelte-component/',
	'/docs/usage/html': '/docs/guides/html/',
	'/docs/usage/client': '/docs/guides/client/',
	'/docs/usage/takumi': '/docs/engines/takumi/',
	'/docs/utilities/fonts': '/docs/guides/fonts/',
	'/docs/utilities/types': '/docs/reference/image-response/',
	'/docs/advanced-usage/local-assets': '/docs/guides/local-assets/',
	'/docs/advanced-usage/pre-rendering': '/docs/guides/pre-rendering/'
};

export function v5Url(pathname: string): string {
	const path = pathname.replace(/\/$/, '') || '/docs';
	const target = MOVED[path] ?? path.replace(/^\/docs\/runtime\//, '/docs/deploy/') + '/';
	return `https://sveltekit-og.dev${target}`;
}
