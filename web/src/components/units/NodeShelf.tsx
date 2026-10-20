import { nodes } from "../../data/projects";
import ServerNode from "./ServerNode";

export default function NodeShelf() {
    return (
        <section className="unit plate perf" data-stage="projects">
            <div className="bay">
                {nodes.map((p) => <ServerNode key={p.id} project={p} />)}
            </div>
        </section>
    );
}