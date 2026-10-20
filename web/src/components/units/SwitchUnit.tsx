import { ports } from "../../data/site";

export default function SwitchUnit() {
    return (
        <section className="unit plate" data-stage="network">
            <nav className="switch">
                <div className="brand"><b>JC-SG108</b><small>8-port gigabit</small></div>
                <div className="ports">
                    {ports.map((p) => (
                        <button key={p.cable} className="port" data-port={p.cable} aria-label={`Go to ${p.label}`}>
                            <span className="port-label">{p.label}</span>
                            <span className="jack"><i className="led" /></span>
                        </button>
                    ))}
                </div>
            </nav>
        </section>
    );
}