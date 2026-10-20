import { person } from "../../data/site";

export default function HeroFrame() {
    return (
        <section className="unit plate hero" data-stage="overview">
            <div className="handles"><span /><span /></div>
            <p className="eyebrow">PORTFOLIO</p>
            <h1 className="engraved">{person.name}</h1>
            {/* <div className="status">
                {["PWR", "NET", "ACT"].map((l) => <span key={l}><i className="led" />{l}</span>)}
            </div> */}
            <span className="rj45" data-jack="home" />
        </section>
    );
}