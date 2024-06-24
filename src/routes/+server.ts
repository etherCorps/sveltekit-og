import type {RequestHandler} from "@sveltejs/kit";
import {ImageResponse} from "$lib";

export const GET: RequestHandler = async () => {
    const html = `
    <div style="
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-image: linear-gradient(to bottom, #dbf4ff, #fff1f1);
  font-size: 60px;
  letter-spacing: -2px;
  font-weight: 700;
  text-align: center;
">
  <div style="
  display: flex;
    background-image: linear-gradient(90deg, rgb(0, 124, 240), rgb(0, 223, 216));
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  ">
    HTML
  </div>
  <div style="
    background-image: linear-gradient(90deg, rgb(121, 40, 202), rgb(255, 0, 128));
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  ">
    CSS
  </div>
  <div style="
    background-image: linear-gradient(90deg, rgb(255, 77, 77), rgb(249, 203, 40));
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  ">
    IMAGE
  </div>
</div>
    `;
    return new ImageResponse(html, {
        debug: true,
        height: 400,
        width: 800
    })
};
