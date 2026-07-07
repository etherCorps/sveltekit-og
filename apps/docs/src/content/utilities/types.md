---
title: ImageResponse API Reference
description: Reference for the ImageResponse constructor and its options.
section: Utilities
---

<script>
    import {Callout, PropField, Collapsible, blockquote} from '@svecodocs/kit';
</script>

## ImageResponse

The ImageResponse class is the central API for generating and serving dynamic images. It extends the standard Web API Response and is designed to be returned directly from a SvelteKit server route (`+server.ts`).

The constructor takes the component/HTML template, rendering options, and component props.

```typescript
new ImageResponse<T extends string | Component<any>>(
	element: T,
	options?: ImageResponseOptions,
	props?: T extends Component<any> ? ComponentProps<T> : never
): Response;
```

## ImageResponse Parameters

To create your dynamic Open Graph image, the **ImageResponse** constructor needs just three pieces of information, passed in this specific order. Think of this as defining the **design**, the **settings**, and the **data** for your image.

1. **Svelte Component or Raw HTML:** The **design** of your image—what people will actually see.
2. **Options:** The **settings** that define the image's size, fonts, and response headers.
3. **Props:** The **dynamic data** (like a blog post title) to feed into your Svelte component.

```typescript title="src/routes/og/+server.ts" showLineNumbers
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { CustomFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import MySvelteComponent from '$lib/og/MySvelteComponent.svelte';
export const GET = async () => {
	const props = {
		title: 'Dynamic Title',
		subtitle: 'Generated with Sveltekit OG'
	};
	const fonts = [
		new CustomFont(
			'Inter',
			() => fetch('https://example.com/fonts/Inter-Regular.ttf').then((res) => res.arrayBuffer()),
			{ weight: '400' }
		)
	];
	return new ImageResponse(
		// 1. Svelte Component or Raw HTML
		MySvelteComponent,
		// 2. Options
		{
			width: 1200,
			height: 630,
			fonts: await resolveFonts(fonts)
		},
		// 3. Svelte Component props
		props
	);
};
```

<Callout type="note" title="Note">

Font files must be loaded as raw binary data (ArrayBuffer). The `GoogleFont`, `CustomFont` and `resolveFonts` [utilities](/docs/utilities/fonts) are provided to help you asynchronously load your custom fonts correctly before the image is generated.

</Callout>

### Svelte Component or HTML

This parameter defines the visual content of your Open Graph image. You can provide either a Svelte component or a raw HTML string.

<PropField name="element" type="Component | string" required />

<Callout type="tip" title="Suggestion">
    While you can use raw HTML, using a Svelte component is recommended for better maintainability and reusability.
</Callout>

### ImageResponse Options

The `options` object allows you to customize various technical aspects of the generated image and its HTTP response.

<PropField name="options" type="ImageResponse" required>
    Configuration options for the generated image and its response.
    <Collapsible open={true} title="options">
       <PropField name="width" type="number" defaultValue="1200">
          Sets the <strong>width</strong> of the final OG image in pixels.
       </PropField>
       <PropField name="height" type="number" required defaultValue="630">
            Sets the <strong>height</strong> of the final OG image in pixels.
       </PropField>
        <PropField name="format" type="'svg' | 'png'" defaultValue="png">
            The file format for the generated image. <strong>PNG</strong> is standard for OG images, but <strong>SVG</strong> is also available.
        </PropField>
        <PropField name="fonts" type="Font[]" defaultValue="Noto Sans">
            A list of <strong>font definitions</strong> (name, data, weight) used to render text in your design.
            <Collapsible open={true} title="Font">
                <PropField name="data" type="Buffer | ArrayBuffer" required>
                    The font file data loaded as a <strong>Buffer</strong> or <strong>ArrayBuffer</strong>.
                </PropField>
                <PropField name="name" type="string" required>
                    The font family name (must match your CSS `font-family`).
                </PropField>
                <PropField name="weight" type="number">
                    The weight of the font (e.g., `400` for regular, `700` for bold).
                </PropField>
                <PropField name="style" type="'normal' | 'italic'">
                    The style of the font.
                </PropField>
                <PropField name="lang" type="string">
                    The language subset for the font (e.g., 'en').
                </PropField>
            </Collapsible>
        </PropField>
        <PropField name="emoji" type="'twemoji' | 'openmoji' | 'blobmoji' | 'noto' | 'fluent' | 'fluentFlat'" defaultValue="twemoji">
            Choose the <strong>style of emojis</strong> you want to use in your design (e.g., Twitter's <strong>Twemoji</strong> is the default).
        </PropField>
        <PropField name="debug" type="boolean" defaultValue="false">
            Turn this on to show helpful <strong>layout guides and rulers</strong> on the image. Great for troubleshooting positioning!
        </PropField>
        <PropField name="status" type="number" defaultValue="200">
            The <strong>HTTP status code</strong> sent with the image (e.g., `200` for success).
        </PropField>
        <PropField name="statusText" type="string" defaultValue="Success">
            The <strong>HTTP status text</strong> sent alongside the status code.
        </PropField>
        <PropField name="headers" type="Record<string, unknown>" >
            Add any <strong>custom HTTP headers</strong> you need for the response.
            <br /> 
            <br />
            <blockquote>We automatically add `Content-Type` based on the image format and `Cache-Control` for caching. If debug mode is enabled, the `Cache-Control` header is updated to `no-cache`.</blockquote> 
        </PropField>
    </Collapsible>
</PropField>

### Component Props

<PropField name="props" type="ComponentProps<typeof Component>" >
    An object containing the dynamic data to be passed to your Svelte component (the first parameter). If your component expects a title or author, you pass it here! 
    <br /> 
    <br /> 
    <strog> This parameter is required if you use a Svelte component that expects props. </strog> The types for this object are automatically inferred from the props defined in your Svelte component.
</PropField>

## All Options Example

Here is an example demonstrating how to use several optional parameters, including setting custom headers and enabling debug mode.

```typescript title="src/routes/advanced-og/+server.ts"
import { ImageResponse } from '@ethercorps/sveltekit-og';
import { resolveFonts } from '@ethercorps/sveltekit-og/fonts';
import MySvelteComponent from '$lib/og/MySvelteComponent.svelte';
import { FONT_DATA } from '$lib/fonts'; // Assume pre-loaded font data

export const GET = async ({ url }) => {
	// 1. Prepare dynamic data
	const isError = url.searchParams.has('error');

	// 2. Define custom options
	const options = {
		width: 1200,
		height: 630,
		debug: url.searchParams.has('debug'), // Toggle debug mode via query param
		emoji: 'blobmoji', // Use a different emoji set
		fonts: await resolveFonts(FONT_DATA),

		// 3. Conditional HTTP Response options
		status: isError ? 404 : 200,
		statusText: isError ? 'Not Found' : 'OK',
		headers: {
			// Override or add custom headers
			'X-OG-Generator': '@ethercorps/sveltekit-og'
		}
	};

	// 4. Define component props
	const props = {
		title: isError ? 'Page Not Found' : 'Standard Post Title'
	};

	return new ImageResponse(MySvelteComponent, options, props);
};
```

<Callout type="warning" title="Resolve Fonts">
    
`resolveFonts` can only be used with `GoogleFont` and `CustomFont` instances.

</Callout>
