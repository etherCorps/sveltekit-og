import { takumiTemplatePrerenderedHandler } from '@examples/shared/takumi';

// Pre-rendered: generated once at build time. Prerendered output can't vary by
// query, so this one is a fixed PNG.
export const prerender = true;

export const GET = takumiTemplatePrerenderedHandler({
	provider: 'Takumi',
	format: 'PNG',
	mode: 'Prerendered'
});
