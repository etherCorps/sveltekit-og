---
title: Fonts
description: How to use self hosted, custom and google fonts with sveltekit-og.
section: Utilities
---

<script>
	import { Callout } from "@svecodocs/kit";
</script>

<Callout type="note" title="Feature available from v4.2.0">

The `GoogleFont`, `CustomFont`, and `resolveFonts` utilities have been introduced in `sveltekit-og@v4.2.0`.

</Callout>

To ensure consistent and high-quality typography in your generated images, you must provide the font files to the rendering engine (Satori) as raw binary data. You cannot rely on standard CSS @font-face rules.

The SvelteKit OG library provides the `CustomFont`, and `GoogleFont` classes, along with the `resolveFonts` utility, to handle loading, caching, and preparing the font data.

## 📂 Using Local Custom Fonts

This method involves placing your TrueType (`.ttf`) or OpenType (`.otf`) files in the static or a private asset folder and reading them directly from the file system using SvelteKit's built-in `$app/server/read` utility.

### Example

- Import: Use the Vite ?url suffix to get the build-time path of your local font file.

<Callout type="warning" title="Netlify issue">

Vite `?url` import is not working in netlify deployment.

</Callout>

- **Load**: Use `$app/server/read` to retrieve the file as an `ArrayBuffer`.
- **Wrap**: Pass a **function** that performs the reading into the `CustomFont`.

```typescript showLineNumbers title="+server.ts"
import { ImageResponse, CustomFont, resolveFonts } from '@ethercorps/sveltekit-og';
import { read } from '$app/server'; // SvelteKit Runtime Dependency
import RegularFontPath from '$lib/assets/MyFont-Regular.ttf?url';
import BoldFontPath from '$lib/assets/MyFont-Bold.ttf?url';

// 1. Define the CustomFont instances
const myCustomRegular = new CustomFont(
    'My Custom Font',
    // The input function executes `read().arrayBuffer()` only when needed (lazy-loaded)
    () => read(RegularFontPath).arrayBuffer(), 
    { weight: 400 }
);

const myCustomBold = new CustomFont(
    'My Custom Font',
    () => read(BoldFontPath).arrayBuffer(),
    { weight: 700 }
);

export const GET = async () => {
    // 2. Resolve the promises to get the final ArrayBuffer array
    const resolvedFontOptions = await resolveFonts([myCustomRegular, myCustomBold]);
    
    return new ImageResponse(
        `<div tw="flex" style="font-family: 'My Custom Font'">...</div>`,
        {
            fonts: resolvedFontOptions, 
        }
    );
};
```

<Callout type="tip" title="Use resolveFonts">

Always use `resolveFonts` before passing to `fonts` as image options.

```typescript
await resolveFonts([myCustomRegular, myCustomBold])
```

</Callout>

## 🌐 Using Google Fonts

The `GoogleFont` class abstracts away all network logic, including fetching the CSS, parsing the `.ttf` file URL, and applying the internal cache.

### Example

- **Define**: Create instances of **GoogleFont**, specifying the family name and desired weight.
- **Resolve**: Pass the instances to **resolveFonts**.

```typescript showLineNumbers title="+server.ts"
import { ImageResponse, GoogleFont, resolveFonts } from '@ethercorps/sveltekit-og';

// 1. Define the GoogleFont instances
const interRegular = new GoogleFont('Inter', {
    weight: 400,
    name: 'Inter',
    // Optional: Only fetches characters needed for better performance
    text: 'Hello World! 123', 
});

const interBold = new GoogleFont('Inter', {
    weight: 700,
});

export const GET = async () => {
    // 2. Await the resolution (which triggers the fetch/cache lookup)
    const resolvedFontOptions = await resolveFonts([interRegular, interBold]);
    
    return new ImageResponse(
        `<div tw="flex" style="font-family: 'Inter'">...</div>`,
        {
            fonts: resolvedFontOptions, 
        }
    );
};
```

<Callout type="tip" title="Use resolveFonts">

Always use `resolveFonts` before passing to `fonts` as image options.

```typescript
await resolveFonts([myCustomRegular, myCustomBold])
```

</Callout>

## ☁️ Using Remote Fonts

If your font file is hosted on an external CDN or public URL, you can fetch it directly using the global fetch API. This is similar to Google Fonts but uses the CustomFont class, passing the fetch promise as the input.

### Example

```typescript showLineNumbers title="+server.ts"
import { ImageResponse, CustomFont, resolveFonts } from '@ethercorps/sveltekit-og';

const REMOTE_FONT_URL = 'https://my-cdn.com/assets/FontAwesome-Regular.otf';

// 1. Define the CustomFont instance
const fontAwesome = new CustomFont(
    'Font Awesome',
    // Pass a function that returns the ArrayBuffer promise from fetch
    () => fetch(REMOTE_FONT_URL).then((res) => res.arrayBuffer()),
    { weight: 400 }
);

export const GET = async () => {
    const resolvedFontOptions = await resolveFonts([fontAwesome]);
    
    return new ImageResponse(
        `<div tw="flex" style="font-family: 'Font Awesome'">...</div>`,
        {
            fonts: resolvedFontOptions, 
        }
    );
};
```

<Callout type="tip" title="Use resolveFonts">

Always use `resolveFonts` before passing to `fonts` as image options.

```typescript
await resolveFonts([myCustomRegular, myCustomBold])
```

</Callout>

## 🔢 Multiple Font Sources

This example assumes you have two local files (`$lib/assets/LocalFont-R.ttf`, `$lib/assets/LocalFont-B.ttf`) and one custom remote font (`https://cdn.example.com/icons.ttf`).

```typescript
import { ImageResponse, CustomFont, GoogleFont, resolveFonts } from '@ethercorps/sveltekit-og';
import { read } from '$app/server'; // Needed for local file reading

// --- Local Font Paths (Requires Vite + SvelteKit read) ---
import LocalRegularPath from '$lib/assets/LocalFont-R.ttf?url'; 
import LocalBoldPath from '$lib/assets/LocalFont-B.ttf?url'; 

// --- Custom Remote URL ---
const ICON_FONT_URL = 'https://cdn.example.com/icons.ttf';

export const GET = async () => {

    // 1. Define all font instances
    const fontsToLoad = [
        
        // A. 📦 LOCAL CUSTOM FONT (Uses $app/server/read via a function)
        new CustomFont(
            'Local App Font',
            () => read(LocalRegularPath).arrayBuffer(), 
            { weight: 400 }
        ),
        new CustomFont(
            'Local App Font',
            () => read(LocalBoldPath).arrayBuffer(),
            { weight: 700 }
        ),

        // B. 🌐 GOOGLE FONT (Uses internal fetch/cache)
        new GoogleFont('Roboto Mono', {
            weight: 500,
            name: 'Roboto Mono',
            text: 'Code: 123', // Optimize this fetch
        }),

        // C. ☁️ CUSTOM REMOTE FONT (Uses global fetch)
        new CustomFont(
            'Custom Icons',
            () => fetch(ICON_FONT_URL).then(res => res.arrayBuffer()),
            { weight: 400 }
        ),
    ];

    // 2. Resolve all font buffers concurrently (local reads and network fetches)
    const resolvedFontOptions = await resolveFonts(fontsToLoad);
    
    // 3. Render the image
    return new ImageResponse(
        `<div tw="flex flex-col p-10 w-full h-full bg-gray-50">
            <h1 tw="text-4xl" style="font-family: 'Local App Font'; font-weight: 700;">
                Mixed Typography Title
            </h1>
            <p tw="text-2xl mt-4" style="font-family: 'Roboto Mono';">
                const data = 'fetched data';
            </p>
            <span tw="text-4xl mt-6" style="font-family: 'Custom Icons';">
                &#xe900; </span>
        </div>`,
        {
            width: 1200,
            height: 630,
            fonts: resolvedFontOptions, // Array of resolved ArrayBuffers
        }
    );
};
```

<Callout type="tip" title="Use resolveFonts">

Always use `resolveFonts` before passing to `fonts` as image options.

```typescript
await resolveFonts([myCustomRegular, myCustomBold])
```

</Callout>