// One carry handle: a bridge that runs front-to-back along the top of the rack.
// Built from 4 flat faces assembled in CSS 3D (see .rack-handle in rack-3d.css).

const LEN = 260; // how far back the handle runs
const H = 40;    // handle height

// Side profile, front of the handle is x=0.
// Two feet, a top bar, and the hand gap underneath.
const PROFILE =
    "M0 56 V6 Q0 0 6 0 H254 Q260 0 260 6 V56 H226 L214 30 Q212 26 206 26 H54 Q48 26 46 30 L34 56 Z";

function Side({ which }: { which: "a" | "b" }) {
    return (
        <svg className={`h-side ${which}`} width={LEN} height={H} viewBox={`0 0 ${LEN} ${H}`}>
            <path d={PROFILE} />
        </svg>
    );
}

export default function RackHandle({ side }: { side: "l" | "r" }) {
    return (
        <div className={`rack-handle ${side}`} aria-hidden>
            <Side which="a" />
            <Side which="b" />
            <span className="h-top" />
            <span className="h-front" />
        </div>
    );
}