import { defineConfig, defineSchema, s } from 'velite';
import { stat } from 'node:fs/promises';

const timestamp = defineSchema(() =>
	s
		.custom((i) => i === undefined || typeof i === 'string')
		.transform(async (value, { meta, addIssue }) => {
			if (value != null) {
				addIssue({
					fatal: false,
					code: 'custom',
					message: '`s.timestamp()` schema will resolve the file modified timestamp'
				});
			}

			const stats = await stat(meta.path);
			return stats.mtime.toISOString();
		})
);

const baseSchema = s.object({
	title: s.string(),
	description: s.string(),
	path: s.path(),
	content: s.markdown(),
	navLabel: s.string().optional(),
	raw: s.raw(),
	toc: s.toc(),
	section: s.enum(['Overview', 'Runtime', 'Usage', 'Utilities', 'Examples', 'Advanced Usage']),
	lastModified: timestamp(),
	priority: s.number().optional()
});

const docSchema = baseSchema.transform((data) => {
	return {
		...data,
		slug: data.path,
		slugFull: `/${data.path}`
	};
});

export default defineConfig({
	root: './src/content',
	collections: {
		docs: {
			name: 'Doc',
			pattern: './**/*.md',
			schema: docSchema
		}
	}
});
