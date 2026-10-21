import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { stages } from "../data/site";
import { ROOM } from "../data/room";
import { cameraState } from "../lib/cameraState";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FILL = 0.58;

// Color grade, lamp, and side panel: room look vs zoomed-in look.
const LOOK_ROOM = { "--grade": 0.65, "--lamp": 1, "--side": 1 };
const LOOK_FINAL = { "--grade": 0.3, "--lamp": 0.6, "--side": 1 };

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
            defaults: { ease: "power2.inOut", duration: 1 },
            scrollTrigger: {
                trigger: viewport,
                start: "top top",
                end: () => `+=${window.innerHeight * (stages.length - 1)}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                snap: { snapTo: "labels", duration: { min: 0.2, max: 0.6 }, delay: 0.1 },
                onUpdate: (self) => { cameraState.progress = self.progress; },

            },
        });
        tl.set(camera, { scale: zoom, y: yFor("overview") }, 0).addLabel("overview", 0);
        stages.slice(1).forEach((s) => {
            tl.to(camera, { scale: zoom, y: yFor(s.id) }).addLabel(s.id);
        });

        ScrollTrigger.refresh();

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

        // lighting layers, animated by opacity (GPU) instead of CSS variables (repaint)
        const grade = rack.querySelector(".rack-grade");
        const lamp = rack.querySelectorAll(".rack-light, .rack-rim");

        gsap.timeline({
            delay: 0.35, // let the loader fade out first
            onComplete: () => { document.documentElement.style.overflow = ""; },
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

        return () => { document.documentElement.style.overflow = ""; };
    }, { scope, dependencies: [ready], revertOnUpdate: true });
}