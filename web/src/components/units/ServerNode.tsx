import type { Project } from "../../data/projects";

export default function ServerNode({ project }: { project: Project }) {
    return (
        <div className="node" style={{ "--accent": project.color } as React.CSSProperties}>
            <span className="rj45" data-jack={project.id} />
            <span className="node-name">{project.name.toUpperCase()}</span>
            <span className="stripe" />
            <span className="usb" /><span className="usb" />
            <span className="audio" /><span className="audio" />
            <i className="led" />
        </div>
    );
}