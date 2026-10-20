import { person } from "../../data/site";

export default function HeroFrame() {
    return (
        <section className="unit plate hero" data-stage="overview">
            <p className="eyebrow">PORTFOLIO</p>
            <h1 className="engraved">{person.name}</h1>
            <span className="rj45" data-jack="home" />
        </section>
    );
}