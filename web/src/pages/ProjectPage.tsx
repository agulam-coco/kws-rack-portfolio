import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import { Link, useParams } from "react-router";
import { getProject } from "../data/projects";
import { person } from "../data/site";
import { loadWriteup } from "../lib/writeups";
import NotFound from "./NotFound";

// /projects/:slug. The header (name, event, tags, GitHub / live links) comes
// from data/projects.ts, so each .mdx file is just the story.
export default function ProjectPage() {
    const { slug = "" } = useParams();
    const project = getProject(slug);
    const load = loadWriteup(slug);
    const [Content, setContent] = useState<ComponentType | null>(null);

    useEffect(() => {
        setContent(null);
        if (!load) return;
        let alive = true;
        load().then((m) => { if (alive) setContent(() => m.default); });
        return () => { alive = false; };
    }, [load]);

    useEffect(() => {
        if (!project) return;
        // per-page title, description and canonical for Google (it runs JS)
        const desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        const canon = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        const before = { title: document.title, desc: desc?.content, canon: canon?.href };
        document.title = `${project.name} · ${person.name}`;
        if (desc) desc.content = project.summary;
        if (canon) canon.href = `https://jasonchigabatia.com/projects/${project.id}`;
        return () => {
            document.title = before.title;
            if (desc && before.desc) desc.content = before.desc;
            if (canon && before.canon) canon.href = before.canon;
        };
    }, [project]);

    if (!project) return <NotFound />;
    const { github, live } = project.links ?? {};

    return (
        <main className="writeup" style={{ "--accent": project.color } as CSSProperties}>
            <div className="wu-sheet">
                <Link className="wu-back" to="/">← back</Link>

                <header className="wu-head">
                    <h1>{project.name}</h1>
                    <p className="wu-summary">{project.summary}</p>
                    <p className="wu-meta">
                        {[project.event, project.tags.join(", ")].filter(Boolean).join(" · ")}
                        {live && <a href={live} target="_blank" rel="noopener noreferrer">live site ↗</a>}
                        {github && <a href={github} target="_blank" rel="noopener noreferrer">github ↗</a>}
                    </p>
                </header>

                <article className="wu-body">
                    {load ? (Content ? <Content /> : null) : <p className="wu-soon">Write-up coming soon.</p>}
                </article>
            </div>
        </main>
    );
}
