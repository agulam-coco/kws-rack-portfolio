import { Link } from "react-router";

export default function NotFound() {
    return (
        <main>
            <h1>404: node not found in rack</h1>
            <Link to="/">← back to rack</Link>
        </main>
    );
}
