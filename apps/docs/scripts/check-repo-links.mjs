// Fails the build if any content or built page links the repo at `main`: every repo link
// must pin the documented release tag (see src/site.ts and <RepoLink>).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
const roots = process.argv.slice(2);
const bad = /github\.com\/etherCorps\/sveltekit-og\/(tree|blob)\/main\b/i;
const hits = [];
const walk = (dir) => {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) walk(p);
		else if (/\.(mdx?|html|astro|ts)$/.test(name)) {
			readFileSync(p, "utf8").split("\n").forEach((line, i) => {
				if (bad.test(line)) hits.push(`${p}:${i + 1}`);
			});
		}
	}
};
for (const r of roots) walk(r);
if (hits.length) {
	console.error(`Repo links must pin a tag, not main (use <RepoLink path="…">):\n  ${hits.join("\n  ")}`);
	process.exit(1);
}
console.log(`check-repo-links: ${roots.join(", ")} clean`);
