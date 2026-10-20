import HeroFrame from "./units/HeroFrame";
import SwitchUnit from "./units/SwitchUnit";
import NowDisplay from "./units/NowDisplay";
import VentStrip from "./units/VentStrip";
import NodeShelf from "./units/NodeShelf";
import BuildsShelf from "./units/BuildsShelf";
import BottomPanel from "./units/BottomPanel";

export default function Rack() {
    return (
        <div className="rack">
            <span className="rail l" /><span className="rail r" />
            <HeroFrame />
            <SwitchUnit />
            <NowDisplay />
            <VentStrip />
            <NodeShelf />
            <BuildsShelf />
            <BottomPanel />
        </div>
    );
}