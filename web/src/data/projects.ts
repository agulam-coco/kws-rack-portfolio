import { generatedPreviews } from "./previews.generated.ts";

export type Project = {
    id: string;                 // URL slug + cable id
    name: string;
    shelf: "nodes" | "builds";
    color: string;
    event?: string;
    summary: string;
    tags: string[];
    preview?: string;           // image path for the hover card
    links?: { github?: string; live?: string };
    // A write-up is just a file: src/content/projects/<id>.mdx
    // If it exists, clicking the project opens it, and its header links to
    // GitHub / the live site. If not, clicking goes to live, then GitHub.
};

export const projects: Project[] = [
    {
        id: "watch-my-tokens", name: "Watch My Tokens", shelf: "nodes", color: "#e3342f",
        event: "ShellHacks 2026",
        summary: "A tiny screen on your monitor showing what your AI agents are doing, with a real button to approve risky actions.",
        tags: ["ESP32-C3", "Hardware", "Claude Code"],
        links: { github: "https://github.com/agulam-coco/watch-my-tokens" },
    },
    {
        id: "fissure", name: "Fissure", shelf: "nodes", color: "#f59e0b",
        event: "Hack Dearborn 2026",
        summary: "Clusters NHTSA complaints by meaning to catch vehicle defects before the recall does.",
        tags: ["Python", "IBM watsonx", "Data"],
        links: { live: "https://fissure-xi.vercel.app", github: "https://github.com/agulam-coco/fissure" },
    },
    {
        id: "freesound", name: "Freesound", shelf: "nodes", color: "#22c55e",
        event: "Grinnell College",
        summary: "Grinnell's student music group. I help run it and built the website.",
        tags: ["React", "Vite", "Express"],
        links: { live: "https://freesound.us.reclaim.cloud/" },
    },
    {
        id: "guitars", name: "Music", shelf: "builds", color: "#a855f7",
        summary: "Bass and guitar. Mostly improv, mostly loud.",
        tags: ["Bass", "Guitar", "Improv"],
        preview: "/media/previews/guitars-card.jpg",
    },
    {
        id: "server-rack", name: "Server Rack", shelf: "builds", color: "#14b8a6",
        summary: "My homelab and the rack this site is based on.",
        tags: ["Raspberry Pi", "Linux"],
        preview: "/media/previews/server-rack-card.jpg",
    },
];

export const nodes = projects.filter((p) => p.shelf === "nodes");
export const builds = projects.filter((p) => p.shelf === "builds");
export const getProject = (id: string) => projects.find((p) => p.id === id);

// "owner/name" from the GitHub link, for the preview images
export function repoOf(p: Project) {
    const m = p.links?.github?.match(/github\.com\/([^/]+\/[^/#?]+)/);
    return m ? m[1] : undefined;
}

// images for the hover card, best first. The card tries each in order.
export function previewImages(p: Project) {
    const saved = generatedPreviews[p.id] ?? {};
    const list: string[] = [];
    if (p.preview) list.push(p.preview);       // one you picked yourself
    if (saved.live) list.push(saved.live);     // screenshot of the live site
    if (saved.social) list.push(saved.social); // your custom GitHub social preview
    const repo = repoOf(p);
    if (repo) list.push(`https://opengraph.githubassets.com/1/${repo}`); // GitHub's auto card
    return list;
}

