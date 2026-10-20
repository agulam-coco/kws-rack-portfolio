import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { stages } from "../data/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// How much of the screen width the rack fills once it's facing you.
// 0.58 roughly matches your screenshot. Raise it to zoom in more.
const FILL = 0.58;

export function useRackCamera(scope: RefObject<HTMLElement | null>) {
    useGSAP(() => {
        const root = scope.current!;
        const viewport = root.querySelector<HTMLElement>(".viewport")!;
        const camera = root.querySelector<HTMLElement>(".camera")!;
        const rack = root.querySelector<HTMLElement>(".rack")!;

        const zoom = () => (window.innerWidth * FILL) / rack.offsetWidth;

        // y that puts a unit's center in the middle of the screen
        const yFor = (id: string) => () => {
            const unit = rack.querySelector<HTMLElement>(`[data-stage="${id}"]`)!;
            const center = unit.offsetTop + unit.offsetHeight / 2;
            return window.innerHeight / 2 - center * zoom();
        };

        gsap.set(camera, { transformOrigin: "50% 0" });

        const tl = gsap.timeline({
            defaults: { ease: "power2.inOut", duration: 1 },
            scrollTrigger: {
                trigger: viewport,
                start: "top top",
                end: () => `+=${window.innerHeight * stages.length}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true, // recompute on resize
                snap: { snapTo: "labels", duration: { min: 0.2, max: 0.6 }, delay: 0.1 },
            },
        });

        // 1. Intro: tilted back like the tablet, swings up to face you
        tl.addLabel("intro", 0).fromTo(
            camera,
            { rotateX: 38, rotateY: -16, scale: () => zoom() * 0.6, y: () => window.innerHeight * 0.1 },
            { rotateX: 0, rotateY: 0, scale: zoom, y: yFor("overview") }
        );
        tl.addLabel("overview");

        // 2. Pan down to each unit
        stages.slice(1).forEach((s) => {
            tl.to(camera, { y: yFor(s.id) }).addLabel(s.id);
        });

        // fonts load late and shift layout, so re-measure once they're in
        document.fonts.ready.then(() => ScrollTrigger.refresh());
    }, { scope });
}