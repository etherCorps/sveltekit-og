// vite-plugin-og-route-generator.ts

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';

// --- Configuration Constants ---
const PLUGIN_NAME = 'vite-plugin-og-route-generator';
const CONFIG_FILE_PATTERN = /^sveltekit\.og\.(ts|js)$/;
const SERVER_ROUTE_DIR = 'og.png';
const DEFAULT_ROUTES_DIR = 'src/routes';
const MANIFEST_FILE_PATH_STRING = '.svelte-kit/generated-og-images.json';

// --- Types ---
interface Manifest {
	files: string[];
	directories: string[];
}
interface ConfigFile {
	fullPath: string; // Absolute path to sveltekit.og.(ts|js)
	ext: string;      // .ts or .js
}

// --- Generation Helpers ---

function generateServerRouteContent(importPath: string): string {
	const finalImportPath = importPath.replace(/\\/g, '/');

	return `import { json } from '@sveltejs/kit';
import { ogMetadata } from '${finalImportPath}.js';
import { ImageResponse } from '@ethercorps/sveltekit-og';
export const prerender = true;
console.log('OG Metadata building');
/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) { 
  return json(ogMetadata);
}
`;
}


// --- Cleanup Logic (Pass 2 - Simplified to rely only on Manifest) ---

async function initialCleanup(root: string): Promise<void> {
	const manifestPath = path.resolve(root, MANIFEST_FILE_PATH_STRING);
	let filesToClean: Manifest = { files: [], directories: [] };
	let manifestWasUsed = false;

	// 1. Try to load list from manifest (fastest for cleaning up previous failed/interrupted runs)
	try {
		const manifestContent = await fs.readFile(manifestPath, 'utf-8');
		filesToClean = JSON.parse(manifestContent) as Manifest;
		manifestWasUsed = true;
	} catch (e) {
		// Ignore ENOENT (No manifest means clean start or final cleanup)
		if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
			console.error(`[${PLUGIN_NAME}] Error loading manifest:`, e);
			return;
		}
	}

	if (filesToClean.files.length === 0) return;

	console.log(`[${PLUGIN_NAME}] Cleaning up ${filesToClean.files.length} files from manifest...`);

	// Delete Files
	await Promise.all(filesToClean.files.map(p => fs.rm(p, { force: true })));

	// Delete Directories
	filesToClean.directories.sort((a, b) => b.localeCompare(a));
	await Promise.all(filesToClean.directories.map(d => fs.rm(d, { force: true, recursive: true })));

	// Only delete the manifest file if it existed and was used for cleanup
	if (manifestWasUsed) {
		await fs.rm(manifestPath, { force: true });
	}
}

// --- Discovery Helpers (used by Generation Logic) ---

async function discoverConfigFiles(root: string): Promise<ConfigFile[]> {
	const sveltekitRoutesDir = path.resolve(root, DEFAULT_ROUTES_DIR);
	const configFiles: ConfigFile[] = [];

	try {
		const entries = await fs.readdir(sveltekitRoutesDir, { withFileTypes: true, recursive: true });

		for (const entry of entries) {
			const fullPath = path.join(entry.path, entry.name);
			if (entry.isFile() && CONFIG_FILE_PATTERN.test(entry.name)) {
				const ext = path.extname(entry.name);
				configFiles.push({ fullPath, ext });
			}
		}
	} catch (e) {
		// Ignore ENOENT
	}
	return configFiles;
}


// --- Generation Logic (Pass 3 - Conflict Resolution) ---

async function generateRoutes(root: string): Promise<void> {
	const sveltekitRoutesDir = path.resolve(root, DEFAULT_ROUTES_DIR);
	const newManifest: Manifest = { files: [], directories: [] };
	const manifestPath = path.resolve(root, MANIFEST_FILE_PATH_STRING);

	const configFiles = await discoverConfigFiles(root);

	// 2. Generate files and collect paths
	for (const configFile of configFiles) {
		const routeDir = path.dirname(configFile.fullPath);
		const SERVER_ROUTE_FILE_NAME = `+server${configFile.ext}`;

		const newServerDirPath = path.join(routeDir, SERVER_ROUTE_DIR);
		const newServerFilePath = path.join(newServerDirPath, SERVER_ROUTE_FILE_NAME);

		// --- 🚨 CONFLICT RESOLUTION (CRITICAL FIX) ---
		// Delete the file with the *opposite* extension if it exists, because the
		// current config file dictates the extension we MUST use.
		const conflictingTsFile = path.join(newServerDirPath, '+server.ts');
		const conflictingJsFile = path.join(newServerDirPath, '+server.js');

		// If the config is .ts, the conflict is .js. If config is .js, the conflict is .ts.
		const conflictPath = configFile.ext === '.ts' ? conflictingJsFile : conflictingTsFile;

		try {
			console.log(`[${PLUGIN_NAME}] Resolving conflict: Deleting ${path.basename(conflictPath)} in ${path.basename(newServerDirPath)}.`);
			await fs.rm(conflictPath, { force: true });
		} catch (e) {
			// Ignore, the file might not exist (e.g., first run)
		}
		// --- END CONFLICT RESOLUTION ---

		await fs.mkdir(newServerDirPath, { recursive: true });

		const relativePathToConfigFile = path.relative(newServerDirPath, configFile.fullPath);
		const importPath = relativePathToConfigFile.replace(path.extname(relativePathToConfigFile), '');
		const content = generateServerRouteContent(importPath);

		await fs.writeFile(newServerFilePath, content, 'utf-8');

		newManifest.files.push(newServerFilePath);
		newManifest.directories.push(newServerDirPath);

		console.log(`[${PLUGIN_NAME}] Generated route: ${path.relative(root, newServerFilePath)}`);
	}

	// 3. Write the new manifest file
	const manifestDir = path.dirname(manifestPath);
	await fs.mkdir(manifestDir, { recursive: true });
	await fs.writeFile(manifestPath, JSON.stringify(newManifest, null, 2), 'utf-8');

	console.log(`[${PLUGIN_NAME}] Manifest written to ${path.relative(root, manifestPath)}`);
}

// --- The Vite Plugin ---

export function ogRouteGenerator(): Plugin {
	let root = '';

	return {
		name: PLUGIN_NAME,
		apply: 'build',

		configResolved(resolvedConfig) {
			root = resolvedConfig.root;
		},

		// 1. Build Start: Manifest Cleanup -> Generation (with conflict resolution)
		async buildStart() {
			await initialCleanup(root);
			await generateRoutes(root);
		},

		// 2. Build End: Final Cleanup (removes generated files and manifest)
		async closeBundle() {
			console.log(`[${PLUGIN_NAME}] Build finished. Starting final file cleanup.`);
			await initialCleanup(root);
		},

		// 3. Dev Server Hook
		configureServer(server: ViteDevServer) {
			const routesDir = path.resolve(root, DEFAULT_ROUTES_DIR);

			const reRunGeneration = async () => {
				await initialCleanup(root);
				await generateRoutes(root);
			};

			initialCleanup(root).then(reRunGeneration);

			server.watcher.on('all', async (event, filePath) => {
				const fileName = path.basename(filePath);

				if (filePath.startsWith(routesDir) && CONFIG_FILE_PATTERN.test(fileName)) {
					console.log(`[${PLUGIN_NAME}] Config file modified (${event}). Regenerating...`);
					await reRunGeneration();
				}
				if (filePath === path.resolve(root, MANIFEST_FILE_PATH_STRING)) {
					console.log(`[${PLUGIN_NAME}] Manifest file state changed. Recovering...`);
					await reRunGeneration();
				}
			});
		}
	};
}