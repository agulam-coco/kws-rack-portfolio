import type { Project } from "../../../data/projects";
import ProjectTarget from "../../project/ProjectTarget";

export default function AmpHead({ project }: { project: Project }) {
    return (
        <ProjectTarget project={project} className="amp" style={{ "--accent": project.color } as React.CSSProperties}>
            <span className="grille-cloth" />
            <span className="knobs">
                {[0, 1, 2, 3, 4].map((i) => <span key={i} className="knob" />)}
                <i className="jewel" />
            </span>
            <span className="unit-label">GUITARS</span>
        </ProjectTarget>
    );
}