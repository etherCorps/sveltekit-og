import type {RequestHandler} from "@sveltejs/kit";
import {ImageResponse} from "$lib/api.js";
import OG from "./OG.svelte";

export const GET: RequestHandler = async () => {
    return new ImageResponse(
        OG as any,
        {},
        { props: {
                text: 'Ready to dive in?', spanText: 'Start your free trial today.'
            }
        }
    );
};
