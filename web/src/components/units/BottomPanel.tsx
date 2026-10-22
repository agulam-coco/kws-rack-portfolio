import { useEffect, useState } from "react";
import { experience, person, stack, stages } from "../../data/site";
import { cameraState, onStageChange } from "../../lib/cameraState";

const CONTACT = stages.findIndex((s) => s.id === "contact");

// The bottom panel is a hatch: the perforated grille lifts when the camera
// lands here (and drops when you leave), and the pull tab lets you open or
// close it by hand. Behind it: experience and links.
export default function BottomPanel() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let t = 0;
        const sync = (i: number) => {
            window.clearTimeout(t);
            // wait a beat so the camera settles before the grille moves
            if (i === CONTACT) t = window.setTimeout(() => setOpen(true), 350);
            else setOpen(false);
        };
        sync(cameraState.stage);
        const off = onStageChange(sync);
        return () => { off(); window.clearTimeout(t); };
    }, []);

    const links = [
        { label: "email", href: `mailto:${person.email}` },
        { label: "linkedin", href: person.linkedin },
        { label: "github", href: person.github },
        ...(person.resume ? [{ label: "resume", href: person.resume }] : []),
    ];

    return (
        <section className="unit plate bottom" data-stage="contact">
            <div className={`hatch${open ? " is-open" : ""}`}>
                {/* inert while closed, so you can't tab into hidden links */}
                <div className="behind" inert={!open}>
                    <p className="behind-head">experience</p>
                    <ul className="xp">
                        {experience.map((e) => (
                            <li key={e.org}>
                                <b>{e.org}</b>
                                <span>{e.role}</span>
                                <em>{e.when}</em>
                                <small>{e.did}</small>
                            </li>
                        ))}
                    </ul>

                    <p className="behind-head">stack</p>
                    <p className="stack">{stack.join(", ")}</p>

                    <ul className="contact-links">
                        {links.map((l) => (
                            <li key={l.label}>
                                <a
                                    className={l.label === "resume" ? "is-resume" : undefined}
                                    href={l.href}
                                    {...(l.label === "email" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                                >
                                    {l.label}{l.label === "resume" && " ↗"}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* the grille, with a pull tab on its bottom edge */}
                <div className="grille">
                    <button
                        className="latch"
                        onClick={() => setOpen((o) => !o)}
                        aria-expanded={open}
                        aria-label={open ? "Close the contact panel" : "Pull to open the contact panel"}
                    >
                        {open ? "close" : "pull"}
                    </button>
                </div>
            </div>
            <span className="rj45" data-jack="contact" />
            <span className="tag bottom-tag">PWR</span>
        </section>
    );
}
