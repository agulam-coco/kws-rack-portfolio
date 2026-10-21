import { useState } from "react";
import { Link } from "react-router";
import { primaryAction, hasWriteup, previewImages, type Project } from "../../data/projects";

export default function PreviewCard({ project }: { project: Project }) {
    const action = primaryAction(project);
    const showReadMore = project.readMore && action.external;

    // try each image in order; if one fails to load, use the next.
    // if none work, the placeholder shows instead.
    const images = previewImages(project);
    const [imgIndex, setImgIndex] = useState(0);
    const img = images[imgIndex];

    return (
        <div className="preview-card" style={{ "--accent": project.color } as React.CSSProperties}>
            <div className="pc-media">
                {img ? (
                    <img src={img} alt="" loading="lazy" onError={() => setImgIndex((i) => i + 1)} />
                ) : (
                    // placeholder until there's a screenshot
                    <div className="pc-placeholder"><span>{project.name}</span></div>
                )}
            </div>

            <div className="pc-body">
                <h3 className="pc-title">{project.name}</h3>
                {project.event && <p className="pc-event">{project.event}</p>}
                <p className="pc-summary">{project.summary}</p>
                <ul className="pc-tags">
                    {project.tags.map((t) => <li key={t}>{t}</li>)}
                </ul>
            </div>

            <div className="pc-actions">
                {action.external ? (
                    <a className="pc-primary" href={action.href} target="_blank" rel="noopener noreferrer">{action.label}</a>
                ) : (
                    <Link className="pc-primary" to={action.href} target="_blank" rel="noopener noreferrer">{action.label}</Link>)}
                {showReadMore && hasWriteup(project) && (
                    <Link className="pc-secondary" to={`/projects/${project.id}`} target="_blank" rel="noopener noreferrer">Read the write-up →</Link>)}
            </div>
        </div>
    );
}