export const person = {
    name: "Jason Chigabatia",
    role: "CS + Linguistics @ Grinnell '28",
    email: "chigabat@grinnell.edu",
    linkedin: "https://linkedin.com/in/jason-chigabatia",
    github: "https://github.com/agulam-coco",
    resume: "/resume.pdf",

};

// Short intro under your name in the top-left corner. Keep it to 2 or 3 short
// paragraphs so it never runs into the section rail.
export const about = {
    paragraphs: [
        "I build software, and lately a lot of it runs on hardware I can hold: tiny screens, a Pi in my dorm, and this rack.",
        "At Grinnell I study CS and Linguistics, run Freesound, and am involved on campus",
    ],
};

// hint: shown above the tab bar on touch screens (no hover there), so people
// know what they can tap. Leave it "" for shelves with nothing to tap.
export const stages = [
    {
        id: "overview",
        label: "/01 overview",
        hint: "scroll down, it's a whole rack",
        title: person.name,
        body: "CS and Linguistics at Grinnell, class of 2028. I write software, and lately a lot of it runs on hardware I can actually hold.",
    },
    {
        id: "network",
        label: "/02 network",
        hint: "the ports work, tap one",
        title: "This switch is the menu",
        body: "Each port has a cable running to a different part of the rack. Click one and the page follows the cable there.",
    },
    {
        id: "now",
        label: "/03 now",
        hint: "",
        title: "Right now",
        body: "What I'm working on this semester. I update it when things change.",
    },
    {
        id: "projects",
        label: "/04 projects",
        hint: "tap a drive, they're my projects",
        title: "Projects",
        body: "Each machine is something I built. Hover over one to see what it is, and click to open it.",
    },
    {
        id: "builds",
        label: "/05 builds",
        hint: "the amp and the pi open too",
        title: "Off the screen",
        body: "Things I've made or put together that aren't just code.",
    },
    {
        id: "contact",
        label: "/06 contact",
        hint: "",
        title: "Contact",
        body: "Where I've worked, what I help run on campus, and how to reach me.",
    },
] as const;

export type StageId = (typeof stages)[number]["id"];

// Each port has a cable that runs to the jack with the same id.
export const ports: { label: string; stage: StageId; cable: string }[] = [
    { label: "HOME", stage: "overview", cable: "home" },
    { label: "ABOUT", stage: "now", cable: "about" },
    { label: "WMT", stage: "projects", cable: "watch-my-tokens" },
    { label: "FISSURE", stage: "projects", cable: "fissure" },
    { label: "FREESOUND", stage: "projects", cable: "freesound" },
    { label: "BUILDS", stage: "builds", cable: "builds" },
    { label: "CONTACT", stage: "contact", cable: "contact" },
    { label: "SFP", stage: "overview", cable: "" }
];

// Each row types out its first value, then rows with more than one value
// take turns: erase, type the next one, wait, repeat.
// Keep values under ~24 characters so they fit on the screen.
export const now: { key: string; values: string[] }[] = [
    { key: "building", values: ["this rack", "the cable system", "a hackathon at Grinnell"] },
    { key: "learning", values: ["embedded audio", "GSAP + scroll"] },
    { key: "based in", values: ["Grinnell, IA"] },
];

// Contact panel. Keep each "did" line under ~55 characters so it fits on one line.
export const experience = [
    { org: "Mid City Engineering", role: "SWE Intern", when: "Summer 2026", did: "Next.js dashboards on Odoo, ESP32 display firmware" },
    { org: "P3+Uplift", role: "SWE Intern", when: "Summer 2025", did: "TensorFlow CNN + AWS Lambda alerts for livestock feed" },
];

// One line on the contact panel, like a spec label. Five or six max.
export const stack = ["C", "TypeScript", "Python", "ESP-IDF", "Next.js", "Linux"];
