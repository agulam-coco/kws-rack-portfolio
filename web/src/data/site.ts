export const person = {
    name: "Jason Chigabatia",
    role: "CS + Linguistics @ Grinnell '28",
    email: "chigabat@grinnell.edu",
    linkedin: "https://linkedin.com/in/jason-chigabatia",
    github: "https://github.com/agulam-coco",
};

export const stages = [
    {
        id: "overview",
        label: "/01 overview",
        title: person.name,
        body: "CS and Linguistics at Grinnell, class of 2028. I write software, and lately a lot of it runs on hardware I can actually hold.",
    },
    {
        id: "network",
        label: "/02 network",
        title: "This switch is the menu",
        body: "Each port has a cable running to a different part of the rack. Click one and the page follows the cable there.",
    },
    {
        id: "now",
        label: "/03 now",
        title: "Right now",
        body: "What I'm working on this semester. I update it when things change.",
    },
    {
        id: "projects",
        label: "/04 projects",
        title: "Projects",
        body: "Each machine is something I built. Hover over one to see what it is, and click to open it.",
    },
    {
        id: "builds",
        label: "/05 builds",
        title: "Off the screen",
        body: "Things I've made or put together that aren't just code.",
    },
    {
        id: "contact",
        label: "/06 contact",
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

export const now = [
    ["building", "this rack"],
    ["learning", "embedded audio"],
    ["based in", "Grinnell, IA"],
];

export const experience = [
    { org: "Mid City Engineering", role: "SWE Intern", when: "Summer 2026" },
    { org: "P3+Uplift", role: "SWE Intern", when: "TODO" },
    { org: "ColorStack", role: "Outreach Marketing Chair", when: "Current" },
    { org: "Freesound", role: "Manager", when: "Current" },
];