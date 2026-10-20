import type { ComponentType } from "react";
import { Link, useParams } from "react-router";
import NotFound from "./NotFound";

// grabs every .mdx in content/projects, keyed by file path
const pages = import.meta.glob<{ default: ComponentType }>(
    "../content/projects/*.mdx",
    { eager: true }
);

export default function ProjectPage() {
    const { slug } = useParams();
    const page = pages[`../content/projects/${slug}.mdx`];
    if (!page) return <NotFound />;
    const Content = page.default;

    return (
        <article>
            <Link to="/">← back to rack</Link>
            <Content />
        </article>
    );
}