import type { Project } from "../../data/projects";
import ProjectTarget from "../project/ProjectTarget";

export default function ServerNode({ project }: { project: Project }) {
    return (
        <ProjectTarget project={project} className="node" style={{ "--accent": project.color } as React.CSSProperties}>
            <span className="rj45" data-jack={project.id} />

            {/* top half: hex mesh vent with the name printed on it */}
            <span className="node-top">
                <span className="node-name">{project.name}</span>
            </span>

            {/* the colored band between mesh and body */}
            <span className="node-band" />

            {/* bottom half: front I/O */}
            <span className="node-bottom">
                <span className="usb" />
                <span className="usb" />
                <span className="audio" />
                <span className="audio" />
                <span className="power"><i className="led" /></span>
            </span>
        </ProjectTarget>
    );
}