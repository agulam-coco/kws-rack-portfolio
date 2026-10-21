import type Lenis from "lenis";
import { stages } from "../data/site";

// Shared, mutable state for the rack, written and read without re-renders.
// - useRackCamera fills in progress, stage and goTo
// - useLenis fills in lenis
// - Cables fills in firePacket
export const cameraState: {
    progress: number;                                       // 0 at the name plate, 1 at the contact panel
    stage: number;                                          // index into stages of the unit in view
    lenis: Lenis | null;                                    // smooth scroller (null with reduced motion)
    goTo: (stageId: string, duration: number) => void;      // glide the camera to a stage
    firePacket: (cableId: string, duration: number) => void; // send one big packet down a cable
} = {
    progress: 0,
    stage: 0,
    lenis: null,
    goTo: () => { },
    firePacket: () => { },
};

// ---------- stage changes (the HUD listens to these) ----------
const listeners = new Set<(i: number) => void>();

export function setStage(i: number) {
    if (i === cameraState.stage) return;
    cameraState.stage = i;
    listeners.forEach((fn) => fn(i));
}

export function onStageChange(fn: (i: number) => void) {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
}

// ---------- jump to a stage, with a packet down the cable if there is one ----------
export function jumpTo(stageId: string, cable?: string) {
    // longer trips take a little longer, so far jumps don't feel like teleports
    const from = Math.round(cameraState.progress * (stages.length - 1));
    const to = stages.findIndex((s) => s.id === stageId);
    const duration = Math.min(2.2, 0.9 + 0.25 * Math.abs(to - from));

    cameraState.goTo(stageId, duration);
    if (cable) cameraState.firePacket(cable, duration);
}