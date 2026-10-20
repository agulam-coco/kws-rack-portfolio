import type { Project } from "../../data/projects";

export default function ServerNode({ project }: { project: Project }) {
    return (
        <div className="node" style={{ "--accent": project.color } as React.CSSProperties}>
            <span className="rj45" data-jack={project.id} />

            {/* top half: hex mesh vent with the name printed on it */}
            <div className="node-top">
                <span className="node-name">{project.name}</span>
            </div>

            {/* the colored band between mesh and body */}
            <span className="node-band" />

            {/* bottom half: front I/O */}
            <div className="node-bottom">
                <span className="usb" />
                <span className="usb" />
                <span className="audio" />
                <span className="audio" />
                <span className="power"><i className="led" /></span>
            </div>
        </div>
    );
}