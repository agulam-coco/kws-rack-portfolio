import type Lenis from "lenis";

// Shared, mutable state for the rack, written and read without re-renders.
// - useRackCamera fills in progress and goTo
// - useLenis fills in lenis
// - Cables fills in firePacket
export const cameraState: {
    progress: number;                                       // 0 at the name plate, 1 at the contact panel
    lenis: Lenis | null;                                    // smooth scroller (null with reduced motion)
    goTo: (stageId: string, duration: number) => void;      // glide the camera to a stage
    firePacket: (cableId: string, duration: number) => void; // send one big packet down a cable
} = {
    progress: 0,
    lenis: null,
    goTo: () => {},
    firePacket: () => {},
};