export default function Loader({ progress, done }: { progress: number; done: boolean }) {
    return (
        <div className={`loader ${done ? "is-done" : ""}`} role="status" aria-live="polite">
            <div className="loader-inner">
                <p className="loader-line">booting rack-01</p>
                <div className="loader-bar">
                    <i style={{ transform: `scaleX(${progress})` }} />
                </div>
                <p className="loader-pct">{Math.round(progress * 100)}%</p>
            </div>
        </div>
    );
}