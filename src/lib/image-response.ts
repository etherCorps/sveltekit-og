import type { SvelteComponent } from 'svelte';
import type { ImageResponseOptions } from './types.js';
import { DEFAULT_OPTIONS, DEFAULT_STATUS_CODE, DEFAULT_STATUS_TEXT } from './helpers/defaults.js';
import { createPng, createSvg } from './helpers/create.js';
import { isDevelopment } from 'std-env';

export class ImageResponse extends Response {
	constructor(element: string | SvelteComponent, options?: ImageResponseOptions, props?: Record<string, any>) {

		const extended_options = Object.assign({ ...DEFAULT_OPTIONS }, options)
		const create_image_funtion = extended_options.format === 'png' ? createPng : createSvg;
		const body = new ReadableStream({

			async start(controller) {
				const buffer = await create_image_funtion(element, extended_options, { props })
				controller.enqueue(buffer);
				controller.close();
			}

		});

		super(body, {
			headers: {
				'Content-Type': `image/${extended_options.format}`,
				'Cache-Control': (extended_options.debug || isDevelopment)
					? 'no-cache, no-store'
					: 'public, immutable, no-transform, max-age=31536000',
				...extended_options.headers
			},
			status: extended_options.status || DEFAULT_STATUS_CODE,
			statusText: extended_options.statusText || DEFAULT_STATUS_TEXT
		});
	}
}