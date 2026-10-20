import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { stages } from "../data/site";
import { ROOM } from "../data/room";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FILL = 0.58;

// Color grade, lamp, and side panel: room look vs zoomed-in look.
const LOOK_ROOM = { "--grade": 0.65, "--lamp": 1, "--side": 1 };
const LOOK_FINAL = { "--grade": 0.18, "--lamp": 0.35, "--side": 0 };

// When the HTML rack fades in over the painted one (seconds into the intro).
// Set to 10 to check alignment: the intro finishes on the painted rack,
// then the HTML rack pops in. If it jumps, nudge the numbers in room.ts.
const SWAP_AT = 1.2;

export function useRackCamera(scope: RefObject<HTMLElement | null>, ready: boolean) {
    useGSAP(() => {
        const root = scope.current!;
        const viewport = root.querySelector<HTMLElement>(".viewport")!;
        const camera = root.querySelector<HTMLElement>(".camera")!;
        const tilt = root.querySelector<HTMLElement>(".tilt")!;
        const rack = root.querySelector<HTMLElement>(".rack")!;
        const bg = root.querySelector<HTMLImageElement>(".room-bg")!;
        const desk = root.querySelector<HTMLImageElement>(".room-desk")!;
        const fg = root.querySelector<HTMLImageElement>(".room-fg")!;
        const fairy = root.querySelector<HTMLElement>(".fairy")!;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // still loading: keep everything hidden and the page locked
        if (!ready) {
            gsap.set(tilt, { autoAlpha: 0 });
            document.documentElement.style.overflow = "hidden";
            return;
        }

        const zoom = () => (window.innerWidth * FILL) / rack.offsetWidth;

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
            tilt.style.setProperty("--room-w", `${room.w}px`);
            tilt.style.setProperty("--room-h", `${room.h}px`);
            tilt.style.setProperty("--room-x", `${room.x}px`);
            tilt.style.setProperty("--room-y", `${room.y}px`);
            return room;
        };

        gsap.set(camera, { transformOrigin: "50% 0" });
        gsap.set(tilt, { transformOrigin: "50% 0" });
        gsap.set(fg, { transformOrigin: "50% 100%" });

        // ---------- scroll: pan from unit to unit ----------
        const tl = gsap.timeline({
            defaults: { ease: "power2.inOut", duration: 1 },
            scrollTrigger: {
                trigger: viewport,
                start: "top top",
                end: () => `+=${window.innerHeight * (stages.length - 1)}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                snap: { snapTo: "labels", duration: { min: 0.2, max: 0.6 }, delay: 0.1 },
            },
        });
        tl.set(camera, { scale: zoom, y: yFor("overview") }, 0).addLabel("overview", 0);
        stages.slice(1).forEach((s) => {
            tl.to(camera, { scale: zoom, y: yFor(s.id) }).addLabel(s.id);
        });

        ScrollTrigger.refresh();

        if (reduce) {
            placeRoom();
            gsap.set([bg, desk, fg, fairy], { autoAlpha: 0 });
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

        gsap.timeline({
            delay: 0.7, // let the loader fade out first
            defaults: { ease: "power3.inOut" },
            onComplete: () => { document.documentElement.style.overflow = ""; },
        })
            .to(tilt, { scale: 1, y: 0, duration: 2.6 }, 0.2)
            .to(fg, { yPercent: 35, scale: 1.3, autoAlpha: 0, duration: 1.4, ease: "power2.in" }, 0.4)
            .to(rack, { autoAlpha: 1, duration: 0.9, ease: "power1.inOut" }, SWAP_AT)
            .to([bg, desk, fairy], { autoAlpha: 0, duration: 1, ease: "power1.in" }, Math.max(1.7, SWAP_AT + 0.5))
            .to(rack, { ...LOOK_FINAL, duration: 1.2 }, Math.max(1.7, SWAP_AT + 0.5));

        return () => { document.documentElement.style.overflow = ""; };
    }, { scope, dependencies: [ready], revertOnUpdate: true });
}