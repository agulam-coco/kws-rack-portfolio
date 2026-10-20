import { useEffect, useRef, useState } from "react";
import Rack from "../components/Rack";
import Room from "../components/Room";
import Loader from "../components/Loader";
import { useRackCamera } from "../hooks/useRackCamera";
import { useLenis } from "../hooks/useLenis";
import { preloadAll } from "../lib/preload";

export default function Home() {
    const scene = useRef<HTMLElement>(null);
    const [progress, setProgress] = useState(0);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        preloadAll(setProgress).then(() => setReady(true));
    }, []);

    useLenis();
    useRackCamera(scene, ready);

    return (
        <>
            <Loader progress={progress} done={ready} />
            <main ref={scene} className="scene">
                <div className="viewport">
                    <div className="camera">
                        <div className="tilt">
                            <Room layer="back" />
                            <Rack />
                            <Room layer="front" />
                        </div>
                    </div>
                </div>
            </main>
            <div className="grain" aria-hidden />

        </>
    );
}