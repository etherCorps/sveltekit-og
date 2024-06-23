import type {RequestHandler} from "@sveltejs/kit";
import {ImageResponse} from "$lib";
import OG from "./OG.svelte";

export const GET: RequestHandler = async () => {
    return new ImageResponse(
        OG as any,
        {debug: false},
        { props: {
                text: 'Ready to dive in?', spanText: 'Start your free trial today.'
            }
        }
    );
};
