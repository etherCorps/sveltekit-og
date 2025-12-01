import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { docs } from '../.velite/index.js';

/**
 * The base URL of your application. This is mandatory for sitemap compliance.
 * @type {string}
 */
const BASE_URL = 'https://sveltekit-og.dev';

/**
 * The output path for the sitemap file.
 * 'static' is the standard directory SvelteKit serves statically.
 * @type {string}
 */
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUTPUT_FILE = resolve(__dirname, '../static/sitemap.xml');

/**
 * @typedef {object} RouteData
 * @property {string} href - The relative path of the route (e.g., '/docs/intro').
 * @property {string} lastmod - The last modification date (YYYY-MM-DD).
 */

/**
 * Retrieves the documentation route data.
 * Replace this mock with your actual data source logic
 * (e.g., importing the generated array from your build/content pipeline).
 * * @returns {RouteData[]} An array of route objects.
 */
function getDocumentationRoutes() {
	const currentDate = new Date().toISOString().split('T')[0];
	return docs.map((doc) => ({
		title: doc.title,
		href: `/docs/${doc.slug}`,
		lastmod: doc.lastModified?.split('T')[0] ?? currentDate,
	}));
}

/**
 * Generates the XML content for a single URL entry.
 * * @param {string} loc - The full, absolute URL.
 * @param {('always'|'hourly'|'daily'|'weekly'|'monthly'|'yearly'|'never')} changefreq - The change frequency.
 * @param {number} priority - The priority (0.0 to 1.0).
 * @param {string} [lastmod] - Optional date of last modification (YYYY-MM-DD).
 * @returns {string} The XML <url> entry string.
 */
function createUrlEntry(loc, changefreq, priority, lastmod) {
	let xml = `<url>\n  <loc>${loc}</loc>\n  <changefreq>${changefreq}</changefreq>\n  <priority>${priority.toFixed(1)}</priority>\n`;
	if (lastmod) {
		xml += `  <lastmod>${lastmod}</lastmod>\n`;
	}
	xml += `</url>\n`;
	return xml;
}

/**
 * Constructs the full sitemap XML content and writes it to the file system.
 */
function generateSitemap() {
	let xml = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
	xml += `<urlset\n  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n`;

	const docRoutes = getDocumentationRoutes();

	docRoutes.forEach((route) => {
		const isBaseDoc = route.href === '/docs/index';
		const loc = isBaseDoc ? `${BASE_URL}/docs` : `${BASE_URL}${route.href}`;
		const lastMod = route.lastmod;
			xml += createUrlEntry(loc, 'weekly', isBaseDoc ? 1 : 0.8, lastMod);
	});

	xml += `</urlset>`;

	try {
		writeFileSync(OUTPUT_FILE, xml, 'utf-8');
		console.log(`✅ Successfully generated sitemap: ${OUTPUT_FILE}`);
	} catch (error) {
		console.error(`❌ Failed to write sitemap to ${OUTPUT_FILE}:`, error);
	}
}

generateSitemap();
