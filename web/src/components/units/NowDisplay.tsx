import { now } from "../../data/site";

export default function NowDisplay() {
    return (
        <section className="unit plate now" data-stage="now">
            <div className="lcd">
                <b>NOW</b>
                {now.map(([k, v]) => <div key={k}>{k.padEnd(9)} &gt; {v}</div>)}
            </div>
            <span className="rj45" data-jack="about" />
        </section>
    );
}