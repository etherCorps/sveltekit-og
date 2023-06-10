import type {RequestHandler} from "@sveltejs/kit";
import {ImageResponse} from "$lib";
import {to_number} from "svelte/internal";

const htmlSrc = `
<div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; flex-direction: column; background-image: linear-gradient(to bottom, #dbf4ff, #fff1f1); font-size: 60px; letter-spacing: -2px; font-weight: 700; text-align: center;">
  <div style="background-image: linear-gradient(90deg, rgb(0, 124, 240, 1), rgb(0, 223, 216)); background-clip: text; -webkit-background-clip: text; color: transparent;">Design</div>
  <div style="background-image: linear-gradient(90deg, rgb(121, 40, 202, 1), rgb(255, 0, 128)); background-clip: text; -webkit-background-clip: text; color: transparent;">Develop</div>
  <div style="background-image: linear-gradient(90deg, rgb(255, 77, 77, 1), rgb(249, 203, 40)); background-clip: text; -webkit-background-clip: text; color: transparent;">SvelteKit OG</div>
</div>

`;

export const GET: RequestHandler = async ({request, url}) => {
    return ImageResponse(htmlSrc, {
        width: to_number(url.searchParams.get('w')) || 600,
        height: to_number(url.searchParams.get('h')) || 420,
    })
};
