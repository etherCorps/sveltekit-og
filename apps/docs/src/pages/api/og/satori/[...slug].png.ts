import { ogRoute, ogStaticPaths } from "../_render";

export const prerender = true;
export const getStaticPaths = ogStaticPaths;
export const GET = ogRoute("satori");
