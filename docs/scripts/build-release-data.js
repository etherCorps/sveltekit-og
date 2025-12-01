import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PACKAGE_NAME = '@ethercorps/sveltekit-og';
const NPM_REGISTRY_URL = `https://registry.npmjs.org/${PACKAGE_NAME}`;
const TARGET_FILE_PATH = resolve(__dirname, '../src/lib/release.json');
const NPM_DOWNLOADS_URL = `https://api.npmjs.org/downloads/point/last-month/${PACKAGE_NAME}`;

/**
 * Fetches the npm release data for the target package.
 * It filters the massive registry response down to essential metadata,
 * and includes the full version history timestamps and total count.
 * @returns {Promise<object>} A promise that resolves with the concise release data.
 */
export async function buildNpmReleaseData() {
	console.log(`Fetching data from ${NPM_REGISTRY_URL}...`);
	try {
		const [registryResponse, downloadsResponse] = await Promise.all([
			fetch(NPM_REGISTRY_URL),
			fetch(NPM_DOWNLOADS_URL)
		]);

		// 1. Process Registry Metadata Response
		if (!registryResponse.ok) {
			throw new Error(
				`Registry HTTP Error: ${registryResponse.status} ${registryResponse.statusText}`
			);
		}
		const data = await registryResponse.json();

		// 2. Process Downloads Response
		let monthlyDownloads = 0;
		if (downloadsResponse.ok) {
			const downloadsData = await downloadsResponse.json();
			// The API returns the total downloads for the package in the 'downloads' field
			monthlyDownloads = downloadsData.downloads || 0;
		} else {
			console.warn(
				`\nWarning: Could not fetch weekly downloads. Status: ${downloadsResponse.status}`
			);
		}

		// Extract key fields
		const { 'dist-tags': distTags, versions, time, name } = data;

		const latestVersion = distTags.latest;
		const latestRelease = versions[latestVersion];

		if (!latestRelease) {
			throw new Error(`Could not find version data for 'latest' tag: ${latestVersion}`);
		}

		// --- Removed console logging for time and versions, now included in return object ---

		// Return a structured object with essential release details
		return {
			name,
			latestVersion,
			monthlyDownloads,
			// NEW: Total count of all published versions
			versionCount: Object.keys(versions).length,
			// NEW: Full time map, containing timestamp for every version published
			time: time,
			// Metadata for the latest published version
			latestRelease: {
				date: time[latestVersion],
				tarball: latestRelease.dist.tarball,
				shasum: latestRelease.dist.shasum,
				dependencies: latestRelease.dependencies || {}
			},
			distTags
		};
	} catch (error) {
		console.error(`\n--- Error fetching NPM data for ${PACKAGE_NAME} ---\n`, error.message);
		// Return an empty object on failure to allow the script to exit gracefully
		return {};
	}
}

// Immediately Invoked Async Function Expression (IIFE) to run the build process
(async () => {
	try {
		const releaseData = await buildNpmReleaseData();

		// Check if meaningful data was returned
		if (Object.keys(releaseData).length > 0) {
			console.log(`\nSuccessfully fetched latest version: ${releaseData.latestVersion}`);

			// Write the file asynchronously with JSON formatting (2 spaces)
			await writeFile(TARGET_FILE_PATH, JSON.stringify(releaseData, null, 2), { flag: 'w' });

			console.log(`\n✅ Release data successfully written to ${TARGET_FILE_PATH}`);
		} else {
			console.log('\n⚠️ Skipping file write due to errors or missing data.');
		}
	} catch (error) {
		console.error('\n--- An unexpected error occurred during file operation ---\n', error);
		process.exit(1); // Exit with error code
	}
})();
