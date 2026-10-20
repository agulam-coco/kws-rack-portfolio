import { ROOM } from "../data/room";

// bulb centers measured from room-bg.png (image pixels)
const BULBS = [
    [147, 119], [278, 119], [399, 119], [526, 121], [662, 119], [822, 119],
    [965, 121], [1102, 119], [1235, 119], [1362, 118], [1489, 121],
];

export default function FairyLights() {
    return (
        <div className="fairy">
            {BULBS.map(([x, y], i) => (
                <i
                    key={i}
                    style={{
                        left: `${(x / ROOM.w) * 100}%`,
                        top: `${(y / ROOM.h) * 100}%`,
                        animationDelay: `${((i * 0.37) % 2.3).toFixed(2)}s`,
                        animationDuration: `${2.2 + (i % 3) * 0.6}s`,
                    }}
                />
            ))}
        </div>
    );
}