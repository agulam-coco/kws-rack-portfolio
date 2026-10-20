import { useEffect, useState } from "react";
import { now } from "../../data/site";

const START_MS = 2600;  // wait for the intro to land before typing
const TYPE_MS = 55;     // per character (plus a little random jitter)
const ERASE_MS = 28;
const HOLD_MS = 3200;   // how long a value stays before the next swap

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function NowDisplay() {
    const [text, setText] = useState(() => now.map(() => ""));
    const [active, setActive] = useState(0); // row the cursor sits on

    useEffect(() => {
        let alive = true;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setText(now.map((r) => r.values[0]));
            setActive(now.length - 1);
            return;
        }

        const set = (i: number, s: string) =>
            alive && setText((t) => t.map((v, j) => (j === i ? s : v)));

        const type = async (i: number, s: string) => {
            setActive(i);
            for (let n = 1; n <= s.length && alive; n++) {
                set(i, s.slice(0, n));
                await sleep(TYPE_MS + Math.random() * 45);
            }
        };

        const erase = async (i: number, s: string) => {
            setActive(i);
            for (let n = s.length - 1; n >= 0 && alive; n--) {
                set(i, s.slice(0, n));
                await sleep(ERASE_MS);
            }
        };

        (async () => {
            await sleep(START_MS);

            // boot: type every row once
            for (let i = 0; i < now.length && alive; i++) {
                await type(i, now[i].values[0]);
                await sleep(220);
            }

            // then rotate the rows that have more than one value
            const rotating = now.flatMap((r, i) => (r.values.length > 1 ? [i] : []));
            const idx = now.map(() => 0);
            for (let k = 0; alive && rotating.length; k++) {
                await sleep(HOLD_MS);
                const i = rotating[k % rotating.length];
                await erase(i, now[i].values[idx[i]]);
                idx[i] = (idx[i] + 1) % now[i].values.length;
                await sleep(180);
                await type(i, now[i].values[idx[i]]);
            }
        })();

        return () => { alive = false; };
    }, []);

    return (
        <section className="unit plate now" data-stage="now">
            <div className="lcd">
                <b>NOW</b>
                {now.map((r, i) => (
                    <div key={r.key}>
                        {r.key.padEnd(9)} &gt; {text[i]}
                        {i === active && <span className="caret" />}
                    </div>
                ))}
            </div>
            <span className="rj45" data-jack="about" />
        </section>
    );
}