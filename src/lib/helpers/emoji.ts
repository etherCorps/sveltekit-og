import { DEFAULT_EMOJI_PROVIDER } from '../helpers/defaults.js';
// Code stolen from @vercel/og
const U200D = String.fromCharCode(8205);
const UFE0Fg = /\uFE0F/g;

function getIconCode(char) {
	return toCodePoint(char.indexOf(U200D) < 0 ? char.replace(UFE0Fg, "") : char);
}

function toCodePoint(unicodeSurrogates) {
	const r = []
	let c = 0, p = 0, i = 0;
	while (i < unicodeSurrogates.length) {
		c = unicodeSurrogates.charCodeAt(i++);
		if (p) {
			r.push((65536 + (p - 55296 << 10) + (c - 56320)).toString(16));
			p = 0;
		} else if (55296 <= c && c <= 56319) {
			p = c;
		} else {
			r.push(c.toString(16));
		}
	}
	return r.join("-");
}

const emoji_apis = {
	twemoji: (code) => "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/" + code.toLowerCase() + ".svg",
	openmoji: "https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/",
	blobmoji: "https://cdn.jsdelivr.net/npm/@svgmoji/blob@2.0.0/svg/",
	noto: "https://cdn.jsdelivr.net/gh/svgmoji/svgmoji/packages/svgmoji__noto/svg/",
	fluent: (code) => "https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/" + code.toLowerCase() + "_color.svg",
	fluentFlat: (code) => "https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/" + code.toLowerCase() + "_flat.svg"
};

function loadEmoji(code, type) {
	if (!type || !apis[type]) {
		type = DEFAULT_EMOJI_PROVIDER;
	}
	const api = apis[type];
	if (typeof api === "function") {
		return fetch(api(code));
	}
	return fetch(`${api}${code.toUpperCase()}.svg`);
}


export const loadDynamicAsset = ({ emoji }) => {
	const fn = async (code, text) => {
		if (code === "emoji") {
			return `data:image/svg+xml;base64,` + btoa(await (await loadEmoji(getIconCode(text), emoji)).text());
		}
	};

	return async (...args) => {
		return await fn(...args);
	};
}