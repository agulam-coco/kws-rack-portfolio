import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import ProjectPage from "./pages/ProjectPage";
import NotFound from "./pages/NotFound";
import Snapshot from "./pages/Snapshot";


export const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/projects/:slug", element: <ProjectPage /> },
    { path: "/snapshot", element: <Snapshot /> },
    { path: "*", element: <NotFound /> },
]);