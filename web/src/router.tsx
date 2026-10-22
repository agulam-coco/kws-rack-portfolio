import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Home loads right away. The write-up and snapshot pages are split into their
// own files and only download when someone opens them, so the first visit
// doesn't pay for code it isn't using.
export const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/projects/:slug", lazy: () => import("./pages/ProjectPage").then((m) => ({ Component: m.default })) },
    { path: "/snapshot", lazy: () => import("./pages/Snapshot").then((m) => ({ Component: m.default })) },
    { path: "*", element: <NotFound /> },
]);
