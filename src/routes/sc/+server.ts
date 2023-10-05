import type {RequestHandler} from "@sveltejs/kit";
import {componentToImageResponse} from "$lib";
import OG from "./OG.svelte";

export const GET: RequestHandler = async () => {
    return await componentToImageResponse(
        OG,
        { text: 'Ready to dive in?', spanText: 'Start your free trial today.' }
    );
};
