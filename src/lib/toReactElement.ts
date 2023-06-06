import { parse, walk } from 'svelte/compiler';
import type { Ast } from 'svelte/types/compiler/interfaces';

/* Start of code from satori-html for cssToObject converter*/
const camelize = (ident: string) => ident.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
const cssToObject = (str: string) => {
	const obj: Record<string, string> = {};
	let t = 0;
	let pair = ['', ''];
	const flags: Record<string, number> = {};
	for (const c of str) {
		if (!flags['('] && c === ':') {
			t = 1;
		} else if (c === ';') {
			const [decl = '', value = ''] = pair;
			obj[camelize(decl.trim())] = value.trim();
			t = 0;
			pair = ['', ''];
		} else {
			pair[t] += c;
			switch (c) {
				case '(': {
					flags[c]++;
					break;
				}
				case ')': {
					flags['(']--;
					break;
				}
			}
		}
	}
	const [decl = '', value = ''] = pair;
	if (decl.trim() && value.trim()) {
		obj[camelize(decl.trim())] = value.trim();
	}

	return obj;
};
const nodeMap = new WeakMap();
interface VNode {
	type: string;
	props: {
		style?: Record<string, any>;
		children?: string | VNode | VNode[];
		[prop: string]: any;
	};
}
const root: VNode = {
	type: 'div',
	props: {
		style: {
			display: 'flex',
			flexDirection: 'column',
			width: '100%',
			height: '100%'
		},
		children: []
	}
};
/* End of satori-html */

export const toReactElement = (htmlString: string): VNode => {
	const svelteAST: Ast = parse(htmlString);
	walk(svelteAST, {
		enter(node: any, parent: any, prop: any, index: any) {
			let newNode: any = {};
			if (node.type === 'Fragment') {
				nodeMap.set(node, root);
			} else if (node.type === 'Element') {
				newNode.type = node.name;
				const { ...props } = node.attributes;
				if (node.attributes.length > 0) {
					node.attributes.forEach((attribute: any) => {
						if (attribute.name === 'style') {
							props['style'] = cssToObject(attribute.value[0].data) as any;
						} else props[attribute.name] = attribute.value[0].data as any;
					});
					delete props[0];
				}
				props.children = [] as unknown as string;
				Object.assign(newNode, { props });
				nodeMap.set(node, newNode);
				if (parent) {
					const newParent = nodeMap.get(parent);
					newParent.props.children[index] = newNode;
				}
			} else if (node.type === 'Text') {
				newNode = node.data.trim();
				if (newNode) {
					if (parent && parent.type !== 'Attribute') {
						const newParent = nodeMap.get(parent);
						if (parent.children.length === 1) {
							newParent.props.children = newNode;
						} else {
							newParent.props.children[index] = newNode;
						}
					}
				}
			}
		}
	});

	return root;
};

export default toReactElement;
