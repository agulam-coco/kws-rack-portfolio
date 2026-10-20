import { builds } from "../../data/projects";
import AmpHead from "./builds/AmpHead";
import PiUnit from "./builds/PiUnit";

export default function BuildsShelf() {
    const color = (id: string) => builds.find((b) => b.id === id)?.color ?? "#999";
    return (
        <section className="unit plate builds" data-stage="builds">
            <span className="tag">BUILDS</span>
            <AmpHead color={color("guitars")} />
            <PiUnit color={color("server-rack")} />
        </section>
    );
}