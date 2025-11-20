import type { Component, ComponentProps } from 'svelte';
import type { ImageResponseOptions } from './types.js';
import { DEFAULT_OPTIONS, DEFAULT_STATUS_CODE, DEFAULT_STATUS_TEXT } from './helpers/defaults.js';
import { createPng, createSvg } from './helpers/create.js';

export class ImageResponse<T extends string | Component<any>> extends Response {
	constructor(element: T, options?: ImageResponseOptions, props?: T extends Component<any> ?  ComponentProps<T> : never) {
		const extended_options = Object.assign({ ...DEFAULT_OPTIONS }, options)
		const create_image_function = extended_options.format === 'png' ? createPng : createSvg;
		const body = new ReadableStream({
			async start(controller) {
				const buffer = await create_image_function(element as string, extended_options, { props })
				controller.enqueue(buffer);
				controller.close();
			}
		});

		super(body, {
			headers: {
				'Content-Type': `image/${extended_options.format}${extended_options.format === 'svg' ? '+xml' : ''}`,
				'Cache-Control': extended_options.debug
					? 'no-cache, no-store'
					: 'public, immutable, no-transform, max-age=31536000',
				...extended_options.headers
			},
			status: extended_options.status || DEFAULT_STATUS_CODE,
			statusText: extended_options.statusText || DEFAULT_STATUS_TEXT
		});
	}
}