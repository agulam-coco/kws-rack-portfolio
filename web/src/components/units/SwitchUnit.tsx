import { ports, stages } from "../../data/site";
import { cameraState } from "../../lib/cameraState";

type Port = (typeof ports)[number];

export default function SwitchUnit() {
    const go = (p: Port) => (e: React.MouseEvent<HTMLButtonElement>) => {
        // flash this port's LED (restart the animation if it's already running)
        const btn = e.currentTarget;
        btn.classList.remove("is-firing");
        void btn.offsetWidth;
        btn.classList.add("is-firing");

        if (p.cable === "") return; // spare port: blinks, goes nowhere

        // longer trips take a little longer, so far jumps don't feel like teleports
        const from = Math.round(cameraState.progress * (stages.length - 1));
        const to = stages.findIndex((s) => s.id === p.stage);
        const duration = Math.min(2.2, 0.9 + 0.25 * Math.abs(to - from));

        cameraState.goTo(p.stage, duration);
        cameraState.firePacket(p.cable, duration);
    };

    return (
        <section className="unit plate" data-stage="network">
            <nav className="switch" aria-label="Site navigation">
                <div className="brand"><b>JC-SG108</b><small>8-port gigabit</small></div>
                <div className="ports">
                    {ports.map((p) => (
                        <button
                            key={p.label}
                            className="port"
                            data-port={p.cable}
                            onClick={go(p)}
                            onAnimationEnd={(e) => e.currentTarget.classList.remove("is-firing")}
                            aria-label={p.cable === "" ? "Spare port" : `Go to ${p.label.toLowerCase()}`}
                        >
                            <span className="port-label">{p.label}</span>
                            <span className="jack"><i className="led" /></span>
                        </button>
                    ))}
                </div>
            </nav>
        </section>
    );
}