export default function PiUnit({ color }: { color: string }) {
    return (
        <div className="pi" style={{ "--accent": color } as React.CSSProperties}>
            <span className="rj45" data-jack="builds" />
            <div className="pi-face">
                <div className="pi-vents" />
                <div className="oled">
                    <b>otter</b>
                    <span>up 12d · 41°C</span>
                </div>
                <div className="pi-leds">
                    <i className="led" />
                    <i className="led act" />
                </div>
            </div>
            <span className="unit-label">SERVER RACK</span>
        </div>
    );
}