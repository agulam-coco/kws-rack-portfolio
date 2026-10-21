import type { ComponentType } from "react";
import type { Project } from "../data/projects";

// Every write-up in content/projects, loaded only when you open it.
// (Kept out of data/projects.ts because import.meta.glob only works in Vite,
// and scripts/previews.ts imports that file from plain Node.)
type Loader = () => Promise<{ default: ComponentType }>;
const files: Record<string, Loader | undefined> = import.meta.glob<{ default: ComponentType }>("../content/projects/*.mdx");

export const loadWriteup = (id: string) => files[`../content/projects/${id}.mdx`];
export const hasWriteup = (p: Project) => !!loadWriteup(p.id);

// Where clicking a project goes: the write-up if there is one, otherwise the
// live site, otherwise GitHub. A project with none of those still gets its
// page, which says the write-up is coming.
export function primaryAction(p: Project) {
    if (hasWriteup(p)) return { href: `/projects/${p.id}`, external: false, label: "Read the write-up →" };
    if (p.links?.live) return { href: p.links.live, external: true, label: "Open live site ↗" };
    if (p.links?.github) return { href: p.links.github, external: true, label: "View on GitHub ↗" };
    return { href: `/projects/${p.id}`, external: false, label: "Read the write-up →" };
}