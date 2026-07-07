import { takumiComponentHandler } from '@examples/shared/takumi';

// Component: Svelte component → Takumi. `?format=` switches the output format.
export const GET = takumiComponentHandler({ provider: 'Takumi', mode: 'Runtime' });
