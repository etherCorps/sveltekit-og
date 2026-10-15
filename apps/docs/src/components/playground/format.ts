// Pretty-printer for the playground's OG markup: one element per line, two-space indent,
// and a `style` attribute broken into one declaration per line once a tag gets long.
// The engines strip newlines before parsing and trim each declaration, so the output
// renders identically to the one-line form.
//
// ponytail: regex tokenizer, no comments/CDATA/script handling — the templates are plain
// element + text markup. Reach for a real parser if that stops being true.

const VOID = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source']);
const WIDTH = 72;

type Tok = { kind: 'open' | 'close' | 'text'; raw: string; name?: string; attrs?: string; selfClosing?: boolean };

function tokenize(src: string): Tok[] {
	const out: Tok[] = [];
	const re = /<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s=>]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+)/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(src))) {
		if (m[1]) out.push({ kind: 'close', raw: m[0], name: m[1].toLowerCase() });
		else if (m[2]) out.push({ kind: 'open', raw: m[0], name: m[2].toLowerCase(), attrs: m[3].trim(), selfClosing: m[4] === '/' });
		else if (m[5].trim()) out.push({ kind: 'text', raw: m[5].replace(/\s+/g, ' ').trim() });
	}
	return out;
}

/** `style="a:b;c:d"` → multi-line declarations; other attributes untouched. */
function formatAttrs(attrs: string, indent: string): string {
	const parts = attrs.match(/[^\s=]+(?:=(?:"[^"]*"|'[^']*'|[^\s]+))?/g) ?? [];
	const lines = parts.map((a) => {
		const m = /^style=(["'])([\s\S]*)\1$/.exec(a);
		if (!m) return a;
		const decls = m[2]
			.split(';')
			.map((d) => d.replace(/\s*:\s*/, ': ').trim())
			.filter(Boolean);
		return `style="\n${decls.map((d) => `${indent}    ${d};`).join('\n')}\n${indent}  "`;
	});
	return lines.map((l) => `${indent}  ${l}`).join('\n');
}

export function formatHtml(src: string): string {
	const toks = tokenize(src);
	const out: string[] = [];
	let depth = 0;
	for (let i = 0; i < toks.length; i++) {
		const t = toks[i];
		const indent = '  '.repeat(depth);
		if (t.kind === 'close') {
			depth = Math.max(0, depth - 1);
			out.push(`${'  '.repeat(depth)}</${t.name}>`);
			continue;
		}
		if (t.kind === 'text') {
			out.push(indent + t.raw);
			continue;
		}
		const leaf = VOID.has(t.name!) || t.selfClosing;
		const next = toks[i + 1];
		// <tag attrs>text</tag> stays on one line when it fits
		const inlineText = !leaf && next?.kind === 'text' && toks[i + 2]?.kind === 'close' && toks[i + 2].name === t.name;
		const openShort = `<${t.name}${t.attrs ? ' ' + t.attrs : ''}${leaf && t.selfClosing ? ' /' : ''}>`;
		const oneLine = inlineText ? `${indent}${openShort}${next.raw}</${t.name}>` : indent + openShort;
		if (oneLine.length <= WIDTH) {
			out.push(oneLine);
			if (inlineText) i += 2;
			else if (!leaf) depth++;
			continue;
		}
		out.push(`${indent}<${t.name}`);
		if (t.attrs) out.push(formatAttrs(t.attrs, indent));
		out.push(`${indent}${leaf && t.selfClosing ? '/>' : '>'}`);
		if (!leaf) depth++;
	}
	return out.join('\n');
}
