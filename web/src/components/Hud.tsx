import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { about, experience, person, ports, stack, stages } from "../data/site";
import { cameraState, jumpTo, onStageChange } from "../lib/cameraState";

const ROW = 30; // px per stage on the rail (keep in sync with --row in hud.css)
const CONTACT = stages.findIndex((s) => s.id === "contact");

// touch screens (phones, tablets) can't hover, so they get a hint line and a
// one-time nudge on the things you can tap
const TOUCH = window.matchMedia("(hover: none)").matches;
const NUDGE_WAIT = 700; // ms of no scrolling before the nudge plays
const nudged = new Set<number>(); // shelves that already nudged this visit

// Desktop: plain text in the corners. Your name and a short about up top,
// and a rail bottom left like the U-numbers on a rack. The green marker rides
// the rail as you scroll, and clicking a row jumps there.
// Phones (hud.css): the name becomes a top bar, the rail becomes a tab bar
// along the bottom, and the contact info gets its own readable sheet.
export default function Hud({ show }: { show: boolean }) {
    const [i, setI] = useState(cameraState.stage);
    const marker = useRef<HTMLSpanElement>(null);

    useEffect(() => onStageChange(setI), []);

    // first time you settle on a shelf, the tappable things on it lift once
    useEffect(() => {
        if (!TOUCH || !show || nudged.has(i)) return;
        const targets = document.querySelectorAll<HTMLElement>(
            `.rack [data-stage="${stages[i].id}"] :is(.project-target, .port)`);
        if (!targets.length) return;

        let timer = 0;
        const fire = () => {
            nudged.add(i);
            window.removeEventListener("scroll", wait);
            targets.forEach((el, n) => {
                el.style.animationDelay = `${n * 90}ms`;
                el.dataset.nudge = "";
                const done = (e: AnimationEvent) => {
                    if (e.target !== el) return; // ignore the LED blinks inside
                    delete el.dataset.nudge;
                    el.style.animationDelay = "";
                    el.removeEventListener("animationend", done);
                };
                el.addEventListener("animationend", done);
            });
        };
        // wait until the page stops moving so it plays after the snap
        const wait = () => { window.clearTimeout(timer); timer = window.setTimeout(fire, NUDGE_WAIT); };
        window.addEventListener("scroll", wait, { passive: true });
        wait();
        return () => { window.clearTimeout(timer); window.removeEventListener("scroll", wait); };
    }, [i, show]);

    // keep the last hint's text while it fades out
    const lastHint = useRef("");
    const hint = stages[i].hint;
    if (hint) lastHint.current = hint;

    // move the marker every frame from the real scroll progress, so it slides
    // continuously instead of jumping row to row (hidden on phones)
    useEffect(() => {
        // the marker only exists on desktop; on phones and tablets it's hidden,
        // and touching its style every frame still makes the browser repaint
        const desktop = window.matchMedia("(min-width: 1001px)");
        let last = -1;
        const tick = () => {
            if (!desktop.matches || !marker.current) return;
            const y = Math.round(cameraState.progress * (stages.length - 1) * ROW * 10) / 10;
            if (y === last) return;
            last = y;
            marker.current.style.transform = `translateY(${y}px)`;
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
    }, []);

    return (
        <div className={`hud${show ? " is-on" : ""}`} data-stage={i}>
            <header className="hud-intro">
                <p className="hud-who">
                    <b>{person.name}</b>
                    <span>{person.role}</span>
                </p>
                <div className="hud-about">
                    {about.paragraphs.map((t) => <p key={t}>{t}</p>)}
                </div>
            </header>

            {/* phones only: the hatch text is too small to read on a phone,
                so the same info slides up here at the contact stage */}
            <section className={`hud-contact${i === CONTACT ? " is-open" : ""}`} aria-hidden={i !== CONTACT} inert={i !== CONTACT}>
                <ul>
                    {experience.map((e) => (
                        <li key={e.org}>
                            <b>{e.org}</b> <span>{e.role}, {e.when}</span>
                        </li>
                    ))}
                </ul>
                <p className="hud-stack">{stack.join(", ")}</p>
                <p className="hud-links">
                    <a href={`mailto:${person.email}`}>email</a>
                    <a href={person.linkedin} target="_blank" rel="noopener noreferrer">linkedin</a>
                    <a href={person.github} target="_blank" rel="noopener noreferrer">github</a>
                    {person.resume && <a className="is-resume" href={person.resume} target="_blank" rel="noopener noreferrer">resume ↗</a>}
                </p>
            </section>

            {TOUCH && (
                <p className={`hud-hint${hint ? " is-on" : ""}`} aria-hidden>{lastHint.current}</p>
            )}

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
                            <span className="hud-num">{String(n + 1).padStart(2, "0")}</span>
                            <span className="hud-name">{name}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

