import FairyLights from "./FairyLights";

// back layer (wall + desk, behind the rack), front layer (chair + rug, in front)
export default function Room({ layer }: { layer: "back" | "front" }) {
  return (
    <div className={`room room-${layer}`} aria-hidden>
      {layer === "back" ? (
        <>
          <img className="room-bg" src="/media/room/room-bg.png" alt="" />
          <img className="room-bg-blur" src="/media/room/room-bg-blur.webp" alt="" />
          <img className="room-desk-empty" src="/media/room/room-desk-empty.png" alt="" />
          <img className="room-desk-empty-blur" src="/media/room/room-desk-empty-blur.webp" alt="" />
          <img className="room-desk" src="/media/room/room-desk.png" alt="" />
          <FairyLights />
        </>
      ) : (
        <img className="room-fg" src="/media/room/room-fg.png" alt="" />
      )}
    </div>
  );
}