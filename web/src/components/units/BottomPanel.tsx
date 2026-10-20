import { experience, person } from "../../data/site";

export default function BottomPanel() {
    return (
        <section className="unit plate bottom" data-stage="contact">
            <div className="hatch">
                <div className="behind">
                    {experience.map((e) => (
                        <p key={e.org}><b>{e.org}</b> · {e.role} · {e.when}</p>
                    ))}
                    <div className="contact-links">
                        <a href={`mailto:${person.email}`}>email</a>
                        <a href={person.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                        <a href={person.github} target="_blank" rel="noreferrer">GitHub</a>
                    </div>
                </div>
                <div className="grille" />
            </div>
            <span className="rj45" data-jack="contact" />
            <span className="tag bottom-tag">PWR</span>
        </section>
    );
}