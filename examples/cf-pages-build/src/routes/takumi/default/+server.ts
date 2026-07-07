import { takumiTemplateHandler } from '@examples/shared/takumi';

// Default: HTML string → Takumi. `?format=` switches the output format
// (png default, jpeg, webp, ico, svg, raw).
export const GET = takumiTemplateHandler({ provider: 'Takumi', mode: 'Runtime' });
