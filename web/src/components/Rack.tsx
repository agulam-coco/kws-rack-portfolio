import HeroFrame from "./units/HeroFrame";
import SwitchUnit from "./units/SwitchUnit";
import NowDisplay from "./units/NowDisplay";
import VentStrip from "./units/VentStrip";
import NodeShelf from "./units/NodeShelf";
import BuildsShelf from "./units/BuildsShelf";
import BottomPanel from "./units/BottomPanel";
import RackHandle from "./units/RackHandle";

export default function Rack() {
    return (
        <div className="rack">
            {/* behind everything */}
            <span className="rack-wall-shadow" />
            <span className="rack-desk-shadow" />
            <span className="rack-back" />
            <span className="rack-side2d" />
            <span className="rail l" /><span className="rail r" />
            <span className="rack-top" />
            <span className="rack-side" />
            <span className="rack-shadow" />
            <RackHandle side="l" />
            <RackHandle side="r" />

            <HeroFrame />
            <SwitchUnit />
            <NowDisplay />
            <VentStrip />
            <NodeShelf />
            <BuildsShelf />
            <BottomPanel />

            {/* color grade + lamp lighting, on top of everything */}
            <span className="rack-grade" />
            <span className="rack-light" />
            <span className="rack-rim" />
        </div>
    );
}