// Shared, mutable scroll state written by useRackCamera and read every frame
// by things like the cable packets. Plain object on purpose: no re-renders.
export const cameraState = {
    progress: 0,  // 0 at the name plate, 1 at the contact panel
};