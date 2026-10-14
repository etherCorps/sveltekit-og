import { ImageResponse } from "@ethercorps/sveltekit-og";
import type { CustomFont, GoogleFont } from "@ethercorps/sveltekit-og/fonts";
import type { RequestHandler } from "@sveltejs/kit";
import OG from "./OG.svelte";
import { satoriTemplate, type TemplateData } from "./templates.js";

type Fonts = Array<CustomFont | GoogleFont>;
type Meta = Omit<TemplateData, "timestamp">;

const size = { width: 1200, height: 630 } as const;
const stamp = () => new Date().toISOString();

/** HTML template → Satori → PNG/SVG. Pass `fonts` from your runtime's helper. */
export const satoriTemplateHandler =
  (fonts: Fonts, format: "png" | "svg", meta: Meta): RequestHandler =>
  async () =>
    new ImageResponse(satoriTemplate({ ...meta, timestamp: stamp() }), {
      engine: "satori",
      ...size,
      format,
      fonts,
    });

/** Svelte component → Satori → PNG/SVG. */
export const satoriComponentHandler =
  (fonts: Fonts, format: "png" | "svg", meta: Meta): RequestHandler =>
  async () =>
    new ImageResponse(
      OG,
      { engine: "satori", ...size, format, fonts },
      { ...meta, timestamp: stamp() },
    );
