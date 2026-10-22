import FairyLights from "./FairyLights";
import { ROOM_SRC } from "../lib/intro";

// back layer (wall + desk, behind the rack), front layer (chair + rug, in front)
export default function Room({ layer }: { layer: "back" | "front" }) {
  return (
    <div className={`room room-${layer}`} aria-hidden>
      {layer === "back" ? (
        <>
          <img className="room-bg" src={ROOM_SRC.bg} alt="" />
          <img className="room-bg-blur" src={ROOM_SRC.bgBlur} alt="" />
          <img className="room-desk-empty" src={ROOM_SRC.deskEmpty} alt="" />
          <img className="room-desk-empty-blur" src={ROOM_SRC.deskEmptyBlur} alt="" />
          <img className="room-desk" src={ROOM_SRC.desk} alt="" />
          <FairyLights />
        </>
      ) : (
        <img className="room-fg" src={ROOM_SRC.fg} alt="" />
      )}
    </div>
  );
}
