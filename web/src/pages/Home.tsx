import { useRef } from "react";
import Rack from "../components/Rack";
import { useRackCamera } from "../hooks/useRackCamera";
import { useLenis } from "../hooks/useLenis";

export default function Home() {
    const scene = useRef<HTMLElement>(null);
    useLenis();
    useRackCamera(scene);

    return (
        <main ref={scene} className="scene">
            <div className="viewport">
                <div className="camera">   {/* pan + zoom */}
                    <div className="tilt">   {/* 3D rotation only */}
                        <Rack />
                    </div>
                </div>
            </div>
        </main>
    );
}