import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ports, stages } from "../data/site";
import { cameraState } from "../lib/cameraState";

// One cable per port (HOME and the spare SFP have none).
// Port order left to right = lane order in the bundle = exit order top to bottom.
const IDS = ports.map((p) => p.cable).filter((c) => c && c !== "home");

// plugs that go into the TOP of a device (cable arrives from above).
// everything else is a front jack (cable hangs out the bottom of the plug).
const TOP_ENTRY = new Set(["watch-my-tokens", "fissure", "freesound", "builds"]);

// yellow loom with one green accent
const YELLOW: [string, string] = ["#e3bb3c", "#8c6b10"];
const GREEN: [string, string] = ["#34c46f", "#11673a"];
const COLOR: Record<string, [string, string]> = { fissure: GREEN };

const GAP = 4.3;   // spacing between cables in the bundle
const BOOT = 11;   // length of the rubber boot behind each plug
const LIFT = -8;   // must match the translateY in .node:hover (rack-3d.css)

// ---------- packets ----------
const POOL = 8;            // max packets on one cable at once
const FULL_SPEED = 2600;   // scroll speed (px/s) that counts as "flat out"

// which cables carry the traffic when you're heading to each stage
const STAGE_CABLES: Record<string, string[]> = {
    overview: [],
    network: IDS,
    now: ["about"],
    projects: ["watch-my-tokens", "fissure", "freesound"],
    builds: ["builds"],
    contact: ["contact"],
};

type Pt = [number, number];
type Plug = { x: number; y: number; flip: boolean };
type Built = { d: string; end: Plug };
type Cable = { id: string; color: [string, string]; start: Plug; build: (lift: number) => Built };
type Ring = { y: number; x0: number; x1: number };
type Strap = { y: number; x: number; w: number };

function offsetIn(el: HTMLElement, root: HTMLElement) {
    let x = 0, y = 0;
    let n: HTMLElement | null = el;
    while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

// smooth curve through points (Catmull-Rom as cubic beziers), no leading "M"
function through(p: Pt[]) {
    let d = "";
    for (let i = 0; i < p.length - 1; i++) {
        const a = p[i - 1] ?? p[i], b = p[i], c = p[i + 1], e = p[i + 2] ?? c;
        const t = 1 / 6;
        d += ` C ${b[0] + (c[0] - a[0]) * t} ${b[1] + (c[1] - a[1]) * t} ${c[0] - (e[0] - b[0]) * t} ${c[1] - (e[1] - b[1]) * t} ${c[0]} ${c[1]}`;
    }
    return d;
}

const plugTransform = (p: Plug) => `translate(${p.x} ${p.y}) scale(1 ${p.flip ? -1 : 1})`;

function PlugShape({ p, color, end }: { p: Plug; color: string; end?: string }) {
    return (
        <g className="plug" transform={plugTransform(p)} data-plug-end={end}>
            <path className="boot" d={`M -4.5 1 L 4.5 1 L 3 ${BOOT} L -3 ${BOOT} Z`} style={{ fill: color }} />
            <path className="boot-ribs" d="M -3.8 4 H 3.8 M -3.5 6.5 H 3.5 M -3.2 9 H 3.2" />
            <rect className="plug-body" x={-5.5} y={-8} width={11} height={10} rx={1.5} />
        </g>
    );
}

export default function Cables() {
    const svg = useRef<SVGSVGElement>(null);
    const [state, setState] = useState<{ w: number; h: number; cables: Cable[]; rings: Ring[]; straps: Strap[] }>(
        { w: 0, h: 0, cables: [], rings: [], straps: [] }
    );

    // ---------- measure + build the routes ----------
    useLayoutEffect(() => {
        const rack = svg.current?.parentElement as HTMLElement | null;
        if (!rack) return;

        const measure = () => {
            const W = rack.offsetWidth;
            const railX = W - 22;
            const n = IDS.length;
            const center = railX - 30;

            const info = IDS.map((id, k) => {
                const port = rack.querySelector<HTMLElement>(`[data-port="${id}"] .jack`);
                const jack = rack.querySelector<HTMLElement>(`[data-jack="${id}"]`);
                if (!port || !jack) return null;
                const p = offsetIn(port, rack), j = offsetIn(jack, rack);
                const top = TOP_ENTRY.has(id);
                return {
                    id, k, top,
                    px: p.x + p.w / 2, py: p.y + p.h,             // bottom of the switch port
                    jx: j.x + j.w / 2, jy: top ? j.y : j.y + j.h, // top or bottom of the device jack
                };
            }).filter(Boolean) as { id: string; k: number; top: boolean; px: number; py: number; jx: number; jy: number }[];

            // hooks that hold the bundle: under the switch, then spaced down the rack
            const firstY = Math.max(...info.map((c) => c.py)) + 70;
            const lastY = Math.max(...info.map((c) => (c.top ? c.jy - 60 : c.jy + 10)));
            const ringYs: number[] = [];
            for (let y = firstY; y < lastY - 40; y += 175) ringYs.push(y);

            // bundle squeezes together at each hook and relaxes between them
            const pinch = (y: number) => 1 - 0.45 * Math.max(0, ...ringYs.map((r) => Math.exp(-(((y - r) / 26) ** 2))));
            const laneX = (k: number, y: number) =>
                center + (k - (n - 1) / 2) * GAP * pinch(y) + Math.sin(y / 46 + k * 1.7) * 2.2 * pinch(y);

            const cables: Cable[] = info.map((c) => {
                const start: Plug = { x: c.px, y: c.py, flip: false };
                const enter = firstY - 34 + (n - 1 - c.k) * 5;   // right-hand ports join higher
                const exitY = c.top
                    ? c.jy - BOOT - 46 - (n - c.k) * 6              // leave above the device
                    : c.jy + BOOT - 18;                              // leave level with the plug

                // everything up to where the cable leaves the bundle never moves
                const s: Pt = [c.px, c.py + BOOT];
                const e0: Pt = [laneX(c.k, enter), enter];
                const pts: Pt[] = [e0];
                for (let y = enter + 14; y < exitY - 6; y += 12) pts.push([laneX(c.k, y), y]);
                const last: Pt = [laneX(c.k, Math.max(exitY, enter + 1)), Math.max(exitY, enter + 1)];
                pts.push(last);
                const fixed = `M ${s[0]} ${s[1]} C ${s[0]} ${s[1] + 34} ${e0[0] - 2} ${enter - 30} ${e0[0]} ${e0[1]}` + through(pts);

                // the last loop into the device follows it when it lifts on hover
                const build = (lift: number): Built => {
                    if (c.top) {
                        const jy = c.jy + lift;
                        const end: Pt = [c.jx, jy - BOOT];
                        const span = end[1] - last[1];
                        return {
                            d: fixed + ` C ${last[0]} ${last[1] + span * 0.55} ${end[0] + 6} ${end[1] - span * 0.9 - 18} ${end[0]} ${end[1]}`,
                            end: { x: c.jx, y: jy, flip: true },
                        };
                    }
                    const end: Pt = [c.jx, c.jy + BOOT];
                    return {
                        d: fixed + ` C ${last[0]} ${last[1] + 46} ${end[0]} ${end[1] + 52} ${end[0]} ${end[1]}`,
                        end: { x: c.jx, y: c.jy, flip: false },
                    };
                };

                return { id: c.id, color: COLOR[c.id] ?? YELLOW, start, build };
            });

            const bundleW = n * GAP + 6;
            setState({
                w: W,
                h: rack.offsetHeight,
                cables,
                rings: ringYs.map((y) => ({ y, x0: center - bundleW * 0.35 - 5, x1: railX + 2 })),
                straps: ringYs.slice(0, -1).map((y) => ({ y: y + 88, x: center, w: bundleW * 0.78 })),
            });
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(rack);
        document.fonts.ready.then(measure);
        return () => ro.disconnect();
    }, []);

    // ---------- cables follow the nodes when they lift on hover ----------
    useLayoutEffect(() => {
        const root = svg.current;
        const rack = root?.parentElement;
        if (!root || !rack) return;
        const offs: (() => void)[] = [];

        state.cables.forEach((c) => {
            const node = rack.querySelector(`[data-jack="${c.id}"]`)?.closest<HTMLElement>(".node");
            if (!node) return;
            const paths = root.querySelectorAll<SVGPathElement>(`[data-cable="${c.id}"] path, path[data-shadow="${c.id}"]`);
            const plug = root.querySelector<SVGGElement>(`[data-plug-end="${c.id}"]`);
            const s = { lift: 0 };
            const draw = () => {
                const b = c.build(s.lift);
                paths.forEach((p) => p.setAttribute("d", b.d));
                plug?.setAttribute("transform", plugTransform(b.end));
            };
            const to = (lift: number) => gsap.to(s, { lift, duration: 0.25, ease: "power2.out", overwrite: true, onUpdate: draw });
            const enter = () => to(LIFT);
            const leave = () => to(0);
            node.addEventListener("pointerenter", enter);
            node.addEventListener("pointerleave", leave);
            offs.push(() => {
                node.removeEventListener("pointerenter", enter);
                node.removeEventListener("pointerleave", leave);
                gsap.killTweensOf(s);
            });
        });
        return () => offs.forEach((f) => f());
    }, [state.cables]);

    // ---------- packets: speed and direction follow your scrolling ----------
    useLayoutEffect(() => {
        const root = svg.current;
        if (!root || !state.cables.length) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        type Packet = { g: SVGGElement; halo: SVGPathElement; trail: SVGPathElement; head: SVGPathElement; alive: boolean; pos: number; speed: number; dir: 1 | -1; len: number; big: boolean; t0: number; dur: number }; const lines = state.cables.map((c) => {
            const g = root.querySelector<SVGGElement>(`[data-cable="${c.id}"]`)!;
            const body = g.querySelector<SVGPathElement>(".cable-edge")!;
            const packets: Packet[] = [...g.querySelectorAll<SVGGElement>(".packet")].map((p) => ({
                g: p,
                halo: p.querySelector<SVGPathElement>(".packet-halo")!,
                trail: p.querySelector<SVGPathElement>(".packet-trail")!,
                head: p.querySelector<SVGPathElement>(".packet-head")!,
                alive: false, pos: 0, speed: 0, dir: 1, len: 0, big: false, t0: 0, dur: 0,
            }));
            return { id: c.id, g, body, packets, L: body.getTotalLength(), acc: Math.random() };
        });

        let lastY = window.scrollY, v = 0, frame = 0, hot = "";
        let quietUntil = 0, quietTimer = 0; // while a port packet flies, the rest of the traffic hushes

        // one big bright packet, timed to arrive with the camera (switch port clicks)
        cameraState.firePacket = (id, duration) => {
            const l = lines.find((x) => x.id === id);
            if (!l) return;
            // hush everything else so this one is the only thing moving
            quietUntil = performance.now() + duration * 1000;
            root.classList.add("is-quiet");
            window.clearTimeout(quietTimer);
            quietTimer = window.setTimeout(() => root.classList.remove("is-quiet"), duration * 1000 + 250);
            for (const x of lines) for (const q of x.packets) if (!q.big) { q.alive = false; q.g.style.opacity = "0"; }

            const p = l.packets.find((q) => !q.alive) ?? l.packets[0];
            p.alive = true;
            p.big = true;
            p.dir = 1;
            p.len = 90;
            p.pos = 0;
            p.t0 = performance.now();
            p.dur = duration * 1000;
            p.g.classList.add("is-big");
            p.g.style.opacity = "1";
            // the whole cable glows while it carries the packet
            l.g.classList.add("is-firing");
            window.setTimeout(() => l.g.classList.remove("is-firing"), duration * 1000 + 250);
        };

        const dash = (el: SVGPathElement, from: number, to: number, L: number) => {
            el.style.strokeDasharray = `${Math.max(0.1, to - from)} ${L + 200}`;
            el.style.strokeDashoffset = `${-from}`;
        };

        const tick = (_t: number, deltaMs: number) => {
            const dt = Math.min(deltaMs, 50) / 1000;
            if (!dt) return;

            // scroll velocity, smoothed
            const y = window.scrollY;
            v += ((y - lastY) / dt - v) * 0.12;
            lastY = y;
            const speedT = Math.min(1, Math.abs(v) / FULL_SPEED);
            const dir: 1 | -1 = v < -15 ? -1 : 1;

            // the stage you're heading toward
            const idx = cameraState.progress * (stages.length - 1);
            const target = Math.abs(v) > 20 ? (dir > 0 ? Math.ceil(idx - 0.02) : Math.floor(idx + 0.02)) : Math.round(idx);
            const stageId = stages[Math.max(0, Math.min(stages.length - 1, target))].id;
            const active = new Set(STAGE_CABLES[stageId] ?? []);

            // light up the cables that lead there while you're scrolling
            const moving = speedT > 0.02;
            const key = [...active].join() + moving;
            if (key !== hot) {
                hot = key;
                lines.forEach((l) => l.g.classList.toggle("is-hot", moving && active.has(l.id)));
            }

            if (++frame % 30 === 0) lines.forEach((l) => (l.L = l.body.getTotalLength())); // hover can stretch a cable

            for (const l of lines) {
                const on = active.has(l.id);
                // packets per second on this cable
                const rate = on ? 0.3 + speedT * 9 : 0.08 + speedT * 1.4;
                l.acc = performance.now() < quietUntil ? 0 : l.acc + rate * dt;
                while (l.acc >= 1) {
                    l.acc -= 1;
                    const p = l.packets.find((q) => !q.alive);
                    if (!p) break;
                    p.alive = true;
                    p.dir = dir;
                    p.speed = (160 + speedT * 1300) * (0.85 + Math.random() * 0.3);
                    p.len = 8 + speedT * 70;               // longer trails when you scroll fast
                    p.pos = dir > 0 ? 0 : l.L;
                    p.g.style.opacity = "1";
                }

                for (const p of l.packets) {
                    if (!p.alive) continue;
                    if (p.big) {
                        // same ease-out as the camera, so the packet stays in frame the whole trip
                        const k = Math.min(1, (performance.now() - p.t0) / p.dur);
                        p.pos = (1 - Math.pow(1 - k, 3)) * (l.L + p.len);
                        if (k === 1) p.pos = l.L + p.len + 1;
                    } else {
                        p.pos += p.speed * p.dir * dt;
                    } const head = p.pos, tail = p.pos - p.len * p.dir;
                    const a = Math.min(head, tail), b = Math.max(head, tail);
                    dash(p.trail, a, b, l.L);
                    const hl = p.big ? 12 : 5; // head length
                    const h0 = p.dir > 0 ? head - hl : head, h1 = p.dir > 0 ? head : head + hl;
                    dash(p.head, h0, h1, l.L);
                    dash(p.halo, h0 - 3, h1 + 3, l.L);
                    if (p.pos > l.L + p.len || p.pos < -p.len) {
                        p.alive = false;
                        p.g.style.opacity = "0";
                        if (p.big) { p.big = false; p.g.classList.remove("is-big"); }
                    }
                }
            }
        };

        gsap.ticker.add(tick);
        return () => {
            gsap.ticker.remove(tick);
            window.clearTimeout(quietTimer);
            root.classList.remove("is-quiet");
            cameraState.firePacket = () => { };
        };
    }, [state.cables]);

    const { w, h, cables, rings, straps } = state;
    return (
        <svg ref={svg} className="cables" width={w} height={h} aria-hidden>
            {/* shadow of the whole loom on the rack face */}
            <g className="cable-shadows">
                {cables.map((c) => <path key={c.id} data-shadow={c.id} d={c.build(0).d} />)}
            </g>

            {cables.map((c) => {
                const b = c.build(0);
                return (
                    <g key={c.id} className="cable" data-cable={c.id}>
                        <path className="cable-glow" d={b.d} stroke={c.color[0]} />
                        <path className="cable-edge" d={b.d} stroke={c.color[1]} strokeWidth={4.8} />
                        <path d={b.d} stroke={c.color[0]} strokeWidth={3.4} />
                        <path className="cable-shine" d={b.d} />
                        {Array.from({ length: POOL }, (_, i) => (
                            <g key={i} className="packet">
                                <path className="packet-halo" d={b.d} />
                                <path className="packet-trail" d={b.d} />
                                <path className="packet-head" d={b.d} />
                            </g>
                        ))}
                    </g>
                );
            })}

            {/* plugs: clear connector body + rubber boot in the cable's color */}
            {cables.map((c) => (
                <g key={c.id}>
                    <PlugShape p={c.start} color={c.color[0]} />
                    <PlugShape p={c.build(0).end} color={c.color[0]} end={c.id} />
                </g>
            ))}

            {/* velcro straps */}
            {straps.map((s, i) => (
                <g key={i} className="strap" transform={`translate(${s.x} ${s.y})`}>
                    <rect x={-s.w / 2 - 1} y={-4} width={s.w + 2} height={8} rx={3.5} />
                    <rect className="strap-tab" x={s.w / 2 - 4} y={-5} width={8} height={10} rx={2.5} />
                </g>
            ))}

            {/* black cable hooks, mounted on the rail, crossing in front of the bundle */}
            {rings.map((r, i) => (
                <g key={i} className="ring">
                    <rect x={r.x0} y={r.y - 4.5} width={r.x1 - r.x0} height={9} rx={4.5} />
                    <rect className="ring-shine" x={r.x0 + 3} y={r.y - 3.5} width={r.x1 - r.x0 - 8} height={2} rx={1} />
                </g>
            ))}
        </svg>
    );
}