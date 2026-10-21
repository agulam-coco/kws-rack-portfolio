// Saves preview images for the hover cards:
//   - a screenshot of every project with a live site
//   - your custom GitHub "Social preview" image for every project with a repo
// Run with:  npm run previews
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { projects, repoOf } from "../src/data/projects.ts";

const OUT = fileURLToPath(new URL("../public/media/previews/", import.meta.url));
const MAP = fileURLToPath(new URL("../src/data/previews.generated.ts", import.meta.url));
const GITHUB = process.env.GITHUB_BASE ?? "https://github.com";

const found: Record<string, { live?: string; social?: string }> = {};
await mkdir(OUT, { recursive: true });

// ---------- 1. custom GitHub social previews ----------
for (const p of projects) {
    const repo = repoOf(p);
    if (!repo) continue;
    try {
        const html = await (await fetch(`${GITHUB}/${repo}`, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
        const url = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
        // custom uploads live on repository-images.githubusercontent.com;
        // anything else is GitHub's auto-generated card, which the site already falls back to
        if (!url || !url.includes("repository-images")) {
            console.log(`${p.name}: no custom social preview set on GitHub`);
            continue;
        }
        const res = await fetch(url);
        const ext = (res.headers.get("content-type") ?? "image/png").split("/")[1].replace("jpeg", "jpg");
        await writeFile(`${OUT}${p.id}-social.${ext}`, Buffer.from(await res.arrayBuffer()));
        found[p.id] = { ...found[p.id], social: `/media/previews/${p.id}-social.${ext}` };
        console.log(`${p.name}: saved GitHub social preview`);
    } catch (err) {
        console.log(`${p.name}: couldn't get the GitHub preview (${(err as Error).message})`);
    }
}

// ---------- 2. screenshots of live sites ----------
const live = projects.flatMap((p) =>
    p.links?.live ? [{ id: p.id, name: p.name, url: p.links.live }] : []);
if (live.length) {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } }); // 16:9 like the card
    for (const p of live) {
        try {
            await page.goto(p.url, { waitUntil: "networkidle", timeout: 30_000 });
            await page.waitForTimeout(1500); // let animations settle
            await page.screenshot({ path: `${OUT}${p.id}.jpg`, type: "jpeg", quality: 82 });
            found[p.id] = { ...found[p.id], live: `/media/previews/${p.id}.jpg` };
            console.log(`${p.name}: saved live site screenshot`);
        } catch (err) {
            console.log(`${p.name}: screenshot failed (${(err as Error).message.split("\n")[0]})`);
        }
    }
    await browser.close();
}

// ---------- 3. tell the site what we saved ----------
await writeFile(
    MAP,
    `// Written by \`npm run previews\`. Don't edit by hand.\n` +
    `export const generatedPreviews: Record<string, { live?: string; social?: string }> = ${JSON.stringify(found, null, 2)};\n`
);
console.log("done");