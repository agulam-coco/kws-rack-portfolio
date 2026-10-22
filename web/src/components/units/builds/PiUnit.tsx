import type { Project } from "../../../data/projects";
import ProjectTarget from "../../project/ProjectTarget";

export default function PiUnit({ project }: { project: Project }) {
    return (
        <ProjectTarget project={project} className="pi" style={{ "--accent": project.color } as React.CSSProperties}>
            <span className="rj45" data-jack="builds" />
            <span className="pi-face">
                <span className="pi-vents" />
                <span className="oled">
                    <b>otter</b>
                    <span>up 12d, 41°C</span>
                </span>
                <span className="pi-leds">
                    <i className="led" />
                    <i className="led act" />
                </span>
            </span>
            <span className="unit-label">SERVER RACK</span>
        </ProjectTarget>
    );
}
