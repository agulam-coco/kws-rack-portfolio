import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { stages } from "../data/site";
import { ROOM } from "../data/room";
import { cameraState, setStage } from "../lib/cameraState";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// how much of the screen width the rack fills: desktop leaves room for the
// side text and hover cards, phones use almost the full width
const fill = () => (window.innerWidth <= 700 ? 0.94 : 0.58);

// Color grade, lamp, and side panel: room look vs zoomed-in look.
const LOOK_ROOM = { "--grade": 0.65, "--lamp": 1, "--side": 1 };
const LOOK_FINAL = { "--grade": 0.3, "--lamp": 0.6, "--side": 1 };

// ---------- returning visitors skip the intro ----------
// The push-in only plays the first time. Visit /?intro to see it again.
const SEEN_KEY = "rack-intro-seen";
const introSeen = () => {
    if (new URLSearchParams(location.search).has("intro")) return false;
    try { return localStorage.getItem(SEEN_KEY) === "1"; } catch { return false; }
};
const markIntroSeen = () => {
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* private mode etc. */ }
};
// decided once when the page loads, before anything renders, so the side
// text (hud.css) knows not to wait for the camera
const SKIP_INTRO = introSeen();
if (SKIP_INTRO) document.documentElement.dataset.intro = "seen";

// ---------- scroll feel ----------
const SCROLL_PER_STAGE = 0.7; // how much scrolling moves you one shelf (x screen height)
const SNAP_DELAY = 400;       // ms of no scrolling before it settles onto the nearest shelf
const SNAP_DURATION = 0.6;    // s the settle takes

export function useRackCamera(scope: RefObject<HTMLElement | null>, ready: boolean) {
    useGSAP(() => {
        const root = scope.current!;
        const viewport = root.querySelector<HTMLElement>(".viewport")!;
        const camera = root.querySelector<HTMLElement>(".camera")!;
        const tilt = root.querySelector<HTMLElement>(".tilt")!;
        const rack = root.querySelector<HTMLElement>(".rack")!;
        const desk = root.querySelector<HTMLImageElement>(".room-desk")!;
        const fg = root.querySelector<HTMLImageElement>(".room-fg")!;
        const fairy = root.querySelector<HTMLElement>(".fairy")!;
        const blur = root.querySelectorAll<HTMLImageElement>(".room-bg-blur, .room-desk-empty-blur");
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // still loading: keep everything hidden and the page locked
        if (!ready) {
            gsap.set(tilt, { autoAlpha: 0 });
            document.documentElement.style.overflow = "hidden";
            return;
        }

        const zoom = () => (window.innerWidth * fill()) / rack.offsetWidth;

        const yFor = (id: string) => () => {
            const unit = rack.querySelector<HTMLElement>(`[data-stage="${id}"]`)!;
            const center = unit.offsetTop + unit.offsetHeight / 2;
            return window.innerHeight / 2 - center * zoom();
        };

        const placeRoom = () => {
            const k = rack.offsetHeight / ROOM.spot.height;
            const room = {
                w: ROOM.w * k,
                h: ROOM.h * k,
                x: rack.offsetWidth / 2 - ROOM.spot.cx * k,
                y: rack.offsetHeight - ROOM.spot.baseY * k,
            };
            tilt.style.setProperty("--room-k", `${k}`);
            tilt.style.setProperty("--room-x", `${room.x}px`);
            tilt.style.setProperty("--room-y", `${room.y}px`);
            return room;
        };

        gsap.set(camera, { transformOrigin: "50% 0" });
        gsap.set(tilt, { transformOrigin: "50% 0" });
        gsap.set(fg, { transformOrigin: "50% 100%" });
        gsap.set(blur, { autoAlpha: reduce ? 1 : 0 });

        // ---------- scroll: pan from unit to unit ----------
        const tl = gsap.timeline({
            // linear: the camera moves exactly as much as you scroll, so it never
            // feels heavy. The easing happens in the snap instead (below).
            defaults: { ease: "none", duration: 1 },
            scrollTrigger: {
                trigger: viewport,
                start: "top top",
                end: () => `+=${window.innerHeight * SCROLL_PER_STAGE * (stages.length - 1)}`,
                pin: true,
                scrub: true, // follow the scroll exactly (Lenis already smooths the wheel)
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    cameraState.progress = self.progress;
                    setStage(Math.round(self.progress * (stages.length - 1)));
                },
            },
        });
        tl.set(camera, { scale: zoom, y: yFor("overview") }, 0).addLabel("overview", 0);
        stages.slice(1).forEach((s) => {
            tl.to(camera, { scale: zoom, y: yFor(s.id) }).addLabel(s.id);
        });

        ScrollTrigger.refresh();
        // ---------- jump to a stage (used by the switch ports) ----------
        // where a stage's label sits in the page's scroll
        const scrollFor = (id: string) => {
            const st = tl.scrollTrigger;
            const t = tl.labels[id];
            if (!st || t === undefined) return null;
            return st.start + (st.end - st.start) * (t / tl.duration());
        };

        cameraState.goTo = (id, duration) => {
            const y = scrollFor(id);
            if (y === null) return;
            if (cameraState.lenis) {
                cameraState.lenis.scrollTo(y, { duration, easing: (x) => 1 - Math.pow(1 - x, 3) });
            } else {
                window.scrollTo({ top: y });
            }
        };

        if (reduce) {
            placeRoom();
            gsap.set([desk, fg], { autoAlpha: 0 });
            gsap.set(fairy, { autoAlpha: 0.35 });
            gsap.set(rack, { ...LOOK_FINAL, autoAlpha: 1 });
            gsap.set(tilt, { autoAlpha: 1 });
            document.documentElement.style.overflow = "";
            return;
        }

        // ---------- intro: push in from the room ----------
        const room = placeRoom();
        const z = zoom();
        const yc = yFor("overview")();
        const s0 = Math.max(window.innerWidth / room.w, window.innerHeight / room.h) * 1.05;
        const y0 = (window.innerHeight - room.h * s0) / 2 - room.y * s0;

        document.documentElement.style.overflow = "hidden";
        gsap.set(tilt, { scale: s0 / z, y: (y0 - yc) / z, autoAlpha: 1 });
        gsap.set(rack, { ...LOOK_ROOM, autoAlpha: 0 }); // painted rack shows first

        // ---------- alignment check: visit /?align ----------
        // freezes on the room shot with the HTML rack half see-through
        // over the painted one. If they don't line up, adjust room.ts.
        if (new URLSearchParams(location.search).has("align")) {
            gsap.set(rack, { ...LOOK_ROOM, autoAlpha: 0.5 });
            gsap.set(fg, { autoAlpha: 0 });
            return;
        }

        // ---------- snap: scroll freely, then settle onto the nearest shelf ----------
        // Done here instead of ScrollTrigger's snap, which fights with Lenis
        // and makes the scroll feel heavy.
        let snapTimer = 0;
        let touching = false;
        const settle = () => {
            if (touching) return;
            const st = tl.scrollTrigger;
            const y = window.scrollY;
            if (!st || y < st.start || y > st.end) return; // outside the rack
            let best = y, dist = Infinity;
            for (const s of stages) {
                const sy = scrollFor(s.id);
                if (sy !== null && Math.abs(sy - y) < dist) { dist = Math.abs(sy - y); best = sy; }
            }
            if (dist < 2) return; // already there
            if (cameraState.lenis) {
                cameraState.lenis.scrollTo(best, { duration: SNAP_DURATION, easing: (x) => 1 - Math.pow(1 - x, 3) });
            } else {
                window.scrollTo({ top: best, behavior: "smooth" });
            }
        };
        const onScroll = () => {
            window.clearTimeout(snapTimer);
            snapTimer = window.setTimeout(settle, SNAP_DELAY);
        };
        const onTouchStart = () => { touching = true; window.clearTimeout(snapTimer); };
        const onTouchEnd = () => { touching = false; onScroll(); };
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchend", onTouchEnd, { passive: true });

        // lighting layers, animated by opacity (GPU) instead of CSS variables (repaint)
        const grade = rack.querySelector(".rack-grade");
        const lamp = rack.querySelectorAll(".rack-light, .rack-rim");

        // been here before: jump straight to where the intro ends
        if (SKIP_INTRO) {
            gsap.set(tilt, { scale: 1, y: 0 });
            gsap.set(fg, { autoAlpha: 0 });
            gsap.set(desk, { autoAlpha: 0 });
            gsap.set(rack, { autoAlpha: 1 });
            gsap.set(blur, { autoAlpha: 1 });
            gsap.set(fairy, { autoAlpha: 0.35 });
            gsap.set(grade, { opacity: LOOK_FINAL["--grade"] });
            gsap.set(lamp, { opacity: LOOK_FINAL["--lamp"] });
            document.documentElement.style.overflow = "";
        } else gsap.timeline({
            delay: 0.35, // let the loader fade out first
            onComplete: () => {
                document.documentElement.style.overflow = "";
                markIntroSeen();
            },
        })
            // the push in
            .to(tilt, { scale: 1, y: 0, duration: 2.1, ease: "power2.inOut" }, 0)
            // chair slides out first
            .to(fg, { yPercent: 35, scale: 1.3, autoAlpha: 0, duration: 1.1, ease: "power2.in" }, 0.15)
            // swap: HTML rack fades in exactly as the painted one fades out
            .to(rack, { autoAlpha: 1, duration: 0.5, ease: "power1.inOut" }, 0.9)
            .to(desk, { autoAlpha: 0, duration: 0.5, ease: "power1.inOut" }, 0.9)
            // focus pull: room goes soft and darker
            .to(blur, { autoAlpha: 1, duration: 1, ease: "power1.inOut" }, 1.1)
            .to(fairy, { autoAlpha: 0.35, duration: 1 }, 1.1)
            // ease the lighting into the zoomed-in look
            .to(grade, { opacity: LOOK_FINAL["--grade"], duration: 1 }, 1.2)
            .to(lamp, { opacity: LOOK_FINAL["--lamp"], duration: 1 }, 1.2);

        return () => {
            document.documentElement.style.overflow = "";
            cameraState.goTo = () => { };
            window.clearTimeout(snapTimer);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, { scope, dependencies: [ready], revertOnUpdate: true });
}