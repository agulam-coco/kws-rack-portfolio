import { getProject } from "../../data/projects";
import AmpHead from "./builds/AmpHead";
import PiUnit from "./builds/PiUnit";

export default function BuildsShelf() {
    return (
        <section className="unit plate builds" data-stage="builds">
            <span className="tag">BUILDS</span>
            <AmpHead project={getProject("guitars")!} />
            <PiUnit project={getProject("server-rack")!} />
        </section>
    );
}