import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { about, person, ports, stages } from "../data/site";
import { cameraState, jumpTo, onStageChange } from "../lib/cameraState";

const ROW = 30; // px per stage on the rail (keep in sync with --row in hud.css)

// Plain text in the corners, no panel: your name and a short about up top,
// and a rail bottom left like the U-numbers on a rack. The green marker rides
// the rail as you scroll, and clicking a row jumps there.
export default function Hud({ show }: { show: boolean }) {
    const [i, setI] = useState(cameraState.stage);
    const marker = useRef<HTMLSpanElement>(null);

    useEffect(() => onStageChange(setI), []);

    // move the marker every frame from the real scroll progress, so it slides
    // continuously instead of jumping row to row
    useEffect(() => {
        const tick = () => {
            const y = cameraState.progress * (stages.length - 1) * ROW;
            if (marker.current) marker.current.style.transform = `translateY(${y}px)`;
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
    }, []);

    return (
        <div className={`hud${show ? " is-on" : ""}`}>
            <header className="hud-intro">
                <p className="hud-who">
                    <b>{person.name}</b>
                    <span>{person.role}</span>
                </p>
                <div className="hud-about">
                    {about.paragraphs.map((t) => <p key={t}>{t}</p>)}
                </div>
            </header>

            <nav className="hud-rail" aria-label="Sections">
                <span className="hud-marker" ref={marker} aria-hidden />
                {stages.map((st, n) => {
                    const name = st.label.split(" ")[1];
                    return (
                        <button
                            key={st.id}
                            className={`hud-row${n === i ? " is-active" : ""}`}
                            onClick={() => jumpTo(st.id, ports.find((p) => p.stage === st.id)?.cable)}
                            aria-label={`Go to ${name}`}
                            aria-current={n === i ? "true" : undefined}
                        >
                            {/* <span className="hud-num">{String(n + 1).padStart(2, "0")}</span> */}
                            <span className="hud-name">{name}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}