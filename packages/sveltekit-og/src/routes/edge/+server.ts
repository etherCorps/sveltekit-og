import { type RequestHandler } from "@sveltejs/kit";
import { ImageResponse } from "#lib/index.js";
// inlined at build so dev, prerender and edge never fetch a remote logo
import logo from "../../../static/ethercorps-logo.png?inline";

export const GET: RequestHandler = async () => {
	const html = `
<div tw="h-full w-full flex flex-col items-center justify-center bg-white text-sm font-bold">
  <img tw="w-40 h-40" src="${logo}"/>
  <div style="margin-top: 20px; color: gray">Hello, OGs</div>
  </div>
`
		.replaceAll("\n", "")
		.trim();

	return new ImageResponse(html, {
		engine: "satori",
		format: "png",
		debug: false,
		height: 300,
		width: 600,
	});
};
