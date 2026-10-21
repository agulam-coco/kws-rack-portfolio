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
        if (project) document.title = `${project.name} · ${person.name}`;
        return () => { document.title = person.name; };
    }, [project]);

    if (!project) return <NotFound />;
    const { github, live } = project.links ?? {};

    return (
        <main className="writeup" style={{ "--accent": project.color } as CSSProperties}>
            <Link className="wu-back" to="/">← back to the rack</Link>

            <header className="wu-head">
                {project.event && <p className="wu-event">{project.event}</p>}
                <h1>{project.name}</h1>
                <p className="wu-summary">{project.summary}</p>

                <ul className="wu-tags">
                    {project.tags.map((t) => <li key={t}>{t}</li>)}
                </ul>

                {(github || live) && (
                    <p className="wu-links">
                        {live && <a href={live} target="_blank" rel="noopener noreferrer">Live site ↗</a>}
                        {github && <a href={github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
                    </p>
                )}
            </header>

            <article className="wu-body">
                {load ? (Content ? <Content /> : null) : <p className="wu-soon">Write-up coming soon.</p>}
            </article>
        </main>
    );
}