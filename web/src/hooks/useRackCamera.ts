import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { stages } from "../data/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// How much of the screen width the rack fills once it's facing you.
const FILL = 0.58;

export function useRackCamera(scope: RefObject<HTMLElement | null>) {
    useGSAP(() => {
        const root = scope.current!;
        const viewport = root.querySelector<HTMLElement>(".viewport")!;
        const camera = root.querySelector<HTMLElement>(".camera")!;
        const tilt = root.querySelector<HTMLElement>(".tilt")!;
        const rack = root.querySelector<HTMLElement>(".rack")!;

        const zoom = () => (window.innerWidth * FILL) / rack.offsetWidth;

        const yFor = (id: string) => () => {
            const unit = rack.querySelector<HTMLElement>(`[data-stage="${id}"]`)!;
            const center = unit.offsetTop + unit.offsetHeight / 2;
            return window.innerHeight / 2 - center * zoom();
        };

        // camera zooms from its top edge (keeps the y math simple)
        gsap.set(camera, { transformOrigin: "50% 0" });
        // tilt rotates around the middle of the rack so nothing swings way out
        gsap.set(tilt, { transformOrigin: "50% 45%" });

        const tl = gsap.timeline({
            defaults: { ease: "power2.inOut", duration: 1 },
            scrollTrigger: {
                trigger: viewport,
                start: "top top",
                end: () => `+=${window.innerHeight * stages.length}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                snap: { snapTo: "labels", duration: { min: 0.2, max: 0.6 }, delay: 0.1 },
            },
        });

        // Intro: whole rack small and centered, looking down at it from the
        // upper right, then it turns to face you and zooms in.
        tl.addLabel("intro", 0)
            .fromTo(
                camera,
                {
                    scale: () => (window.innerHeight * 0.8) / rack.offsetHeight,
                    y: () => window.innerHeight * 0.06,
                },
                { scale: zoom, y: yFor("overview") },
                "intro"
            )
            .fromTo(
                tilt,
                { rotateX: -24, rotateY: -22 },
                { rotateX: 0, rotateY: 0 },
                "intro"
            )
            .addLabel("overview");

        stages.slice(1).forEach((s) => {
            tl.to(camera, { y: yFor(s.id) }).addLabel(s.id);
        });

        document.fonts.ready.then(() => ScrollTrigger.refresh());
    }, { scope });
}