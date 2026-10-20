export type Project = {
    id: string;                 // URL slug + cable id
    name: string;
    shelf: "nodes" | "builds";
    color: string;
    event?: string;
    summary: string;
    tags: string[];
    preview?: string;           // image path for the hover card
    action: { type: "external"; href: string; label: "GitHub" | "Live" } | { type: "writeup" };
    readMore?: boolean;
};

export const projects: Project[] = [
    {
        id: "watch-my-tokens", name: "Watch My Tokens", shelf: "nodes", color: "#e3342f",
        event: "ShellHacks 2026 · with Robert Cifuentes",
        summary: "A tiny screen on your monitor showing what your AI agents are doing, with a real button to approve risky actions.",
        tags: ["ESP32-C3", "Hardware", "Claude Code"],
        action: { type: "external", href: "https://www.github.com/agulam-coco/watch-my-tokens", label: "Live" },
    },
    {
        id: "fissure", name: "Fissure", shelf: "nodes", color: "#f59e0b",
        event: "Hack Dearborn 2026 · solo",
        summary: "Clusters NHTSA complaints by meaning to catch vehicle defects before the recall does.",
        tags: ["Python", "IBM watsonx", "Data"],
        action: { type: "external", href: "https://fissure-xi.vercel.app", label: "Live" },
        readMore: true,
    },
    {
        id: "freesound", name: "Freesound", shelf: "nodes", color: "#22c55e",
        event: "Grinnell College",
        summary: "The website for Freesound, the student music community I run.",
        tags: ["React", "Vite", "Express"],
        action: { type: "writeup" },
    },
    {
        id: "guitars", name: "Guitars", shelf: "builds", color: "#a855f7",
        summary: "TODO", tags: ["Music"], action: { type: "writeup" },
    },
    {
        id: "server-rack", name: "Server Rack", shelf: "builds", color: "#14b8a6",
        summary: "My homelab and the rack this site is based on.",
        tags: ["Raspberry Pi", "Linux"], action: { type: "writeup" },
    },
];

export const nodes = projects.filter((p) => p.shelf === "nodes");
export const builds = projects.filter((p) => p.shelf === "builds");
export const getProject = (id: string) => projects.find((p) => p.id === id);