import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import ProjectPage from "./pages/ProjectPage";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/projects/:slug", element: <ProjectPage /> },
    { path: "*", element: <NotFound /> },
]);