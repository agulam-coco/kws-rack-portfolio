import Rack from "../components/Rack";

// Dev-only page for grabbing a clean image of the rack.
// Visit /snapshot, then screenshot the .rack element.
export default function Snapshot() {
    return (
        <main className="snapshot">
            <Rack />
        </main>
    );
}