import type { Project } from "../../../data/projects";
import ProjectTarget from "../../project/ProjectTarget";

// Fader cap heights as a % of the slot, set by eye to look like a mix in progress.
const FADERS = [62, 40, 78, 30, 55];

export default function MixerUnit({ project }: { project: Project }) {
    return (
        <ProjectTarget project={project} className="mixer" style={{ "--accent": project.color } as React.CSSProperties}>
            <span className="mixer-face">
                <span className="faders">
                    {FADERS.map((level, i) => (
                        <span key={i} className="fader">
                            <i className="fader-cap" style={{ bottom: `${level}%` }} />
                        </span>
                    ))}
                </span>
                <span className="mixer-screen" />
            </span>
            <span className="unit-label">MIXER LIGHTS</span>
        </ProjectTarget>
    );
}