import gsap from "gsap";
import { stages } from "../data/site";
import { cameraState, setStage } from "../lib/cameraState";
import { SKIP_INTRO, markIntroSeen } from "../lib/intro";

// ---------- phones: the rack scrolls natively ----------
// On desktop, the rack view is fixed and JavaScript moves a camera as you
// scroll. Phones can't redraw that fast enough, so here the rack is just part
// of the page and the phone scrolls it itself, which is always smooth.
// Snapping, the tab bar and tap-to-jump work the same way.

const FILL = 0.94;      // how much of the screen width the rack fills
const SNAP_DELAY = 350; // ms after you stop scrolling before it settles on a shelf

export function setupPhoneScroll(root: HTMLElement) {
    const html = document.documentElement;
    const viewport = root.querySelector<HTMLElement>(".viewport")!;
    const camera = root.querySelector<HTMLElement>(".camera")!;
    const tilt = root.querySelector<HTMLElement>(".tilt")!;
    const rack = root.querySelector<HTMLElement>(".rack")!;
    const unit = (id: string) => rack.querySelector<HTMLElement>(`[data-stage="${id}"]`)!;

    html.classList.add("phone-scroll"); // phone.css: viewport stops being fixed
    html.style.overflow = "";
    root.style.height = "";

    // final look of the rack (the desktop intro normally fades these in)
    gsap.set(rack, { autoAlpha: 1 });
    gsap.set(rack.querySelector(".rack-grade"), { opacity: 0.3 });
    gsap.set(rack.querySelectorAll(".rack-light, .rack-rim"), { opacity: 0.6 });

    // ---------- size the rack to the screen ----------
    // scroll position (top of the page) that centers each shelf
    let stops: number[] = [];
    let width = window.innerWidth;

    const layout = () => {
        const z = (window.innerWidth * FILL) / rack.offsetWidth;
        const vh = window.innerHeight;
        const first = unit(stages[0].id);
        const last = unit(stages[stages.length - 1].id);
        const rackTop = rack.offsetTop;
        // room above the first shelf and below the last so both can sit centered
        const padTop = Math.max(0, vh / 2 - (rackTop + first.offsetTop + first.offsetHeight / 2) * z);
        const padBottom = Math.max(0, vh / 2 - (rack.offsetHeight - last.offsetTop - last.offsetHeight / 2) * z);

        gsap.set(camera, { transformOrigin: "50% 0", scale: z, x: 0, y: padTop });
        viewport.style.height = `${padTop + (rackTop + rack.offsetHeight) * z + padBottom}px`;

        stops = stages.map((s) => {
            const r = unit(s.id).getBoundingClientRect();
            return Math.max(0, window.scrollY + r.top + r.height / 2 - vh / 2);
        });
    };
    layout();

    // ---------- which shelf you're on ----------
    const nearest = () => {
        const y = window.scrollY;
        let best = 0;
        stops.forEach((s, i) => { if (Math.abs(s - y) < Math.abs(stops[best] - y)) best = i; });
        return best;
    };

    let frame = 0;
    const track = () => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        cameraState.progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        setStage(nearest());
    };

    // ---------- snap onto the nearest shelf once you stop ----------
    let snapTimer = 0;
    let touching = false;
    const settle = () => {
        if (touching) return;
        const i = nearest();
        if (Math.abs(stops[i] - window.scrollY) > 3) window.scrollTo({ top: stops[i], behavior: "smooth" });
    };

    const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(track);
        window.clearTimeout(snapTimer);
        snapTimer = window.setTimeout(settle, SNAP_DELAY);
    };
    const onTouchStart = () => { touching = true; window.clearTimeout(snapTimer); };
    const onTouchEnd = () => { touching = false; onScroll(); };
    // only re-layout when the width changes (not when the address bar slides)
    const onResize = () => {
        if (window.innerWidth === width) return;
        width = window.innerWidth;
        layout();
        track();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", onResize);

    // tab bar and switch ports
    cameraState.goTo = (id) => {
        const i = stages.findIndex((s) => s.id === id);
        if (i >= 0) window.scrollTo({ top: stops[i], behavior: "smooth" });
    };

    // ---------- intro: a short fade ----------
    if (SKIP_INTRO) {
        gsap.set(tilt, { autoAlpha: 1 });
    } else {
        gsap.fromTo(tilt,
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.25, ease: "power2.out", onComplete: markIntroSeen });
    }
    track();

    return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("resize", onResize);
        window.clearTimeout(snapTimer);
        cancelAnimationFrame(frame);
        cameraState.goTo = () => { };
        html.classList.remove("phone-scroll");
        viewport.style.height = "";
    };
}
