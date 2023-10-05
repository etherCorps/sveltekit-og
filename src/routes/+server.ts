import type {RequestHandler} from "@sveltejs/kit";
import {ImageResponse} from "$lib";

export const GET: RequestHandler = async () => {
    const html = '<div style="color: black; background: aqua; height: 100vh;">hello, world</div>';
    return ImageResponse(html)
};
