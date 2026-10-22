import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cameraState } from "../lib/cameraState";

gsap.registerPlugin(ScrollTrigger);

export function useLenis() {
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        // lerp: how fast the page catches up to your wheel (0.1 = floaty, 0.2 = snappy)
        const lenis = new Lenis({ lerp: 0.15 });

        lenis.on("scroll", ScrollTrigger.update);
        cameraState.lenis = lenis;
        const tick = (t: number) => lenis.raf(t * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(tick);
            lenis.destroy();
            cameraState.lenis = null;
        };
    }, []);
}