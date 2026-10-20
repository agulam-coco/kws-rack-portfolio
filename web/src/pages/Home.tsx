import Rack from "../components/Rack";
import { stages } from "../data/site";

export default function Home() {
    const s = stages[0]; // becomes dynamic while scrolling
    return (
        <main className="home">
            <div className="rack-col"><Rack /></div>
            <aside className="captions">
                <p className="cap-label">{s.label}</p>
                <h2 className="cap-title">{s.title}</h2>
                <p className="cap-body">{s.body}</p>
            </aside>
        </main>
    );
}