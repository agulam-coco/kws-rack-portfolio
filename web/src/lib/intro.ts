// Decided once when the page loads, before anything renders.

// ---------- returning visitors skip the intro ----------
// The push-in only plays the first time. Visit /?intro to see it again.
const SEEN_KEY = "rack-intro-seen";

function introSeen() {
    if (new URLSearchParams(location.search).has("intro")) return false;
    try { return localStorage.getItem(SEEN_KEY) === "1"; } catch { return false; }
}

export function markIntroSeen() {
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* private mode etc. */ }
}

export const SKIP_INTRO = introSeen();
// hud.css uses this to show the side text right away
if (SKIP_INTRO) document.documentElement.dataset.intro = "seen";

// ---------- phones get lighter assets ----------
export const IS_PHONE = window.matchMedia("(max-width: 700px)").matches;

// Room images. With the intro skipped, only the blurred layers ever show,
// so the sharp ones (and the chair) aren't downloaded at all.
const room = (f: string) => `/media/room/${f}`;
export const ROOM_SRC = {
    bg: SKIP_INTRO ? undefined : room("room-bg.webp"),
    bgBlur: room("room-bg-blur.webp"),
    deskEmpty: SKIP_INTRO ? undefined : room("room-desk-empty.webp"),
    deskEmptyBlur: room("room-desk-empty-blur.webp"),
    desk: SKIP_INTRO ? undefined : room("room-desk.webp"),
    // the chair is drawn at 2x for big screens; phones get the 1x version
    fg: SKIP_INTRO ? undefined : room(IS_PHONE ? "room-fg-sm.webp" : "room-fg.webp"),
};
