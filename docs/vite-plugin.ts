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
	ext: string; // .ts or .js
}

interface Entry {
	"name": string,
	"parentPath": string,
	"path": string
}

// --- Generation Helpers ---

function generateServerRouteContent(): string {
	return `import { ogMetadata } from "../sveltekit.og.js";
import { createOgImageHandler } from "$lib/og-image.js";
export const prerender = true;
export const GET = createOgImageHandler(ogMetadata);`;
}

// --- Cleanup Logic ---

async function initialCleanup(root: string): Promise<void> {
	const manifestPath = path.resolve(root, MANIFEST_FILE_PATH_STRING);
	let filesToClean: Manifest = { files: [], directories: [] };
	let manifestWasUsed = false;

	try {
		const manifestContent = await fs.readFile(manifestPath, 'utf-8');
		filesToClean = JSON.parse(manifestContent) as Manifest;
		manifestWasUsed = true;
	} catch (e) {
		if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
			console.error(`[${PLUGIN_NAME}] Error loading manifest:`, e);
			return;
		}
	}

	if (filesToClean.files.length === 0) return;

	console.log(`[${PLUGIN_NAME}] Cleaning up ${filesToClean.files.length} files from manifest...`);

	await Promise.all(filesToClean.files.map((p) => fs.rm(p, { force: true })));

	filesToClean.directories.sort((a, b) => b.localeCompare(a));
	await Promise.all(
		filesToClean.directories.map((d) => fs.rm(d, { force: true, recursive: true }))
	);

	if (manifestWasUsed) {
		await fs.rm(manifestPath, { force: true });
	}
}

// --- Discovery & Generation Logic ---

async function discoverConfigFiles(root: string): Promise<ConfigFile[]> {
	const sveltekitRoutesDir = path.resolve(root, DEFAULT_ROUTES_DIR);
	const configFiles: ConfigFile[] = [];

	try {
		const entries = await fs.readdir(sveltekitRoutesDir, { withFileTypes: true, recursive: true });
		if (entries.length > 0) {
			for (const entry of entries) {
				if ('path' in entry) {
					const fullPath = path.join(entry.path as string, entry.name);
					if (entry.isFile() && CONFIG_FILE_PATTERN.test(entry.name)) {
						const ext = path.extname(entry.name);
						configFiles.push({ fullPath, ext });
					}
				}
			}
		}
	} catch (e) {
		throw new Error('src/routes directory not found.');
		// Ignore ENOENT if src/routes doesn't exist
	}
	return configFiles;
}

async function resolveExtensionConflict(serverDirPath: string, requiredExt: string): Promise<void> {
	const conflictExt = requiredExt === '.ts' ? '.js' : '.ts';
	const conflictPath = path.join(serverDirPath, `+server${conflictExt}`);
	try {
		// This is a silent cleanup to prevent Vite from finding both +server.ts and +server.js.
		// The "Generated route" log that follows is sufficient feedback for the user.
		await fs.rm(conflictPath, { force: true });
	} catch (e) {
		throw new Error('Unexpected error during extension conflict resolution: ' + (e as Error).message);
	}
}

async function generateRoutes(root: string): Promise<void> {
	const newManifest: Manifest = { files: [], directories: [] };
	const manifestPath = path.resolve(root, MANIFEST_FILE_PATH_STRING);

	const configFiles = await discoverConfigFiles(root);

	for (const configFile of configFiles) {
		const routeDir = path.dirname(configFile.fullPath);
		const serverRouteFileName = `+server${configFile.ext}`;

		const newServerDirPath = path.join(routeDir, SERVER_ROUTE_DIR);
		const newServerFilePath = path.join(newServerDirPath, serverRouteFileName);

		await resolveExtensionConflict(newServerDirPath, configFile.ext);

		await fs.mkdir(newServerDirPath, { recursive: true });
		const content = generateServerRouteContent();

		await fs.writeFile(newServerFilePath, content, 'utf-8');

		newManifest.files.push(newServerFilePath);
		newManifest.directories.push(newServerDirPath);

		console.log(`[${PLUGIN_NAME}] Generated route: ${path.relative(root, newServerFilePath)}`);
	}

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

		configResolved(resolvedConfig) {
			root = resolvedConfig.root;
		},

		async buildStart() {
			await initialCleanup(root);
			await generateRoutes(root);
		},

		async closeBundle() {
			console.log(`[${PLUGIN_NAME}] Build finished. Starting final file cleanup.`);
			await initialCleanup(root);
		},

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
